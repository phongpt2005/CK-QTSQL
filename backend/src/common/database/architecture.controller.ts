import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PartitionManagerService } from '../../common/database/partition-manager.service';
import { ShardingDemoService } from '../../common/database/sharding-demo.service';

/**
 * Admin-only endpoints exposing the real database architecture.
 *
 * These are NOT demo/mock endpoints. They query MySQL's INFORMATION_SCHEMA
 * and the application's connection pool to return live infrastructure data.
 */
@ApiTags('Admin - Architecture')
@ApiBearerAuth()
@Controller('admin/architecture')
@UseGuards(JwtAuthGuard)
export class ArchitectureController {
  constructor(
    private readonly partitionManager: PartitionManagerService,
    private readonly shardingDemo: ShardingDemoService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Full architecture overview (Replication + Partitioning + Sharding)',
  })
  async getOverview() {
    const base = await this.partitionManager.getArchitectureOverview();
    const sharding = this.shardingDemo.getShardingOverview();
    return { ...base, sharding };
  }

  @Get('partitions')
  @ApiOperation({
    summary: 'Partition distribution for InventoryTransactions',
  })
  getPartitions() {
    return this.partitionManager.getPartitionDistribution();
  }

  @Get('partitions/explain')
  @ApiOperation({
    summary: 'Demonstrate Partition Pruning via EXPLAIN',
    description:
      'Runs EXPLAIN on a date-filtered query. ' +
      'The "partitions" column proves MySQL only reads relevant partitions.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-04-01',
    description: 'Start date (inclusive)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-07-01',
    description: 'End date (exclusive)',
  })
  explainPruning(
    @Query('startDate') startDate = '2026-04-01',
    @Query('endDate') endDate = '2026-07-01',
  ) {
    return this.partitionManager.explainPartitionPruning(startDate, endDate);
  }

  // ──────────────────────────────────────────────
  // SHARDING DEMO ENDPOINTS
  // ──────────────────────────────────────────────

  @Get('sharding')
  @ApiOperation({
    summary: 'Tổng quan Sharding - Cấu hình phân mảnh theo WarehouseID',
  })
  getShardingOverview() {
    return this.shardingDemo.getShardingOverview();
  }

  @Get('sharding/routing')
  @ApiOperation({
    summary: 'Demo Sharding Routing - Xem kho được route tới server nào',
    description:
      'Nhập WarehouseID để xem logic Sharding sẽ đẩy dữ liệu tới server Miền Bắc hay Miền Nam.',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    example: 5,
    description: 'ID kho hàng (1-10: Miền Bắc, 11-20: Miền Nam)',
  })
  demoRouting(@Query('warehouseId') warehouseId = 1) {
    return this.shardingDemo.demoShardRouting(Number(warehouseId));
  }

  @Get('sharding/distribution')
  @ApiOperation({
    summary: 'Phân bố dữ liệu theo Shard - Mỗi shard chứa bao nhiêu dữ liệu',
    description:
      'Thống kê số kho, số giao dịch, số bản ghi tồn kho thuộc từng Shard.',
  })
  demoDistribution() {
    return this.shardingDemo.demoShardDistribution();
  }

  @Get('sharding/write-demo')
  @ApiOperation({
    summary: 'Demo Write Routing - Mô phỏng INSERT sẽ đi vào server nào',
    description:
      'Cho thấy khi tạo Phiếu nhập kho, lệnh INSERT sẽ được route tới Shard nào.',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    example: 5,
    description: 'ID kho hàng để mô phỏng ghi dữ liệu',
  })
  demoWrite(@Query('warehouseId') warehouseId = 5) {
    return this.shardingDemo.demoWriteRouting(Number(warehouseId));
  }

  @Get('sharding/read-demo')
  @ApiOperation({
    summary: 'Demo Read Routing - Mô phỏng SELECT sẽ đi vào server nào',
    description:
      'Cho thấy khi đọc tồn kho, lệnh SELECT sẽ được route tới Shard nào. Trả về dữ liệu THẬT.',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    example: 15,
    description: 'ID kho hàng để mô phỏng đọc dữ liệu',
  })
  demoRead(@Query('warehouseId') warehouseId = 1) {
    return this.shardingDemo.demoReadRouting(Number(warehouseId));
  }
}
