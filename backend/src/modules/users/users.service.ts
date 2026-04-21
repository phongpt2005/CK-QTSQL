import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException(`Username "${dto.username}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        role: dto.role || 'Staff',
      },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    const updateData: any = {};

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
