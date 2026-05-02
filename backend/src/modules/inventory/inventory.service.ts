import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { Prisma } from '@prisma/client';
import { TRANSACTION_TYPE } from '../../common/constants';
import { QueryInventoryDto } from './dto';

/**
 * ⭐ CORE SERVICE - The ONLY service allowed to modify Inventory table.
 *
 * All stock changes (increase/decrease) MUST go through this service.
 * No other module should directly write to the Inventory table.
 *
 * Read/Write Splitting:
 *   READ  queries → this.prisma.reader  (hits replica if configured)
 *   WRITE queries → this.prisma          (always hits master)
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  // ========================================
  // QUERY METHODS (READ → REPLICA)
  // ========================================

  async findAll(query: QueryInventoryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.productId) where.productId = query.productId;
    if (query.locationId) where.locationId = query.locationId;

    // ► READ operations routed to replica via this.prisma.reader
    const [data, total] = await Promise.all([
      this.prisma.reader.inventory.findMany({
        where,
        include: {
          product: { select: { id: true, productCode: true, productName: true } },
          warehouse: { select: { id: true, warehouseName: true } },
          location: { select: { id: true, locationCode: true } },
        },
        skip,
        take: limit,
        orderBy: { lastUpdated: 'desc' },
      }),
      this.prisma.reader.inventory.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByProduct(productId: number) {
    // ► READ → replica
    const inventories = await this.prisma.reader.inventory.findMany({
      where: { productId },
      include: {
        product: { select: { id: true, productCode: true, productName: true } },
        warehouse: { select: { id: true, warehouseName: true } },
        location: { select: { id: true, locationCode: true } },
      },
    });

    // Calculate total stock and available stock (minus reservations)
    const reservations = await this.prisma.reader.stockReservation.groupBy({
      by: ['productId', 'warehouseId', 'locationId'],
      where: {
        productId,
        status: 'Active',
      },
      _sum: { reservedQty: true },
    });

    const reservationMap = new Map<string, number>();
    for (const r of reservations) {
      const key = `${r.productId}-${r.warehouseId}-${r.locationId}`;
      reservationMap.set(key, r._sum.reservedQty || 0);
    }

    const result = inventories.map((inv) => {
      const key = `${inv.productId}-${inv.warehouseId}-${inv.locationId}`;
      const reserved = reservationMap.get(key) || 0;
      return {
        ...inv,
        reservedQty: reserved,
        availableQty: inv.quantity - reserved,
      };
    });

    const totalStock = result.reduce((sum, r) => sum + r.quantity, 0);
    const totalReserved = result.reduce((sum, r) => sum + r.reservedQty, 0);
    const totalAvailable = result.reduce((sum, r) => sum + r.availableQty, 0);

    return {
      productId,
      totalStock,
      totalReserved,
      totalAvailable,
      details: result,
    };
  }

  async getTransactions(query: {
    productId?: number;
    warehouseId?: number;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.productId) where.productId = query.productId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;

    // ► READ → replica (benefits from partitioning on TransactionDate)
    const [data, total] = await Promise.all([
      this.prisma.reader.inventoryTransaction.findMany({
        where,
        include: {
          product: { select: { id: true, productCode: true, productName: true } },
          warehouse: { select: { id: true, warehouseName: true } },
        },
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.reader.inventoryTransaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ========================================
  // STOCK MUTATION METHODS (WRITE → MASTER)
  // ========================================

  /**
   * Increase stock for a product at a specific location.
   * Used when receiving goods (GoodsReceipt).
   *
   * Must be called within a Prisma interactive transaction ($transaction).
   */
  async increaseStock(
    tx: Prisma.TransactionClient,
    productId: number,
    warehouseId: number,
    locationId: number,
    qty: number,
    refType: string,
    refId: number,
    note?: string,
  ): Promise<void> {
    if (qty <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    this.logger.log(
      `increaseStock: product=${productId}, warehouse=${warehouseId}, location=${locationId}, qty=${qty}, ref=${refType}#${refId}`,
    );

    // 1. SELECT FOR UPDATE to lock the inventory row (WRITE → master)
    const existing = await tx.$queryRaw<any[]>`
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;

    if (existing.length > 0) {
      // 2a. Update existing row
      await tx.inventory.update({
        where: { id: existing[0].id },
        data: { quantity: existing[0].Quantity + qty },
      });
    } else {
      // 2b. Create new inventory row
      await tx.inventory.create({
        data: {
          productId,
          warehouseId,
          locationId,
          quantity: qty,
        },
      });
    }

    // 3. Record the transaction (writes to partitioned InventoryTransactions)
    await tx.inventoryTransaction.create({
      data: {
        productId,
        warehouseId,
        quantity: qty,
        transactionType: TRANSACTION_TYPE.IN,
        referenceType: refType,
        referenceId: refId,
        note: note || `Stock increased by ${qty} via ${refType}#${refId}`,
      },
    });
  }

  /**
   * Decrease stock for a product at a specific location.
   * Used when delivering goods (DeliveryNote).
   *
   * Must be called within a Prisma interactive transaction ($transaction).
   * Will throw if insufficient stock.
   */
  async decreaseStock(
    tx: Prisma.TransactionClient,
    productId: number,
    warehouseId: number,
    locationId: number,
    qty: number,
    refType: string,
    refId: number,
    note?: string,
  ): Promise<void> {
    if (qty <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    this.logger.log(
      `decreaseStock: product=${productId}, warehouse=${warehouseId}, location=${locationId}, qty=${qty}, ref=${refType}#${refId}`,
    );

    // 1. SELECT FOR UPDATE to lock the inventory row (PREVENT RACE CONDITION)
    const existing = await tx.$queryRaw<any[]>`
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;

    if (existing.length === 0) {
      throw new BadRequestException(
        `No inventory found for product #${productId} at warehouse #${warehouseId}, location #${locationId}`,
      );
    }

    const currentQty = existing[0].Quantity;

    // 2. Check available stock (MUST NOT GO NEGATIVE)
    if (currentQty < qty) {
      throw new BadRequestException(
        `Not enough stock. Available: ${currentQty}, Requested: ${qty} (Product #${productId}, Location #${locationId})`,
      );
    }

    // 3. Decrease the stock (WRITE → master)
    await tx.inventory.update({
      where: { id: existing[0].id },
      data: { quantity: currentQty - qty },
    });

    // 4. Record the transaction (writes to partitioned InventoryTransactions)
    await tx.inventoryTransaction.create({
      data: {
        productId,
        warehouseId,
        quantity: -qty, // Negative for outgoing
        transactionType: TRANSACTION_TYPE.OUT,
        referenceType: refType,
        referenceId: refId,
        note: note || `Stock decreased by ${qty} via ${refType}#${refId}`,
      },
    });
  }

  /**
   * Get available stock (total - reserved) for a product at a location.
   * Must be called within a transaction for accuracy.
   */
  async getAvailableStock(
    tx: Prisma.TransactionClient,
    productId: number,
    warehouseId: number,
    locationId: number,
  ): Promise<number> {
    // Lock the row (within transaction → master)
    const inventory = await tx.$queryRaw<any[]>`
      SELECT id, Quantity FROM Inventory 
      WHERE ProductID = ${productId} 
        AND WarehouseID = ${warehouseId} 
        AND LocationID = ${locationId}
      FOR UPDATE
    `;

    if (inventory.length === 0) return 0;

    const currentQty = inventory[0].Quantity;

    // Get active reservations
    const reservations = await tx.stockReservation.aggregate({
      where: {
        productId,
        warehouseId,
        locationId,
        status: 'Active',
      },
      _sum: { reservedQty: true },
    });

    const reservedQty = reservations._sum.reservedQty || 0;

    return currentQty - reservedQty;
  }
}
