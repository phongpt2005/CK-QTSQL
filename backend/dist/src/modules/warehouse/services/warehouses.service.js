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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let WarehousesService = class WarehousesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.warehouse.findMany({
            include: {
                _count: { select: { locations: true } },
            },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id },
            include: {
                locations: true,
                _count: { select: { locations: true } },
            },
        });
        if (!warehouse) {
            throw new common_1.NotFoundException(`Warehouse #${id} not found`);
        }
        return warehouse;
    }
    async create(dto) {
        return this.prisma.warehouse.create({
            data: {
                warehouseName: dto.warehouseName,
                address: dto.address,
                phone: dto.phone,
                managerName: dto.managerName,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.warehouse.update({
            where: { id },
            data: {
                warehouseName: dto.warehouseName,
                address: dto.address,
                phone: dto.phone,
                managerName: dto.managerName,
                status: dto.status,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.warehouse.update({
            where: { id },
            data: { status: 0 },
        });
        return { message: `Warehouse #${id} deactivated successfully` };
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map