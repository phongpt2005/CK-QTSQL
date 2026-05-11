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
var SalesOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const inventory_service_1 = require("../../inventory/inventory.service");
const code_generator_1 = require("../../../common/utils/code-generator");
const constants_1 = require("../../../common/constants");
let SalesOrdersService = SalesOrdersService_1 = class SalesOrdersService {
    prisma;
    inventoryService;
    logger = new common_1.Logger(SalesOrdersService_1.name);
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async findAll(query) {
        const page = query?.page || 1;
        const limit = query?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.status)
            where.status = query.status;
        const [data, total] = await Promise.all([
            this.prisma.salesOrder.findMany({
                where,
                include: {
                    customer: { select: { id: true, customerCode: true, name: true } },
                    createdByUser: { select: { id: true, username: true } },
                    details: {
                        include: {
                            product: { select: { id: true, productCode: true, productName: true } },
                        },
                    },
                    _count: { select: { deliveryNotes: true } },
                },
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.prisma.salesOrder.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const so = await this.prisma.salesOrder.findUnique({
            where: { id },
            include: {
                customer: true,
                createdByUser: { select: { id: true, username: true } },
                details: {
                    include: {
                        product: { select: { id: true, productCode: true, productName: true } },
                    },
                },
                deliveryNotes: {
                    include: {
                        details: {
                            include: {
                                product: { select: { id: true, productCode: true, productName: true } },
                                location: { select: { id: true, locationCode: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!so) {
            throw new common_1.NotFoundException(`Sales Order #${id} not found`);
        }
        const reservations = await this.prisma.stockReservation.findMany({
            where: {
                referenceType: constants_1.REFERENCE_TYPE.SALES_ORDER,
                referenceId: id,
                status: constants_1.RESERVATION_STATUS.ACTIVE,
            },
            include: {
                location: { select: { id: true, locationCode: true } },
                warehouse: { select: { id: true, warehouseName: true } },
            },
        });
        return { ...so, reservations };
    }
    async create(dto, userId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: dto.customerId, isDeleted: false },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer #${dto.customerId} not found`);
        }
        for (const item of dto.items) {
            const product = await this.prisma.product.findFirst({
                where: { id: item.productId, isDeleted: false },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product #${item.productId} not found`);
            }
        }
        const soCode = (0, code_generator_1.generateUniqueCode)('SO');
        const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const availableStock = await this.inventoryService.getAvailableStock(tx, item.productId, item.warehouseId, item.locationId);
                if (availableStock < item.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for Product #${item.productId} at Location #${item.locationId}. ` +
                        `Available: ${availableStock}, Requested: ${item.quantity}`);
                }
            }
            const so = await tx.salesOrder.create({
                data: {
                    soCode,
                    customerId: dto.customerId,
                    orderDate: new Date(dto.orderDate),
                    status: 'Pending',
                    totalAmount,
                    note: dto.note,
                    createdBy: userId,
                    details: {
                        create: dto.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                        })),
                    },
                },
                include: {
                    customer: { select: { id: true, customerCode: true, name: true } },
                    details: {
                        include: {
                            product: { select: { id: true, productCode: true, productName: true } },
                        },
                    },
                },
            });
            for (const item of dto.items) {
                await tx.stockReservation.create({
                    data: {
                        productId: item.productId,
                        warehouseId: item.warehouseId,
                        locationId: item.locationId,
                        reservedQty: item.quantity,
                        referenceType: constants_1.REFERENCE_TYPE.SALES_ORDER,
                        referenceId: so.id,
                        status: constants_1.RESERVATION_STATUS.ACTIVE,
                    },
                });
                this.logger.log(`Stock reserved: Product #${item.productId}, Location #${item.locationId}, Qty: ${item.quantity}, SO: ${soCode}`);
            }
            return so;
        });
    }
    async remove(id) {
        const so = await this.findOne(id);
        if (so.status !== 'Pending') {
            throw new common_1.BadRequestException('Only pending sales orders can be deleted');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.stockReservation.deleteMany({
                where: {
                    referenceType: constants_1.REFERENCE_TYPE.SALES_ORDER,
                    referenceId: id,
                },
            });
            await tx.salesOrderDetail.deleteMany({
                where: { soId: id },
            });
            await tx.salesOrder.delete({
                where: { id },
            });
            return { message: `Sales Order #${id} has been permanently deleted` };
        });
    }
};
exports.SalesOrdersService = SalesOrdersService;
exports.SalesOrdersService = SalesOrdersService = SalesOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], SalesOrdersService);
//# sourceMappingURL=sales-orders.service.js.map