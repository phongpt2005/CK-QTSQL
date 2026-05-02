import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier #${id} not found`);
    }

    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { supplierCode: dto.supplierCode },
    });

    if (existing) {
      throw new ConflictException(`Supplier code "${dto.supplierCode}" already exists`);
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

  async update(id: number, dto: UpdateSupplierDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.supplier.delete({
      where: { id },
    });

    return { message: `Supplier #${id} deleted successfully` };
  }
}
