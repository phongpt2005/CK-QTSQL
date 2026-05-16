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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query?.page || 1;
        const limit = query?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.search) {
            where.OR = [
                { productName: { contains: query.search } },
                { productCode: { contains: query.search } },
            ];
        }
        if (query?.categoryId) {
            where.categoryId = query.categoryId;
        }
        const [data, total] = await Promise.all([
            this.prisma.reader.product.findMany({
                where,
                include: {
                    category: { select: { id: true, categoryName: true } },
                    unit: { select: { id: true, unitName: true, symbol: true } },
                    inventories: {
                        where: { quantity: { gt: 0 } },
                        include: {
                            warehouse: { select: { id: true, warehouseName: true } },
                            location: { select: { id: true, locationCode: true } },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            this.prisma.reader.product.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const product = await this.prisma.reader.product.findFirst({
            where: { id },
            include: {
                category: true,
                unit: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product #${id} not found`);
        }
        return product;
    }
    async create(dto) {
        const existing = await this.prisma.reader.product.findUnique({
            where: { productCode: dto.productCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`Product code "${dto.productCode}" already exists`);
        }
        return this.prisma.product.create({
            data: {
                productCode: dto.productCode,
                productName: dto.productName,
                categoryId: dto.categoryId,
                unitId: dto.unitId,
                price: dto.price || 0,
                description: dto.description,
            },
            include: {
                category: true,
                unit: true,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                productName: dto.productName,
                categoryId: dto.categoryId,
                unitId: dto.unitId,
                price: dto.price,
                description: dto.description,
                status: dto.status,
            },
            include: {
                category: true,
                unit: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.delete({
            where: { id },
        });
        return { message: `Product #${id} deleted successfully` };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map