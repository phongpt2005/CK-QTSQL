import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateDeliveryNoteDto } from '../dto';
import { generateUniqueCode } from '../../../common/utils/code-generator';
import { REFERENCE_TYPE, ORDER_STATUS, RESERVATION_STATUS } from '../../../common/constants';

@Injectable()
export class DeliveryNotesService {
  private readonly logger = new Logger(DeliveryNotesService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  /**
   * Create Delivery Note and decrease stock.
   * 
   * Flow:
   * 1. Validate SO exists and status is valid
   * 2. In a transaction:
   *    a. Create DeliveryNote + Details
   *    b. For each item → decreaseStock() via InventoryService
   *    c. Release (update) StockReservations
   *    d. Update SO status
   */
  async create(dto: CreateDeliveryNoteDto, userId: number) {
    // 1. Validate SO
    const so = await this.prisma.salesOrder.findUnique({
      where: { id: dto.soId },
      include: { details: true },
    });

    if (!so) {
      throw new NotFoundException(`Sales Order #${dto.soId} not found`);
    }

    if (so.status === ORDER_STATUS.CANCELLED) {
      throw new BadRequestException(`Sales Order #${dto.soId} is cancelled`);
    }

    if (so.status === ORDER_STATUS.DELIVERED) {
      throw new BadRequestException(`Sales Order #${dto.soId} is already delivered`);
    }

    const deliveryCode = generateUniqueCode('DN');

    // 2. Execute in transaction
    return this.prisma.$transaction(async (tx) => {
      // 2a. Create DeliveryNote + Details
      const dn = await tx.deliveryNote.create({
        data: {
          deliveryCode,
          soId: dto.soId,
          deliveryDate: new Date(dto.deliveryDate),
          status: 'Completed',
          note: dto.note,
          createdBy: userId,
          details: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              locationId: item.locationId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          details: {
            include: {
              product: { select: { id: true, productCode: true, productName: true } },
              location: {
                select: { id: true, locationCode: true, warehouseId: true },
              },
            },
          },
        },
      });

      // 2b. Decrease stock for each item
      for (const detail of dn.details) {
        const location = await tx.location.findUnique({
          where: { id: detail.locationId! },
        });

        if (!location || !location.warehouseId) {
          throw new BadRequestException(
            `Location #${detail.locationId} has no warehouse assigned`,
          );
        }

        // This will throw if insufficient stock (SELECT FOR UPDATE inside)
        await this.inventoryService.decreaseStock(
          tx,
          detail.productId!,
          location.warehouseId,
          detail.locationId!,
          detail.quantity,
          REFERENCE_TYPE.DELIVERY_NOTE,
          dn.id,
          `Delivery Note ${deliveryCode}`,
        );

        this.logger.log(
          `Stock decreased: Product #${detail.productId}, Location #${detail.locationId}, Qty: ${detail.quantity}`,
        );
      }

      // 2c. Release stock reservations for this SO
      await tx.stockReservation.updateMany({
        where: {
          referenceType: REFERENCE_TYPE.SALES_ORDER,
          referenceId: dto.soId,
          status: RESERVATION_STATUS.ACTIVE,
        },
        data: {
          status: RESERVATION_STATUS.DELIVERED,
        },
      });

      // 2d. Update SO status
      await tx.salesOrder.update({
        where: { id: dto.soId },
        data: { status: ORDER_STATUS.DELIVERED },
      });

      return dn;
    });
  }
}
