import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(warehouseId?: number) {
    const where: any = {};
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

  async findOne(id: number) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: true,
      },
    });

    if (!location) {
      throw new NotFoundException(`Location #${id} not found`);
    }

    return location;
  }

  async create(dto: CreateLocationDto) {
    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${dto.warehouseId} not found`);
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

  async update(id: number, dto: UpdateLocationDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.location.update({
      where: { id },
      data: { status: 0 },
    });

    return { message: `Location #${id} deactivated successfully` };
  }
}
