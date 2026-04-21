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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.supplier.findMany({
            where: { isDeleted: false },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, isDeleted: false },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier #${id} not found`);
        }
        return supplier;
    }
    async create(dto) {
        const existing = await this.prisma.supplier.findUnique({
            where: { supplierCode: dto.supplierCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`Supplier code "${dto.supplierCode}" already exists`);
        }
        return this.prisma.supplier.create({
            data: {
                supplierCode: dto.supplierCode,
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.supplier.update({
            where: { id },
            data: {
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                status: dto.status,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.supplier.update({
            where: { id },
            data: { isDeleted: true },
        });
        return { message: `Supplier #${id} deleted successfully` };
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map