import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from '../dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reader.unit.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const unit = await this.prisma.reader.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException(`Unit #${id} not found`);
    }

    return unit;
  }

  async create(dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: {
        unitName: dto.unitName,
        symbol: dto.symbol,
      },
    });
  }

  async update(id: number, dto: UpdateUnitDto) {
    await this.findOne(id);

    return this.prisma.unit.update({
      where: { id },
      data: {
        unitName: dto.unitName,
        symbol: dto.symbol,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.unit.delete({
      where: { id },
    });

    return { message: `Unit #${id} deleted successfully` };
  }
}
