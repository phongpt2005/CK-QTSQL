import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SalesModule } from './modules/sales/sales.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AllocationModule } from './modules/allocation/allocation.module';

@Module({
  imports: [
    // Core
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    WarehouseModule,
    InventoryModule,
    PurchaseModule,
    SalesModule,
    SupportModule,
    NotificationsModule,
    AllocationModule,
  ],
})
export class AppModule {}
