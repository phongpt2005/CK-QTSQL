"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AllocationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllocationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const allocation_service_1 = require("./allocation.service");
let AllocationGateway = AllocationGateway_1 = class AllocationGateway {
    allocationService;
    server;
    logger = new common_1.Logger(AllocationGateway_1.name);
    socketUserMap = new Map();
    constructor(allocationService) {
        this.allocationService = allocationService;
    }
    handleConnection(client) {
        const userId = this.extractUserId(client);
        if (userId) {
            this.socketUserMap.set(client.id, userId);
            client.join(`user:${userId}`);
            this.logger.log(`Client connected: ${client.id} (user:${userId})`);
        }
        else {
            this.logger.warn(`Client connected without userId: ${client.id}`);
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            const cancelled = this.allocationService.cancelAllDraftsForUser(userId);
            for (const draftId of cancelled) {
            }
            this.socketUserMap.delete(client.id);
            this.logger.log(`Client disconnected: ${client.id} (user:${userId})`);
        }
    }
    extractUserId(client) {
        const userId = client.handshake.query.userId || client.handshake.auth?.userId;
        return userId ? Number(userId) : null;
    }
    async handleScanProduct(client, data) {
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
            const draft = await this.allocationService.suggestAllocation(finalUserId, productCode, qty);
            if (!draft) {
                client.emit('error', { message: `Không tìm thấy sản phẩm: ${productCode}` });
                return;
            }
            client.join(`product:${draft.productId}`);
            this.server.to(`user:${finalUserId}`).emit('modal:open', { draft });
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
        }
        catch (error) {
            this.logger.error(`scan:product error: ${error.message}`);
            client.emit('error', { message: 'Có lỗi xảy ra khi quét sản phẩm.' });
        }
    }
    handleScanLocation(client, data) {
        const senderUserId = this.socketUserMap.get(client.id);
        if (!senderUserId)
            return;
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
    handleDraftUpdate(client, data) {
        const senderUserId = this.socketUserMap.get(client.id);
        if (!senderUserId)
            return;
        const { draftId, allocations } = data;
        const draft = this.allocationService.getDraft(draftId);
        if (!draft) {
            client.emit('error', { message: 'Draft không tồn tại.' });
            return;
        }
        const updated = this.allocationService.updateDraft(draftId, allocations);
        if (!updated)
            return;
        this.server.to(`user:${draft.userId}`).emit('state:update', { draft: updated });
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
    handleDraftConfirm(client, data) {
        const senderUserId = this.socketUserMap.get(client.id);
        if (!senderUserId)
            return;
        const { draftId } = data;
        const draft = this.allocationService.getDraft(draftId);
        if (!draft) {
            client.emit('error', { message: 'Draft không tồn tại.' });
            return;
        }
        const confirmed = this.allocationService.confirmDraft(draftId);
        if (!confirmed)
            return;
        this.server.to(`user:${draft.userId}`).emit('modal:close', {
            draftId,
            draft: confirmed,
        });
        if (senderUserId !== draft.userId) {
            client.emit('modal:close', { draftId, draft: confirmed });
        }
        this.logger.log(`draft:confirm - owner:${draft.userId}, sender:${senderUserId}, draft:${draftId}`);
    }
    handleDraftCancel(client, data) {
        const senderUserId = this.socketUserMap.get(client.id);
        if (!senderUserId)
            return;
        const { draftId } = data;
        const draft = this.allocationService.getDraft(draftId);
        if (!draft)
            return;
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
};
exports.AllocationGateway = AllocationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AllocationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('scan:product'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AllocationGateway.prototype, "handleScanProduct", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('scan:location'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AllocationGateway.prototype, "handleScanLocation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('draft:update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AllocationGateway.prototype, "handleDraftUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('draft:confirm'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AllocationGateway.prototype, "handleDraftConfirm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('draft:cancel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AllocationGateway.prototype, "handleDraftCancel", null);
exports.AllocationGateway = AllocationGateway = AllocationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/allocation',
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [allocation_service_1.AllocationService])
], AllocationGateway);
//# sourceMappingURL=allocation.gateway.js.map