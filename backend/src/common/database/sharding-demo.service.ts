import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Sharding Demo Service - Mô phỏng kỹ thuật Phân mảnh (Sharding)
 *
 * Trong thực tế, Sharding chia dữ liệu ra nhiều server MySQL vật lý.
 * Vì trên máy cá nhân chỉ có 1 MySQL server, service này MÔ PHỎNG
 * logic routing (định tuyến) để chứng minh tư duy thiết kế.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    SHARDING ARCHITECTURE                        │
 * │                                                                  │
 * │   Request (WarehouseID = 5)                                     │
 * │       │                                                          │
 * │       ▼                                                          │
 * │   ┌──────────────────┐                                          │
 * │   │  Shard Router    │  ← Quyết định dữ liệu đi server nào    │
 * │   │  (Service này)   │                                          │
 * │   └────┬────────┬────┘                                          │
 * │        │        │                                                │
 * │   ┌────▼───┐ ┌──▼──────┐                                       │
 * │   │Shard 1 │ │ Shard 2 │                                       │
 * │   │Miền Bắc│ │Miền Nam │                                       │
 * │   │WH 1-10 │ │WH 11-20 │                                       │
 * │   └────────┘ └─────────┘                                        │
 * └─────────────────────────────────────────────────────────────────┘
 */
@Injectable()
export class ShardingDemoService {
  private readonly logger = new Logger(ShardingDemoService.name);

  /**
   * Cấu hình Sharding - Trong production, mỗi shard trỏ tới 1 server riêng.
   * Trên máy cá nhân, tất cả trỏ về localhost nhưng logic routing vẫn hoạt động.
   */
  private readonly SHARD_CONFIG = {
    shard_north: {
      name: 'Shard Miền Bắc',
      host: 'db-north.wms.vn',     // Production: Server Hà Nội
      port: 3306,
      warehouseRange: { from: 1, to: 10 },
      region: 'Hà Nội, Hải Phòng, Đà Nẵng',
    },
    shard_south: {
      name: 'Shard Miền Nam',
      host: 'db-south.wms.vn',     // Production: Server TP.HCM
      port: 3306,
      warehouseRange: { from: 11, to: 20 },
      region: 'TP.HCM, Bình Dương, Cần Thơ',
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xác định dữ liệu của WarehouseID thuộc shard nào.
   * Đây chính là hàm ROUTING - trái tim của Sharding.
   */
  private resolveShardKey(warehouseId: number) {
    if (warehouseId >= 1 && warehouseId <= 10) {
      return 'shard_north';
    }
    return 'shard_south';
  }

  /**
   * Demo 1: Sharding Routing - Xem logic phân mảnh
   *
   * Test trên Swagger: GET /api/admin/architecture/sharding/routing?warehouseId=5
   * → Cho thấy WarehouseID 5 sẽ được route tới Shard Miền Bắc
   */
  async demoShardRouting(warehouseId: number) {
    const shardKey = this.resolveShardKey(warehouseId);
    const shardConfig = this.SHARD_CONFIG[shardKey];

    // Lấy thông tin kho thực tế từ database
    const warehouse = await this.prisma.reader.warehouse.findUnique({
      where: { id: warehouseId },
    });

    this.logger.log(
      `📍 WarehouseID=${warehouseId} → Routed to ${shardConfig.name} (${shardConfig.host})`,
    );

    return {
      input: { warehouseId },
      routing: {
        shardKey,
        shardName: shardConfig.name,
        targetServer: `${shardConfig.host}:${shardConfig.port}`,
        region: shardConfig.region,
        warehouseRange: `ID ${shardConfig.warehouseRange.from} → ${shardConfig.warehouseRange.to}`,
      },
      warehouse: warehouse
        ? {
            id: warehouse.id,
            name: warehouse.warehouseName,
            address: warehouse.address,
          }
        : `Kho ID=${warehouseId} chưa tồn tại trong DB`,
      explanation: `Kho có ID=${warehouseId} thuộc phạm vi ${shardConfig.warehouseRange.from}-${shardConfig.warehouseRange.to}, ` +
        `do đó dữ liệu sẽ được lưu trữ tại server ${shardConfig.host} (${shardConfig.name}). ` +
        `Trong production, đây là một MySQL server vật lý riêng biệt tại ${shardConfig.region}.`,
    };
  }

  /**
   * Demo 2: Phân bố dữ liệu theo Shard
   *
   * Test trên Swagger: GET /api/admin/architecture/sharding/distribution
   * → Cho thấy mỗi shard chứa bao nhiêu kho, bao nhiêu tồn kho, bao nhiêu giao dịch
   */
  async demoShardDistribution() {
    // Lấy tất cả kho
    const warehouses = await this.prisma.reader.warehouse.findMany({
      orderBy: { id: 'asc' },
    });

    // Phân nhóm kho theo shard
    const shardNorthWarehouses = warehouses.filter((w) => w.id <= 10);
    const shardSouthWarehouses = warehouses.filter((w) => w.id > 10);

    // Đếm giao dịch và tồn kho cho từng shard
    const [northTxCount, southTxCount, northInvCount, southInvCount] =
      await Promise.all([
        // Giao dịch Shard Bắc
        this.prisma.reader.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM InventoryTransactions WHERE WarehouseID <= 10
        `,
        // Giao dịch Shard Nam
        this.prisma.reader.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM InventoryTransactions WHERE WarehouseID > 10
        `,
        // Tồn kho Shard Bắc
        this.prisma.reader.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM Inventory WHERE WarehouseID <= 10
        `,
        // Tồn kho Shard Nam
        this.prisma.reader.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM Inventory WHERE WarehouseID > 10
        `,
      ]);

    return {
      sharding_strategy: 'RANGE (WarehouseID)',
      shard_north: {
        ...this.SHARD_CONFIG.shard_north,
        warehouses: shardNorthWarehouses.map((w) => ({
          id: w.id,
          name: w.warehouseName,
        })),
        warehouseCount: shardNorthWarehouses.length,
        transactionCount: Number(northTxCount[0]?.count ?? 0),
        inventoryRecords: Number(northInvCount[0]?.count ?? 0),
      },
      shard_south: {
        ...this.SHARD_CONFIG.shard_south,
        warehouses: shardSouthWarehouses.map((w) => ({
          id: w.id,
          name: w.warehouseName,
        })),
        warehouseCount: shardSouthWarehouses.length,
        transactionCount: Number(southTxCount[0]?.count ?? 0),
        inventoryRecords: Number(southInvCount[0]?.count ?? 0),
      },
      summary: {
        totalWarehouses: warehouses.length,
        totalTransactions:
          Number(northTxCount[0]?.count ?? 0) +
          Number(southTxCount[0]?.count ?? 0),
        benefit:
          'Trong production, mỗi shard nằm trên 1 server riêng → ' +
          'tải được phân đều, nếu 1 shard chết thì shard còn lại vẫn hoạt động.',
      },
    };
  }

  /**
   * Demo 3: Mô phỏng Write routing - Ghi dữ liệu vào đúng shard
   *
   * Test trên Swagger: GET /api/admin/architecture/sharding/write-demo?warehouseId=5
   * → Cho thấy lệnh INSERT sẽ được route tới server nào
   */
  async demoWriteRouting(warehouseId: number) {
    const shardKey = this.resolveShardKey(warehouseId);
    const shardConfig = this.SHARD_CONFIG[shardKey];

    this.logger.log(
      `✏️ [WRITE] Phiếu nhập kho WH=${warehouseId} → ${shardConfig.name}`,
    );

    return {
      operation: 'INSERT GoodsReceipt',
      input: { warehouseId },
      routing_decision: {
        step1_resolve_shard: `WarehouseID=${warehouseId} → ${shardKey}`,
        step2_get_connection: `Kết nối tới ${shardConfig.host}:${shardConfig.port}`,
        step3_execute: `INSERT INTO GoodsReceipts (...) VALUES (...) trên ${shardConfig.name}`,
      },
      code_example: {
        description: 'Code thực tế trong Backend (Prisma + Sharding)',
        code: [
          `const shardKey = resolveShardKey(${warehouseId});  // → '${shardKey}'`,
          `const connection = getShardConnection(shardKey);  // → ${shardConfig.host}`,
          `await connection.goodsReceipt.create({ data: { warehouseId: ${warehouseId}, ... } });`,
        ],
      },
      comparison: {
        without_sharding: `Lệnh INSERT chạy trên server duy nhất localhost:3306 → NGHẼN khi có nhiều kho ghi cùng lúc`,
        with_sharding: `Lệnh INSERT chạy trên ${shardConfig.host} → CHỈ chịu tải của kho ${shardConfig.warehouseRange.from}-${shardConfig.warehouseRange.to}`,
      },
    };
  }

  /**
   * Demo 4: Mô phỏng Read routing - Đọc dữ liệu từ đúng shard
   *
   * Test trên Swagger: GET /api/admin/architecture/sharding/read-demo?warehouseId=15
   * → Cho thấy lệnh SELECT sẽ được route tới server nào
   */
  async demoReadRouting(warehouseId: number) {
    const shardKey = this.resolveShardKey(warehouseId);
    const shardConfig = this.SHARD_CONFIG[shardKey];

    // Lấy dữ liệu thực từ database để minh chứng
    const inventoryCount = await this.prisma.reader.inventory.count({
      where: { warehouseId },
    });

    const recentTransactions =
      await this.prisma.reader.inventoryTransaction.findMany({
        where: { warehouseId },
        orderBy: { transactionDate: 'desc' },
        take: 3,
        select: {
          id: true,
          transactionType: true,
          quantity: true,
          transactionDate: true,
        },
      });

    this.logger.log(
      `📖 [READ] Tồn kho WH=${warehouseId} → ${shardConfig.name}`,
    );

    return {
      operation: 'SELECT Inventory + Transactions',
      input: { warehouseId },
      routing_decision: {
        step1_resolve_shard: `WarehouseID=${warehouseId} → ${shardKey}`,
        step2_get_connection: `Kết nối tới ${shardConfig.host}:${shardConfig.port} (REPLICA)`,
        step3_execute: `SELECT * FROM Inventory WHERE WarehouseID = ${warehouseId} trên ${shardConfig.name}`,
      },
      real_data: {
        inventoryRecordCount: inventoryCount,
        recentTransactions,
        note: 'Dữ liệu trên là THẬT từ database hiện tại',
      },
      comparison: {
        without_sharding: `Phải quét toàn bộ bảng Inventory trên 1 server → CHẬM khi có hàng triệu dòng`,
        with_sharding: `Chỉ quét Inventory trên ${shardConfig.name} → Dữ liệu nhỏ hơn ${shardConfig.warehouseRange.to - shardConfig.warehouseRange.from + 1}x, truy vấn NHANH hơn`,
      },
    };
  }

  /** Tổng quan cấu hình Sharding */
  getShardingOverview() {
    return {
      strategy: 'RANGE Sharding theo WarehouseID',
      shard_key: 'WarehouseID',
      description:
        'Dữ liệu được phân mảnh theo vùng miền dựa trên ID kho hàng. ' +
        'Mỗi shard là 1 MySQL server riêng biệt tại 1 khu vực địa lý.',
      shards: this.SHARD_CONFIG,
      production_setup: {
        step1: 'Cài ProxySQL hoặc Vitess làm Database Proxy',
        step2: 'Cấu hình routing rules: WarehouseID 1-10 → shard_north, 11-20 → shard_south',
        step3: 'Prisma DATABASE_URL trỏ vào ProxySQL thay vì MySQL trực tiếp',
        step4: 'Backend code KHÔNG CẦN thay đổi - Proxy tự routing',
      },
    };
  }
}
