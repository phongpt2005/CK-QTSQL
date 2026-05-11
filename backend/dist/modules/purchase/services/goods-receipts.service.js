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
var GoodsReceiptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const inventory_service_1 = require("../../inventory/inventory.service");
const code_generator_1 = require("../../../common/utils/code-generator");
const constants_1 = require("../../../common/constants");
let GoodsReceiptsService = GoodsReceiptsService_1 = class GoodsReceiptsService {
    prisma;
    inventoryService;
    logger = new common_1.Logger(GoodsReceiptsService_1.name);
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async create(dto, userId) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: dto.poId },
            include: { details: true },
        });
        if (!po) {
            throw new common_1.NotFoundException(`Purchase Order #${dto.poId} not found`);
        }
        if (po.status === constants_1.ORDER_STATUS.CANCELLED) {
            throw new common_1.BadRequestException(`Purchase Order #${dto.poId} is cancelled`);
        }
        for (const item of dto.items) {
            const location = await this.prisma.location.findUnique({
                where: { id: item.locationId },
                include: { warehouse: true },
            });
            if (!location) {
                throw new common_1.NotFoundException(`Location #${item.locationId} not found`);
            }
        }
        const receiptCode = (0, code_generator_1.generateUniqueCode)('GR');
        return this.prisma.$transaction(async (tx) => {
            const receipt = await tx.goodsReceipt.create({
                data: {
                    receiptCode,
                    poId: dto.poId,
                    receiptDate: new Date(dto.receiptDate),
                    status: 'Completed',
                    note: dto.note,
                    createdBy: userId,
                    details: {
                        create: dto.items.map((item) => ({
                            productId: item.productId,
                            locationId: item.locationId,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {
                    details: {
                        include: {
                            product: { select: { id: true, productCode: true, productName: true } },
                            location: {
                                select: { id: true, locationCode: true, warehouseId: true },
                            },
                        },
                    },
                },
            });
            for (const detail of receipt.details) {
                const location = await tx.location.findUnique({
                    where: { id: detail.locationId },
                });
                if (!location || !location.warehouseId) {
                    throw new common_1.BadRequestException(`Location #${detail.locationId} has no warehouse assigned`);
                }
                await this.inventoryService.increaseStock(tx, detail.productId, location.warehouseId, detail.locationId, detail.quantity, constants_1.REFERENCE_TYPE.GOODS_RECEIPT, receipt.id, `Goods Receipt ${receiptCode}`);
                this.logger.log(`Stock increased: Product #${detail.productId}, Location #${detail.locationId}, Qty: ${detail.quantity}`);
            }
            await tx.purchaseOrder.update({
                where: { id: dto.poId },
                data: { status: constants_1.ORDER_STATUS.RECEIVED },
            });
            return receipt;
        });
    }
};
exports.GoodsReceiptsService = GoodsReceiptsService;
exports.GoodsReceiptsService = GoodsReceiptsService = GoodsReceiptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], GoodsReceiptsService);
//# sourceMappingURL=goods-receipts.service.js.map