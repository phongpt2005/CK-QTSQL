import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: { select: { locations: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: true,
        _count: { select: { locations: true } },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse #${id} not found`);
    }

    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        warehouseName: dto.warehouseName,
        address: dto.address,
        phone: dto.phone,
        managerName: dto.managerName,
      },
    });
  }

  async update(id: number, dto: UpdateWarehouseDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.warehouse.update({
      where: { id },
      data: { status: 0 },
    });

    return { message: `Warehouse #${id} deactivated successfully` };
  }
}
