import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateSalesOrderDto } from '../dto';
import { generateUniqueCode } from '../../../common/utils/code-generator';
import { REFERENCE_TYPE, RESERVATION_STATUS } from '../../../common/constants';

@Injectable()
export class SalesOrdersService {
  private readonly logger = new Logger(SalesOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async findAll(query?: { page?: number; limit?: number; status?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, customerCode: true, name: true } },
          createdByUser: { select: { id: true, username: true } },
          details: {
            include: {
              product: { select: { id: true, productCode: true, productName: true } },
            },
          },
          _count: { select: { deliveryNotes: true } },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const so = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        createdByUser: { select: { id: true, username: true } },
        details: {
          include: {
            product: { select: { id: true, productCode: true, productName: true } },
          },
        },
        deliveryNotes: {
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

    if (!so) {
      throw new NotFoundException(`Sales Order #${id} not found`);
    }

    // Fetch StockReservations for this SO to provide pre-filled location data
    const reservations = await this.prisma.stockReservation.findMany({
      where: {
        referenceType: REFERENCE_TYPE.SALES_ORDER,
        referenceId: id,
        status: RESERVATION_STATUS.ACTIVE,
      },
      include: {
        location: { select: { id: true, locationCode: true } },
        warehouse: { select: { id: true, warehouseName: true } },
      },
    });

    return { ...so, reservations };
  }

  /**
   * Create Sales Order with Stock Reservation.
   * 
   * Flow:
   * 1. Validate customer & products
   * 2. Check available stock for each item
   * 3. Create SO + SO Details
   * 4. Create StockReservation for each item
   */
  async create(dto: CreateSalesOrderDto, userId: number) {
    // Validate customer
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException(`Customer #${dto.customerId} not found`);
    }

    // Validate all products exist
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, isDeleted: false },
      });
      if (!product) {
        throw new NotFoundException(`Product #${item.productId} not found`);
      }
    }

    const soCode = generateUniqueCode('SO');
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Execute in transaction with row-level locking
    return this.prisma.$transaction(async (tx) => {
      // Check available stock for each item (with SELECT FOR UPDATE)
      for (const item of dto.items) {
        const availableStock = await this.inventoryService.getAvailableStock(
          tx,
          item.productId,
          item.warehouseId,
          item.locationId,
        );

        if (availableStock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for Product #${item.productId} at Location #${item.locationId}. ` +
            `Available: ${availableStock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Create Sales Order + Details
      const so = await tx.salesOrder.create({
        data: {
          soCode,
          customerId: dto.customerId,
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
          customer: { select: { id: true, customerCode: true, name: true } },
          details: {
            include: {
              product: { select: { id: true, productCode: true, productName: true } },
            },
          },
        },
      });

      // Create Stock Reservations
      for (const item of dto.items) {
        await tx.stockReservation.create({
          data: {
            productId: item.productId,
            warehouseId: item.warehouseId,
            locationId: item.locationId,
            reservedQty: item.quantity,
            referenceType: REFERENCE_TYPE.SALES_ORDER,
            referenceId: so.id,
            status: RESERVATION_STATUS.ACTIVE,
          },
        });

        this.logger.log(
          `Stock reserved: Product #${item.productId}, Location #${item.locationId}, Qty: ${item.quantity}, SO: ${soCode}`,
        );
      }

      return so;
    });
  }

  async remove(id: number) {
    const so = await this.findOne(id);
    if (so.status !== 'Pending') {
      throw new BadRequestException('Only pending sales orders can be deleted');
    }

    return this.prisma.$transaction(async (tx) => {
      // Hard delete stock reservations
      await tx.stockReservation.deleteMany({
        where: {
          referenceType: REFERENCE_TYPE.SALES_ORDER,
          referenceId: id,
        },
      });

      // Hard delete details
      await tx.salesOrderDetail.deleteMany({
        where: { soId: id },
      });

      // Hard delete SO
      await tx.salesOrder.delete({
        where: { id },
      });

      return { message: `Sales Order #${id} has been permanently deleted` };
    });
  }
}
