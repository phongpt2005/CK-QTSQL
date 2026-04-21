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
var DeliveryNotesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryNotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const inventory_service_1 = require("../../inventory/inventory.service");
const code_generator_1 = require("../../../common/utils/code-generator");
const constants_1 = require("../../../common/constants");
let DeliveryNotesService = DeliveryNotesService_1 = class DeliveryNotesService {
    prisma;
    inventoryService;
    logger = new common_1.Logger(DeliveryNotesService_1.name);
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async create(dto, userId) {
        const so = await this.prisma.salesOrder.findUnique({
            where: { id: dto.soId },
            include: { details: true },
        });
        if (!so) {
            throw new common_1.NotFoundException(`Sales Order #${dto.soId} not found`);
        }
        if (so.status === constants_1.ORDER_STATUS.CANCELLED) {
            throw new common_1.BadRequestException(`Sales Order #${dto.soId} is cancelled`);
        }
        if (so.status === constants_1.ORDER_STATUS.DELIVERED) {
            throw new common_1.BadRequestException(`Sales Order #${dto.soId} is already delivered`);
        }
        const deliveryCode = (0, code_generator_1.generateUniqueCode)('DN');
        return this.prisma.$transaction(async (tx) => {
            const dn = await tx.deliveryNote.create({
                data: {
                    deliveryCode,
                    soId: dto.soId,
                    deliveryDate: new Date(dto.deliveryDate),
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
            for (const detail of dn.details) {
                const location = await tx.location.findUnique({
                    where: { id: detail.locationId },
                });
                if (!location || !location.warehouseId) {
                    throw new common_1.BadRequestException(`Location #${detail.locationId} has no warehouse assigned`);
                }
                await this.inventoryService.decreaseStock(tx, detail.productId, location.warehouseId, detail.locationId, detail.quantity, constants_1.REFERENCE_TYPE.DELIVERY_NOTE, dn.id, `Delivery Note ${deliveryCode}`);
                this.logger.log(`Stock decreased: Product #${detail.productId}, Location #${detail.locationId}, Qty: ${detail.quantity}`);
            }
            await tx.stockReservation.updateMany({
                where: {
                    referenceType: constants_1.REFERENCE_TYPE.SALES_ORDER,
                    referenceId: dto.soId,
                    status: constants_1.RESERVATION_STATUS.ACTIVE,
                },
                data: {
                    status: constants_1.RESERVATION_STATUS.DELIVERED,
                },
            });
            await tx.salesOrder.update({
                where: { id: dto.soId },
                data: { status: constants_1.ORDER_STATUS.DELIVERED },
            });
            return dn;
        });
    }
};
exports.DeliveryNotesService = DeliveryNotesService;
exports.DeliveryNotesService = DeliveryNotesService = DeliveryNotesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], DeliveryNotesService);
//# sourceMappingURL=delivery-notes.service.js.map