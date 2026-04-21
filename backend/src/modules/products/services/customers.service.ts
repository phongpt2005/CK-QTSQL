import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, isDeleted: false },
    });

    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { customerCode: dto.customerCode },
    });

    if (existing) {
      throw new ConflictException(`Customer code "${dto.customerCode}" already exists`);
    }

    return this.prisma.customer.create({
      data: {
        customerCode: dto.customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
      },
    });
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);

    return this.prisma.customer.update({
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

    await this.prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: `Customer #${id} deleted successfully` };
  }
}
