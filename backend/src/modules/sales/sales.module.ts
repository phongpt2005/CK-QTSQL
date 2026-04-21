import { Module } from '@nestjs/common';
import { SalesOrdersService } from './services/sales-orders.service';
import { DeliveryNotesService } from './services/delivery-notes.service';
import { SalesOrdersController } from './controllers/sales-orders.controller';
import { DeliveryNotesController } from './controllers/delivery-notes.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [SalesOrdersController, DeliveryNotesController],
  providers: [SalesOrdersService, DeliveryNotesService],
  exports: [SalesOrdersService, DeliveryNotesService],
})
export class SalesModule {}
