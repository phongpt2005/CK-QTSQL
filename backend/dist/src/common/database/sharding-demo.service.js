"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShardingDemoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingDemoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let ShardingDemoService = ShardingDemoService_1 = class ShardingDemoService {
    prisma;
    logger = new common_1.Logger(ShardingDemoService_1.name);
    SHARD_CONFIG = {
        shard_north: {
            name: 'Shard Miền Bắc',
            host: 'db-north.wms.vn',
            port: 3306,
            warehouseRange: { from: 1, to: 10 },
            region: 'Hà Nội, Hải Phòng, Đà Nẵng',
        },
        shard_south: {
            name: 'Shard Miền Nam',
            host: 'db-south.wms.vn',
            port: 3306,
            warehouseRange: { from: 11, to: 20 },
            region: 'TP.HCM, Bình Dương, Cần Thơ',
        },
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveShardKey(warehouseId) {
        if (warehouseId >= 1 && warehouseId <= 10) {
            return 'shard_north';
        }
        return 'shard_south';
    }
    async demoShardRouting(warehouseId) {
        const shardKey = this.resolveShardKey(warehouseId);
        const shardConfig = this.SHARD_CONFIG[shardKey];
        const warehouse = await this.prisma.reader.warehouse.findUnique({
            where: { id: warehouseId },
        });
        this.logger.log(`📍 WarehouseID=${warehouseId} → Routed to ${shardConfig.name} (${shardConfig.host})`);
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
    async demoShardDistribution() {
        const warehouses = await this.prisma.reader.warehouse.findMany({
            orderBy: { id: 'asc' },
        });
        const shardNorthWarehouses = warehouses.filter((w) => w.id <= 10);
        const shardSouthWarehouses = warehouses.filter((w) => w.id > 10);
        const [northTxCount, southTxCount, northInvCount, southInvCount] = await Promise.all([
            this.prisma.reader.$queryRaw `
          SELECT COUNT(*) as count FROM InventoryTransactions WHERE WarehouseID <= 10
        `,
            this.prisma.reader.$queryRaw `
          SELECT COUNT(*) as count FROM InventoryTransactions WHERE WarehouseID > 10
        `,
            this.prisma.reader.$queryRaw `
          SELECT COUNT(*) as count FROM Inventory WHERE WarehouseID <= 10
        `,
            this.prisma.reader.$queryRaw `
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
                totalTransactions: Number(northTxCount[0]?.count ?? 0) +
                    Number(southTxCount[0]?.count ?? 0),
                benefit: 'Trong production, mỗi shard nằm trên 1 server riêng → ' +
                    'tải được phân đều, nếu 1 shard chết thì shard còn lại vẫn hoạt động.',
            },
        };
    }
    async demoWriteRouting(warehouseId) {
        const shardKey = this.resolveShardKey(warehouseId);
        const shardConfig = this.SHARD_CONFIG[shardKey];
        this.logger.log(`✏️ [WRITE] Phiếu nhập kho WH=${warehouseId} → ${shardConfig.name}`);
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
    async demoReadRouting(warehouseId) {
        const shardKey = this.resolveShardKey(warehouseId);
        const shardConfig = this.SHARD_CONFIG[shardKey];
        const inventoryCount = await this.prisma.reader.inventory.count({
            where: { warehouseId },
        });
        const recentTransactions = await this.prisma.reader.inventoryTransaction.findMany({
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
        this.logger.log(`📖 [READ] Tồn kho WH=${warehouseId} → ${shardConfig.name}`);
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
    getShardingOverview() {
        return {
            strategy: 'RANGE Sharding theo WarehouseID',
            shard_key: 'WarehouseID',
            description: 'Dữ liệu được phân mảnh theo vùng miền dựa trên ID kho hàng. ' +
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
};
exports.ShardingDemoService = ShardingDemoService;
exports.ShardingDemoService = ShardingDemoService = ShardingDemoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShardingDemoService);
//# sourceMappingURL=sharding-demo.service.js.map