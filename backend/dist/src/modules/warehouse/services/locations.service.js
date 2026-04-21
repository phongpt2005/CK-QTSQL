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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let LocationsService = class LocationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(warehouseId) {
        const where = {};
        if (warehouseId) {
            where.warehouseId = warehouseId;
        }
        return this.prisma.location.findMany({
            where,
            include: {
                warehouse: { select: { id: true, warehouseName: true } },
            },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const location = await this.prisma.location.findUnique({
            where: { id },
            include: {
                warehouse: true,
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location #${id} not found`);
        }
        return location;
    }
    async create(dto) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id: dto.warehouseId },
        });
        if (!warehouse) {
            throw new common_1.NotFoundException(`Warehouse #${dto.warehouseId} not found`);
        }
        return this.prisma.location.create({
            data: {
                warehouseId: dto.warehouseId,
                locationCode: dto.locationCode,
                description: dto.description,
                capacity: dto.capacity || 0,
            },
            include: {
                warehouse: { select: { id: true, warehouseName: true } },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.location.update({
            where: { id },
            data: {
                locationCode: dto.locationCode,
                description: dto.description,
                capacity: dto.capacity,
                status: dto.status,
            },
            include: {
                warehouse: { select: { id: true, warehouseName: true } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.location.update({
            where: { id },
            data: { status: 0 },
        });
        return { message: `Location #${id} deactivated successfully` };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map