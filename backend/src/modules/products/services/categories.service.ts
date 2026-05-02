import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productCategory.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id },
      include: { products: { where: { isDeleted: false }, select: { id: true, productCode: true, productName: true } } },
    });

    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.productCategory.create({
      data: {
        categoryName: dto.categoryName,
        description: dto.description,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return { message: `Category #${id} deleted successfully` };
  }
}
