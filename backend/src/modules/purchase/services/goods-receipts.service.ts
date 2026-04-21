import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateGoodsReceiptDto } from '../dto';
import { generateUniqueCode } from '../../../common/utils/code-generator';
import { REFERENCE_TYPE, ORDER_STATUS } from '../../../common/constants';

@Injectable()
export class GoodsReceiptsService {
  private readonly logger = new Logger(GoodsReceiptsService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreateGoodsReceiptDto, userId: number) {
    // 1. Validate PO exists and is in valid status
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.poId },
      include: { details: true },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order #${dto.poId} not found`);
    }

    if (po.status === ORDER_STATUS.CANCELLED) {
      throw new BadRequestException(`Purchase Order #${dto.poId} is cancelled`);
    }

    // 2. Validate locations exist and get warehouse info
    for (const item of dto.items) {
      const location = await this.prisma.location.findUnique({
        where: { id: item.locationId },
        include: { warehouse: true },
      });
      if (!location) {
        throw new NotFoundException(`Location #${item.locationId} not found`);
      }
    }

    const receiptCode = generateUniqueCode('GR');

    // 3. Execute everything in a single transaction
    return this.prisma.$transaction(async (tx) => {
      // 3a. Create GoodsReceipt + Details
      const receipt = await tx.goodsReceipt.create({
        data: {
          receiptCode,
          poId: dto.poId,
          receiptDate: new Date(dto.receiptDate),
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

      // 3b. Increase stock for each item via InventoryService
      for (const detail of receipt.details) {
        const location = await tx.location.findUnique({
          where: { id: detail.locationId! },
        });

        if (!location || !location.warehouseId) {
          throw new BadRequestException(
            `Location #${detail.locationId} has no warehouse assigned`,
          );
        }

        await this.inventoryService.increaseStock(
          tx,
          detail.productId!,
          location.warehouseId,
          detail.locationId!,
          detail.quantity,
          REFERENCE_TYPE.GOODS_RECEIPT,
          receipt.id,
          `Goods Receipt ${receiptCode}`,
        );

        this.logger.log(
          `Stock increased: Product #${detail.productId}, Location #${detail.locationId}, Qty: ${detail.quantity}`,
        );
      }

      // 3c. Update PO status
      await tx.purchaseOrder.update({
        where: { id: dto.poId },
        data: { status: ORDER_STATUS.RECEIVED },
      });

      return receipt;
    });
  }
}
