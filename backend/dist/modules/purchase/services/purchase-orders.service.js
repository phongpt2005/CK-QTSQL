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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const code_generator_1 = require("../../../common/utils/code-generator");
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query?.page || 1;
        const limit = query?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.status)
            where.status = query.status;
        const [data, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                include: {
                    supplier: { select: { id: true, supplierCode: true, name: true } },
                    createdByUser: { select: { id: true, username: true } },
                    details: {
                        include: {
                            product: { select: { id: true, productCode: true, productName: true } },
                        },
                    },
                    _count: { select: { goodsReceipts: true } },
                },
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                createdByUser: { select: { id: true, username: true } },
                details: {
                    include: {
                        product: { select: { id: true, productCode: true, productName: true } },
                    },
                },
                goodsReceipts: {
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
        if (!po) {
            throw new common_1.NotFoundException(`Purchase Order #${id} not found`);
        }
        return po;
    }
    async create(dto, userId) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: dto.supplierId, isDeleted: false },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier #${dto.supplierId} not found`);
        }
        for (const item of dto.items) {
            const product = await this.prisma.product.findFirst({
                where: { id: item.productId, isDeleted: false },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product #${item.productId} not found`);
            }
        }
        const poCode = (0, code_generator_1.generateUniqueCode)('PO');
        const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return this.prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.create({
                data: {
                    poCode,
                    supplierId: dto.supplierId,
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
                    supplier: { select: { id: true, supplierCode: true, name: true } },
                    details: {
                        include: {
                            product: { select: { id: true, productCode: true, productName: true } },
                        },
                    },
                },
            });
            return po;
        });
    }
    async remove(id) {
        const po = await this.findOne(id);
        if (po.status !== 'Pending') {
            throw new common_1.BadRequestException('Only pending purchase orders can be deleted');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.purchaseOrderDetail.deleteMany({
                where: { poId: id },
            });
            await tx.purchaseOrder.delete({
                where: { id },
            });
            return { message: `Purchase Order #${id} has been permanently deleted` };
        });
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map