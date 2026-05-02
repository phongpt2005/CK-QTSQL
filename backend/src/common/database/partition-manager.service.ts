import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Raw result shape from INFORMATION_SCHEMA.PARTITIONS */
interface RawPartitionRow {
  partitionName: string | null;
  tableRows: bigint;
  dataLength: bigint;
  partitionDescription: string | null;
}

/** Clean, serialisable partition info returned to callers. */
export interface PartitionInfo {
  name: string;
  rowCount: number;
  dataSizeKB: number;
  rangeUpperBound: string;
}

/**
 * Manages MySQL table partitioning for InventoryTransactions.
 *
 * This is NOT a simulation. It reads real partition metadata from
 * MySQL's INFORMATION_SCHEMA and provides runtime diagnostics
 * for the partitioning applied by `04_real_partitioning.sql`.
 *
 * Responsibilities:
 *   1. Log partition status on application startup
 *   2. Expose partition distribution data for admin dashboards
 *   3. Demonstrate partition pruning with EXPLAIN
 */
@Injectable()
export class PartitionManagerService implements OnModuleInit {
  private readonly logger = new Logger(PartitionManagerService.name);
  private readonly TARGET_TABLE = 'InventoryTransactions';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.logPartitionStatus();
  }

  // ──────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────

  /** Check whether partitioning is active on the target table. */
  async isPartitioned(): Promise<boolean> {
    const partitions = await this.queryPartitions();
    return partitions.length > 0;
  }

  /** Get detailed info for every partition. */
  async getPartitionDistribution(): Promise<PartitionInfo[]> {
    const rows = await this.queryPartitions();

    return rows.map((row) => ({
      name: row.partitionName ?? 'unknown',
      rowCount: Number(row.tableRows),
      dataSizeKB: Math.round(Number(row.dataLength) / 1024),
      rangeUpperBound: row.partitionDescription ?? 'MAXVALUE',
    }));
  }

  /**
   * Run EXPLAIN on a date-filtered query and return the partitions MySQL chose.
   *
   * When partitioning is active the `partitions` column will list ONLY the
   * relevant partition instead of the full table — proving Partition Pruning.
   */
  async explainPartitionPruning(startDate: string, endDate: string) {
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `EXPLAIN SELECT * FROM \`${this.TARGET_TABLE}\` ` +
        `WHERE \`TransactionDate\` >= ? AND \`TransactionDate\` < ?`,
      startDate,
      endDate,
    );

    return result.map((row: any) => ({
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

  /**
   * Full architecture overview combining replication + partitioning status.
   * Suitable for admin dashboard or academic demonstration.
   */
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

  // ──────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────

  private async queryPartitions(): Promise<RawPartitionRow[]> {
    return this.prisma.$queryRaw<RawPartitionRow[]>`
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

  private async logPartitionStatus(): Promise<void> {
    try {
      const partitioned = await this.isPartitioned();

      if (partitioned) {
        const dist = await this.getPartitionDistribution();
        this.logger.log(
          `📊 ${this.TARGET_TABLE} PARTITIONED → ${dist.length} partitions`,
        );
        for (const p of dist) {
          this.logger.log(
            `   └─ ${p.name}: ${p.rowCount} rows, ${p.dataSizeKB} KB (< ${p.rangeUpperBound})`,
          );
        }
      } else {
        this.logger.warn(
          `⚠️  ${this.TARGET_TABLE} is NOT partitioned. ` +
            `Run prisma/custom-sql/04_real_partitioning.sql to enable.`,
        );
      }
    } catch (error) {
      this.logger.warn(`Could not check partition status: ${error.message}`);
    }
  }
}
