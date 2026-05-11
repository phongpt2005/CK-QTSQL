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
var AllocationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let AllocationService = AllocationService_1 = class AllocationService {
    prisma;
    logger = new common_1.Logger(AllocationService_1.name);
    drafts = new Map();
    DRAFT_TTL_MS = 5 * 60 * 1000;
    cleanupInterval;
    constructor(prisma) {
        this.prisma = prisma;
        this.cleanupInterval = setInterval(() => this.cleanupExpiredDrafts(), 30_000);
    }
    generateDraftId() {
        return `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    async suggestAllocation(userId, productCode, requiredQty) {
        const product = await this.prisma.reader.product.findUnique({
            where: { productCode },
            select: { id: true, productName: true, productCode: true },
        });
        if (!product) {
            this.logger.warn(`Product not found: ${productCode}`);
            return null;
        }
        const inventories = await this.prisma.reader.inventory.findMany({
            where: { productId: product.id },
            include: {
                warehouse: { select: { id: true, warehouseName: true } },
                location: { select: { id: true, locationCode: true } },
            },
        });
        const reservations = await this.prisma.reader.stockReservation.groupBy({
            by: ['productId', 'warehouseId', 'locationId'],
            where: { productId: product.id, status: 'Active' },
            _sum: { reservedQty: true },
        });
        const reservationMap = new Map();
        for (const r of reservations) {
            const key = `${r.warehouseId}-${r.locationId}`;
            reservationMap.set(key, r._sum.reservedQty || 0);
        }
        const otherDraftsForProduct = this.getDraftsForProduct(product.id, userId);
        const draftHoldMap = new Map();
        for (const d of otherDraftsForProduct) {
            for (const a of d.allocations) {
                const key = `${a.warehouseId}-${a.locationId}`;
                draftHoldMap.set(key, (draftHoldMap.get(key) || 0) + a.allocatedQty);
            }
        }
        const stockLocations = inventories
            .map((inv) => {
            const key = `${inv.warehouseId}-${inv.locationId}`;
            const reserved = reservationMap.get(key) || 0;
            const draftHold = draftHoldMap.get(key) || 0;
            const available = inv.quantity - reserved - draftHold;
            return {
                warehouseId: inv.warehouseId,
                warehouseName: inv.warehouse?.warehouseName || '',
                locationId: inv.locationId,
                locationCode: inv.location?.locationCode || '',
                availableQty: Math.max(0, available),
                allocatedQty: 0,
            };
        })
            .filter((loc) => loc.availableQty > 0)
            .sort((a, b) => b.availableQty - a.availableQty);
        let remaining = requiredQty;
        for (const loc of stockLocations) {
            if (remaining <= 0)
                break;
            const take = Math.min(remaining, loc.availableQty);
            loc.allocatedQty = take;
            remaining -= take;
        }
        const draftId = this.generateDraftId();
        const draft = {
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
    updateDraft(draftId, allocations) {
        const draft = this.drafts.get(draftId);
        if (!draft || draft.confirmed)
            return null;
        draft.allocations = allocations;
        draft.createdAt = Date.now();
        this.drafts.set(draftId, draft);
        this.logger.log(`Draft updated: ${draftId}`);
        return draft;
    }
    confirmDraft(draftId) {
        const draft = this.drafts.get(draftId);
        if (!draft)
            return null;
        draft.confirmed = true;
        this.drafts.set(draftId, draft);
        this.logger.log(`Draft confirmed: ${draftId}`);
        return draft;
    }
    cancelDraft(draftId) {
        const draft = this.drafts.get(draftId);
        if (!draft)
            return false;
        this.drafts.delete(draftId);
        this.logger.log(`Draft cancelled: ${draftId}`);
        return true;
    }
    getDraft(draftId) {
        return this.drafts.get(draftId) || null;
    }
    getDraftsForProduct(productId, excludeUserId) {
        const now = Date.now();
        const result = [];
        for (const draft of this.drafts.values()) {
            if (draft.productId === productId &&
                !draft.confirmed &&
                now - draft.createdAt < this.DRAFT_TTL_MS &&
                (excludeUserId === undefined || draft.userId !== excludeUserId)) {
                result.push(draft);
            }
        }
        return result;
    }
    getDraftHoldForLocation(productId, warehouseId, locationId, excludeUserId) {
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
    cancelAllDraftsForUser(userId) {
        const cancelled = [];
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
    cleanupExpiredDrafts() {
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
};
exports.AllocationService = AllocationService;
exports.AllocationService = AllocationService = AllocationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllocationService);
//# sourceMappingURL=allocation.service.js.map