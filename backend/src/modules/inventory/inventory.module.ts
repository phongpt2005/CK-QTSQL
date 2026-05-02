import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryReportService } from './services/inventory-report.service';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryReportService],
  exports: [InventoryService, InventoryReportService],
})
export class InventoryModule {}
