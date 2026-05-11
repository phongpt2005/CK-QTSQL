import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryReportService } from './services/inventory-report.service';
import { InventoryController } from './inventory.controller';
import { InventoryReportController } from './inventory-report.controller';

@Module({
  controllers: [InventoryController, InventoryReportController],
  providers: [InventoryService, InventoryReportService],
  exports: [InventoryService, InventoryReportService],
})
export class InventoryModule {}
