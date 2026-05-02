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
var PartitionManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionManagerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PartitionManagerService = PartitionManagerService_1 = class PartitionManagerService {
    prisma;
    logger = new common_1.Logger(PartitionManagerService_1.name);
    TARGET_TABLE = 'InventoryTransactions';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.logPartitionStatus();
    }
    async isPartitioned() {
        const partitions = await this.queryPartitions();
        return partitions.length > 0;
    }
    async getPartitionDistribution() {
        const rows = await this.queryPartitions();
        return rows.map((row) => ({
            name: row.partitionName ?? 'unknown',
            rowCount: Number(row.tableRows),
            dataSizeKB: Math.round(Number(row.dataLength) / 1024),
            rangeUpperBound: row.partitionDescription ?? 'MAXVALUE',
        }));
    }
    async explainPartitionPruning(startDate, endDate) {
        const result = await this.prisma.$queryRawUnsafe(`EXPLAIN SELECT * FROM \`${this.TARGET_TABLE}\` ` +
            `WHERE \`TransactionDate\` >= ? AND \`TransactionDate\` < ?`, startDate, endDate);
        return result.map((row) => ({
            id: row.id,
            selectType: row.select_type,
            table: row.table,
            partitions: row.partitions,
            type: row.type,
            possibleKeys: row.possible_keys,
            key: row.key,
            rows: Number(row.rows),
            extra: row.Extra,
        }));
    }
    async getArchitectureOverview() {
        const partitioned = await this.isPartitioned();
        const distribution = partitioned
            ? await this.getPartitionDistribution()
            : [];
        return {
            replication: this.prisma.getReplicationStatus(),
            partitioning: {
                enabled: partitioned,
                table: this.TARGET_TABLE,
                strategy: partitioned ? 'RANGE COLUMNS (TransactionDate)' : 'NONE',
                totalPartitions: distribution.length,
                partitions: distribution,
            },
        };
    }
    async queryPartitions() {
        return this.prisma.$queryRaw `
      SELECT
        PARTITION_NAME        AS partitionName,
        TABLE_ROWS            AS tableRows,
        DATA_LENGTH           AS dataLength,
        PARTITION_DESCRIPTION AS partitionDescription
      FROM INFORMATION_SCHEMA.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ${this.TARGET_TABLE}
        AND PARTITION_NAME IS NOT NULL
      ORDER BY PARTITION_ORDINAL_POSITION
    `;
    }
    async logPartitionStatus() {
        try {
            const partitioned = await this.isPartitioned();
            if (partitioned) {
                const dist = await this.getPartitionDistribution();
                this.logger.log(`📊 ${this.TARGET_TABLE} PARTITIONED → ${dist.length} partitions`);
                for (const p of dist) {
                    this.logger.log(`   └─ ${p.name}: ${p.rowCount} rows, ${p.dataSizeKB} KB (< ${p.rangeUpperBound})`);
                }
            }
            else {
                this.logger.warn(`⚠️  ${this.TARGET_TABLE} is NOT partitioned. ` +
                    `Run prisma/custom-sql/04_real_partitioning.sql to enable.`);
            }
        }
        catch (error) {
            this.logger.warn(`Could not check partition status: ${error.message}`);
        }
    }
};
exports.PartitionManagerService = PartitionManagerService;
exports.PartitionManagerService = PartitionManagerService = PartitionManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartitionManagerService);
//# sourceMappingURL=partition-manager.service.js.map