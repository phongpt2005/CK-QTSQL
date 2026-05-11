import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

/**
 * Represents a single allocation entry within a draft.
 */
export interface DraftAllocation {
  warehouseId: number;
  warehouseName?: string;
  locationId: number;
  locationCode?: string;
  availableQty: number;
  allocatedQty: number;
}

/**
 * Represents a draft reservation for a product.
 */
export interface DraftReservation {
  draftId: string;
  userId: number;
  productId: number;
  productName: string;
  requiredQty: number;
  allocations: DraftAllocation[];
  createdAt: number;
  confirmed: boolean;
}

/**
 * AllocationService manages Draft Reservations in memory.
 * 
 * Draft Reservations are temporary stock holds that:
 * - Reduce available stock for other users in real-time
 * - Auto-expire after 5 minutes if not confirmed
 * - Are committed when the user confirms the allocation
 */
@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);
  private readonly drafts = new Map<string, DraftReservation>();
  private readonly DRAFT_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private prisma: PrismaService) {
    // Auto-cleanup expired drafts every 30 seconds
    this.cleanupInterval = setInterval(() => this.cleanupExpiredDrafts(), 30_000);
  }

  /**
   * Generate a unique draft ID.
   */
  private generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Look up product info and available stock at all locations,
   * then run the auto-suggest allocation algorithm.
   */
  async suggestAllocation(
    userId: number,
    productCode: string,
    requiredQty: number,
  ): Promise<DraftReservation | null> {
    // 1. Look up product by code
    const product = await this.prisma.reader.product.findUnique({
      where: { productCode },
      select: { id: true, productName: true, productCode: true },
    });

    if (!product) {
      this.logger.warn(`Product not found: ${productCode}`);
      return null;
    }

    // 2. Fetch all inventory positions for this product
    const inventories = await this.prisma.reader.inventory.findMany({
      where: { productId: product.id },
      include: {
        warehouse: { select: { id: true, warehouseName: true } },
        location: { select: { id: true, locationCode: true } },
      },
    });

    // 3. Fetch active reservations (confirmed sales order holds)
    const reservations = await this.prisma.reader.stockReservation.groupBy({
      by: ['productId', 'warehouseId', 'locationId'],
      where: { productId: product.id, status: 'Active' },
      _sum: { reservedQty: true },
    });

    const reservationMap = new Map<string, number>();
    for (const r of reservations) {
      const key = `${r.warehouseId}-${r.locationId}`;
      reservationMap.set(key, r._sum.reservedQty || 0);
    }

    // 4. Calculate available qty (minus reservations AND other active drafts)
    const otherDraftsForProduct = this.getDraftsForProduct(product.id, userId);

    const draftHoldMap = new Map<string, number>();
    for (const d of otherDraftsForProduct) {
      for (const a of d.allocations) {
        const key = `${a.warehouseId}-${a.locationId}`;
        draftHoldMap.set(key, (draftHoldMap.get(key) || 0) + a.allocatedQty);
      }
    }

    const stockLocations: DraftAllocation[] = inventories
      .map((inv) => {
        const key = `${inv.warehouseId}-${inv.locationId}`;
        const reserved = reservationMap.get(key) || 0;
        const draftHold = draftHoldMap.get(key) || 0;
        const available = inv.quantity - reserved - draftHold;
        return {
          warehouseId: inv.warehouseId!,
          warehouseName: inv.warehouse?.warehouseName || '',
          locationId: inv.locationId!,
          locationCode: inv.location?.locationCode || '',
          availableQty: Math.max(0, available),
          allocatedQty: 0,
        };
      })
      .filter((loc) => loc.availableQty > 0)
      .sort((a, b) => b.availableQty - a.availableQty); // Most stock first

    // 5. Run auto-suggest algorithm: fill from largest stock first
    let remaining = requiredQty;
    for (const loc of stockLocations) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, loc.availableQty);
      loc.allocatedQty = take;
      remaining -= take;
    }

    // 6. Create draft
    const draftId = this.generateDraftId();
    const draft: DraftReservation = {
      draftId,
      userId,
      productId: product.id,
      productName: product.productName,
      requiredQty,
      allocations: stockLocations,
      createdAt: Date.now(),
      confirmed: false,
    };

    this.drafts.set(draftId, draft);
    this.logger.log(`Draft created: ${draftId} for product ${product.productCode}, user ${userId}`);

    return draft;
  }

  /**
   * Update allocations in an existing draft.
   */
  updateDraft(draftId: string, allocations: DraftAllocation[]): DraftReservation | null {
    const draft = this.drafts.get(draftId);
    if (!draft || draft.confirmed) return null;

    draft.allocations = allocations;
    draft.createdAt = Date.now(); // Reset TTL
    this.drafts.set(draftId, draft);
    this.logger.log(`Draft updated: ${draftId}`);

    return draft;
  }

  /**
   * Confirm a draft reservation.
   */
  confirmDraft(draftId: string): DraftReservation | null {
    const draft = this.drafts.get(draftId);
    if (!draft) return null;

    draft.confirmed = true;
    this.drafts.set(draftId, draft);
    this.logger.log(`Draft confirmed: ${draftId}`);

    return draft;
  }

  /**
   * Cancel a draft reservation, releasing held stock.
   */
  cancelDraft(draftId: string): boolean {
    const draft = this.drafts.get(draftId);
    if (!draft) return false;

    this.drafts.delete(draftId);
    this.logger.log(`Draft cancelled: ${draftId}`);
    return true;
  }

  /**
   * Get a specific draft by ID.
   */
  getDraft(draftId: string): DraftReservation | null {
    return this.drafts.get(draftId) || null;
  }

  /**
   * Get all active (non-confirmed, non-expired) drafts for a product,
   * optionally excluding a specific user's drafts.
   */
  getDraftsForProduct(productId: number, excludeUserId?: number): DraftReservation[] {
    const now = Date.now();
    const result: DraftReservation[] = [];
    for (const draft of this.drafts.values()) {
      if (
        draft.productId === productId &&
        !draft.confirmed &&
        now - draft.createdAt < this.DRAFT_TTL_MS &&
        (excludeUserId === undefined || draft.userId !== excludeUserId)
      ) {
        result.push(draft);
      }
    }
    return result;
  }

  /**
   * Calculate the total draft-held quantity at a specific location for a product,
   * excluding a specific user.
   */
  getDraftHoldForLocation(
    productId: number,
    warehouseId: number,
    locationId: number,
    excludeUserId: number,
  ): number {
    const drafts = this.getDraftsForProduct(productId, excludeUserId);
    let total = 0;
    for (const d of drafts) {
      for (const a of d.allocations) {
        if (a.warehouseId === warehouseId && a.locationId === locationId) {
          total += a.allocatedQty;
        }
      }
    }
    return total;
  }

  /**
   * Cancel all drafts for a user (e.g., on disconnect).
   */
  cancelAllDraftsForUser(userId: number): string[] {
    const cancelled: string[] = [];
    for (const [draftId, draft] of this.drafts.entries()) {
      if (draft.userId === userId && !draft.confirmed) {
        this.drafts.delete(draftId);
        cancelled.push(draftId);
      }
    }
    if (cancelled.length > 0) {
      this.logger.log(`Cancelled ${cancelled.length} drafts for user ${userId}`);
    }
    return cancelled;
  }

  /**
   * Remove expired drafts.
   */
  private cleanupExpiredDrafts(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [draftId, draft] of this.drafts.entries()) {
      if (!draft.confirmed && now - draft.createdAt >= this.DRAFT_TTL_MS) {
        this.drafts.delete(draftId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired drafts`);
    }
  }
}
