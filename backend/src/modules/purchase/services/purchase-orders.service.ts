import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreatePurchaseOrderDto } from '../dto';
import { generateUniqueCode } from '../../../common/utils/code-generator';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { page?: number; limit?: number; status?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { id: true, supplierCode: true, name: true } },
          createdByUser: { select: { id: true, username: true } },
          details: {
            include: {
              product: { select: { id: true, productCode: true, productName: true } },
            },
          },
          _count: { select: { goodsReceipts: true } },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdByUser: { select: { id: true, username: true } },
        details: {
          include: {
            product: { select: { id: true, productCode: true, productName: true } },
          },
        },
        goodsReceipts: {
          include: {
            details: {
              include: {
                product: { select: { id: true, productCode: true, productName: true } },
                location: { select: { id: true, locationCode: true } },
              },
            },
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order #${id} not found`);
    }

    return po;
  }

  async create(dto: CreatePurchaseOrderDto, userId: number) {
    // Validate supplier
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, isDeleted: false },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier #${dto.supplierId} not found`);
    }

    // Validate all products
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, isDeleted: false },
      });
      if (!product) {
        throw new NotFoundException(`Product #${item.productId} not found`);
      }
    }

    const poCode = generateUniqueCode('PO');

    // Calculate totals
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          poCode,
          supplierId: dto.supplierId,
          orderDate: new Date(dto.orderDate),
          status: 'Pending',
          totalAmount,
          note: dto.note,
          createdBy: userId,
          details: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          supplier: { select: { id: true, supplierCode: true, name: true } },
          details: {
            include: {
              product: { select: { id: true, productCode: true, productName: true } },
            },
          },
        },
      });

      return po;
    });
  }
}
