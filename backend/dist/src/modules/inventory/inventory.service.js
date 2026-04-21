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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const constants_1 = require("../../common/constants");
let InventoryService = InventoryService_1 = class InventoryService {
    prisma;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.warehouseId)
            where.warehouseId = query.warehouseId;
        if (query.productId)
            where.productId = query.productId;
        if (query.locationId)
            where.locationId = query.locationId;
        const [data, total] = await Promise.all([
            this.prisma.inventory.findMany({
                where,
                include: {
                    product: { select: { id: true, productCode: true, productName: true } },
                    warehouse: { select: { id: true, warehouseName: true } },
                    location: { select: { id: true, locationCode: true } },
                },
                skip,
                take: limit,
                orderBy: { lastUpdated: 'desc' },
            }),
            this.prisma.inventory.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findByProduct(productId) {
        const inventories = await this.prisma.inventory.findMany({
            where: { productId },
            include: {
                product: { select: { id: true, productCode: true, productName: true } },
                warehouse: { select: { id: true, warehouseName: true } },
                location: { select: { id: true, locationCode: true } },
            },
        });
        const reservations = await this.prisma.stockReservation.groupBy({
            by: ['productId', 'warehouseId', 'locationId'],
            where: {
                productId,
                status: 'Active',
            },
            _sum: { reservedQty: true },
        });
        const reservationMap = new Map();
        for (const r of reservations) {
            const key = `${r.productId}-${r.warehouseId}-${r.locationId}`;
            reservationMap.set(key, r._sum.reservedQty || 0);
        }
        const result = inventories.map((inv) => {
            const key = `${inv.productId}-${inv.warehouseId}-${inv.locationId}`;
            const reserved = reservationMap.get(key) || 0;
            return {
                ...inv,
                reservedQty: reserved,
                availableQty: inv.quantity - reserved,
            };
        });
        const totalStock = result.reduce((sum, r) => sum + r.quantity, 0);
        const totalReserved = result.reduce((sum, r) => sum + r.reservedQty, 0);
        const totalAvailable = result.reduce((sum, r) => sum + r.availableQty, 0);
        return {
            productId,
            totalStock,
            totalReserved,
            totalAvailable,
            details: result,
        };
    }
    async getTransactions(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.productId)
            where.productId = query.productId;
        if (query.warehouseId)
            where.warehouseId = query.warehouseId;
        const [data, total] = await Promise.all([
            this.prisma.inventoryTransaction.findMany({
                where,
                include: {
                    product: { select: { id: true, productCode: true, productName: true } },
                    warehouse: { select: { id: true, warehouseName: true } },
                },
                skip,
                take: limit,
                orderBy: { transactionDate: 'desc' },
            }),
            this.prisma.inventoryTransaction.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async increaseStock(tx, productId, warehouseId, locationId, qty, refType, refId, note) {
        if (qty <= 0) {
            throw new common_1.BadRequestException('Quantity must be positive');
        }
        this.logger.log(`increaseStock: product=${productId}, warehouse=${warehouseId}, location=${locationId}, qty=${qty}, ref=${refType}#${refId}`);
        const existing = await tx.$queryRaw `
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;
        if (existing.length > 0) {
            await tx.inventory.update({
                where: { id: existing[0].id },
                data: { quantity: existing[0].Quantity + qty },
            });
        }
        else {
            await tx.inventory.create({
                data: {
                    productId,
                    warehouseId,
                    locationId,
                    quantity: qty,
                },
            });
        }
        await tx.inventoryTransaction.create({
            data: {
                productId,
                warehouseId,
                quantity: qty,
                transactionType: constants_1.TRANSACTION_TYPE.IN,
                referenceType: refType,
                referenceId: refId,
                note: note || `Stock increased by ${qty} via ${refType}#${refId}`,
            },
        });
    }
    async decreaseStock(tx, productId, warehouseId, locationId, qty, refType, refId, note) {
        if (qty <= 0) {
            throw new common_1.BadRequestException('Quantity must be positive');
        }
        this.logger.log(`decreaseStock: product=${productId}, warehouse=${warehouseId}, location=${locationId}, qty=${qty}, ref=${refType}#${refId}`);
        const existing = await tx.$queryRaw `
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;
        if (existing.length === 0) {
            throw new common_1.BadRequestException(`No inventory found for product #${productId} at warehouse #${warehouseId}, location #${locationId}`);
        }
        const currentQty = existing[0].Quantity;
        if (currentQty < qty) {
            throw new common_1.BadRequestException(`Not enough stock. Available: ${currentQty}, Requested: ${qty} (Product #${productId}, Location #${locationId})`);
        }
        await tx.inventory.update({
            where: { id: existing[0].id },
            data: { quantity: currentQty - qty },
        });
        await tx.inventoryTransaction.create({
            data: {
                productId,
                warehouseId,
                quantity: -qty,
                transactionType: constants_1.TRANSACTION_TYPE.OUT,
                referenceType: refType,
                referenceId: refId,
                note: note || `Stock decreased by ${qty} via ${refType}#${refId}`,
            },
        });
    }
    async getAvailableStock(tx, productId, warehouseId, locationId) {
        const inventory = await tx.$queryRaw `
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;
        if (inventory.length === 0)
            return 0;
        const currentQty = inventory[0].Quantity;
        const reservations = await tx.stockReservation.aggregate({
            where: {
                productId,
                warehouseId,
                locationId,
                status: 'Active',
            },
            _sum: { reservedQty: true },
        });
        const reservedQty = reservations._sum.reservedQty || 0;
        return currentQty - reservedQty;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map