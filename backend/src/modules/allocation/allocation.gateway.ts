import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AllocationService, DraftAllocation } from './allocation.service';

/**
 * WebSocket Gateway for real-time allocation sync.
 * 
 * Room strategy:
 * - `user:{userId}` → Full sync for same user across devices (Mobile ↔ PC)
 * - `product:{productId}` → Stock sync for different users viewing same product
 * 
 * Events (Client → Server):
 * - `scan:product`  → Scan a product QR, get auto-suggest allocation
 * - `scan:location` → Scan a location QR for confirmation
 * - `draft:update`  → Update allocation quantities (debounced)
 * - `draft:confirm` → Confirm the allocation
 * - `draft:cancel`  → Cancel the allocation
 * 
 * Events (Server → Client):
 * - `modal:open`    → Open allocation modal with pre-filled data
 * - `modal:close`   → Close allocation modal
 * - `state:update`  → Sync allocation state across devices
 * - `stock:update`  → Notify other users of stock changes
 * - `location:confirmed` → Location QR confirmed
 * - `error`         → Error message
 */
@WebSocketGateway({
  namespace: '/allocation',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AllocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AllocationGateway.name);

  // Track which user is on which socket
  private socketUserMap = new Map<string, number>();

  constructor(private allocationService: AllocationService) {}

  // ─── Connection lifecycle ───

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (userId) {
      this.socketUserMap.set(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user:${userId})`);
    } else {
      this.logger.warn(`Client connected without userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      // Cancel all active drafts for this user
      const cancelled = this.allocationService.cancelAllDraftsForUser(userId);
      
      // Notify product rooms about stock release
      for (const draftId of cancelled) {
        // Draft is already deleted, but we logged it
      }
      
      this.socketUserMap.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id} (user:${userId})`);
    }
  }

  private extractUserId(client: Socket): number | null {
    const userId = client.handshake.query.userId || client.handshake.auth?.userId;
    return userId ? Number(userId) : null;
  }

  // ─── Scan Events ───

  /**
   * Client scans a product QR code.
   * Server looks up the product, runs auto-suggest, creates a draft,
   * and broadcasts the modal data to all devices of the same user.
   */
  @SubscribeMessage('scan:product')
  async handleScanProduct(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { productCode: string; requiredQty: number; targetUserId?: number },
  ) {
    const senderUserId = this.socketUserMap.get(client.id);
    if (!senderUserId) {
      client.emit('error', { message: 'Chưa xác thực. Vui lòng đăng nhập lại.' });
      return;
    }

    const { productCode, requiredQty, targetUserId } = data;
    const finalUserId = targetUserId || senderUserId;

    if (!productCode) {
      client.emit('error', { message: 'Mã sản phẩm không hợp lệ.' });
      return;
    }

    const qty = requiredQty || 1;

    try {
      // Allocate using finalUserId (the PC user who owns the order)
      const draft = await this.allocationService.suggestAllocation(finalUserId, productCode, qty);

      if (!draft) {
        client.emit('error', { message: `Không tìm thấy sản phẩm: ${productCode}` });
        return;
      }

      client.join(`product:${draft.productId}`);

      // Broadcast modal:open to the target user (PC)
      this.server.to(`user:${finalUserId}`).emit('modal:open', { draft });

      // If sender is different from target, also send to sender (Phone)
      if (senderUserId !== finalUserId) {
        client.emit('modal:open', { draft });
      }

      client.to(`product:${draft.productId}`).emit('stock:update', {
        productId: draft.productId,
        allocations: draft.allocations.map((a) => ({
          warehouseId: a.warehouseId,
          locationId: a.locationId,
          draftHoldQty: a.allocatedQty,
        })),
      });

      this.logger.log(`scan:product - sender:${senderUserId}, target:${finalUserId}, product:${productCode}, draft:${draft.draftId}`);
    } catch (error) {
      this.logger.error(`scan:product error: ${error.message}`);
      client.emit('error', { message: 'Có lỗi xảy ra khi quét sản phẩm.' });
    }
  }

  /**
   * Client scans a location QR code to confirm a specific position.
   */
  @SubscribeMessage('scan:location')
  handleScanLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { draftId: string; locationCode: string },
  ) {
    const senderUserId = this.socketUserMap.get(client.id);
    if (!senderUserId) return;

    const { draftId, locationCode } = data;
    const draft = this.allocationService.getDraft(draftId);

    if (!draft) {
      client.emit('error', { message: 'Draft không tồn tại.' });
      return;
    }

    const matchedAlloc = draft.allocations.find((a) => a.locationCode === locationCode);

    if (!matchedAlloc) {
      client.emit('error', { message: `Vị trí ${locationCode} không có trong danh sách phân bổ.` });
      return;
    }

    this.server.to(`user:${draft.userId}`).emit('location:confirmed', {
      draftId,
      locationCode,
      warehouseId: matchedAlloc.warehouseId,
      locationId: matchedAlloc.locationId,
    });
    
    if (senderUserId !== draft.userId) {
      client.emit('location:confirmed', {
        draftId,
        locationCode,
        warehouseId: matchedAlloc.warehouseId,
        locationId: matchedAlloc.locationId,
      });
    }

    this.logger.log(`scan:location - draftOwner:${draft.userId}, sender:${senderUserId}, location:${locationCode}`);
  }

  // ─── Draft CRUD Events ───

  /**
   * User updates allocation quantities (from UI).
   * Debounce is handled client-side; this receives final values.
   */
  @SubscribeMessage('draft:update')
  handleDraftUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { draftId: string; allocations: DraftAllocation[] },
  ) {
    const senderUserId = this.socketUserMap.get(client.id);
    if (!senderUserId) return;

    const { draftId, allocations } = data;
    const draft = this.allocationService.getDraft(draftId);

    if (!draft) {
      client.emit('error', { message: 'Draft không tồn tại.' });
      return;
    }

    const updated = this.allocationService.updateDraft(draftId, allocations);
    if (!updated) return;

    // We emit to the draft owner
    this.server.to(`user:${draft.userId}`).emit('state:update', { draft: updated });
    
    // And back to sender if different
    if (senderUserId !== draft.userId) {
      client.emit('state:update', { draft: updated });
    }

    client.to(`product:${draft.productId}`).emit('stock:update', {
      productId: draft.productId,
      allocations: updated.allocations.map((a) => ({
        warehouseId: a.warehouseId,
        locationId: a.locationId,
        draftHoldQty: a.allocatedQty,
      })),
    });
  }

  /**
   * User confirms the allocation.
   */
  @SubscribeMessage('draft:confirm')
  handleDraftConfirm(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { draftId: string },
  ) {
    const senderUserId = this.socketUserMap.get(client.id);
    if (!senderUserId) return;

    const { draftId } = data;
    const draft = this.allocationService.getDraft(draftId);

    if (!draft) {
      client.emit('error', { message: 'Draft không tồn tại.' });
      return;
    }

    const confirmed = this.allocationService.confirmDraft(draftId);
    if (!confirmed) return;

    this.server.to(`user:${draft.userId}`).emit('modal:close', {
      draftId,
      draft: confirmed,
    });
    
    if (senderUserId !== draft.userId) {
      client.emit('modal:close', { draftId, draft: confirmed });
    }

    this.logger.log(`draft:confirm - owner:${draft.userId}, sender:${senderUserId}, draft:${draftId}`);
  }

  /**
   * User cancels the allocation.
   */
  @SubscribeMessage('draft:cancel')
  handleDraftCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { draftId: string },
  ) {
    const senderUserId = this.socketUserMap.get(client.id);
    if (!senderUserId) return;

    const { draftId } = data;
    const draft = this.allocationService.getDraft(draftId);

    if (!draft) return;

    const productId = draft.productId;
    const draftOwnerId = draft.userId;
    this.allocationService.cancelDraft(draftId);

    this.server.to(`user:${draftOwnerId}`).emit('modal:close', { draftId, cancelled: true });
    
    if (senderUserId !== draftOwnerId) {
      client.emit('modal:close', { draftId, cancelled: true });
    }

    client.to(`product:${productId}`).emit('stock:update', {
      productId,
      released: true,
    });

    this.logger.log(`draft:cancel - owner:${draftOwnerId}, sender:${senderUserId}, draft:${draftId}`);
  }
}
