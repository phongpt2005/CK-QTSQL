import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reader.customer.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.reader.customer.findFirst({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer #${id} not found`);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.reader.customer.findUnique({
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

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: `Customer #${id} deleted successfully` };
  }
}
