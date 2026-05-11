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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.productCategory.findMany({
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.productCategory.findFirst({
            where: { id },
            include: { products: { where: { isDeleted: false }, select: { id: true, productCode: true, productName: true } } },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category #${id} not found`);
        }
        return category;
    }
    async create(dto) {
        return this.prisma.productCategory.create({
            data: {
                categoryName: dto.categoryName,
                description: dto.description,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.productCategory.update({
            where: { id },
            data: {
                categoryName: dto.categoryName,
                description: dto.description,
                status: dto.status,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.productCategory.delete({
            where: { id },
        });
        return { message: `Category #${id} deleted successfully` };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map