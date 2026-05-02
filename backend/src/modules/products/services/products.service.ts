import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; categoryId?: number; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, categoryName: true } },
          unit: { select: { id: true, unitName: true, symbol: true } },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.count({ where }),
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

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: {
        category: true,
        unit: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { productCode: dto.productCode },
    });

    if (existing) {
      throw new ConflictException(`Product code "${dto.productCode}" already exists`);
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

  async update(id: number, dto: UpdateProductDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: `Product #${id} deleted successfully` };
  }
}
