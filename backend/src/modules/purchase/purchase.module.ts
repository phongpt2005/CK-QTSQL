import { Module } from '@nestjs/common';
import { PurchaseOrdersService } from './services/purchase-orders.service';
import { GoodsReceiptsService } from './services/goods-receipts.service';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { GoodsReceiptsController } from './controllers/goods-receipts.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [PurchaseOrdersController, GoodsReceiptsController],
  providers: [PurchaseOrdersService, GoodsReceiptsService],
  exports: [PurchaseOrdersService, GoodsReceiptsService],
})
export class PurchaseModule {}
