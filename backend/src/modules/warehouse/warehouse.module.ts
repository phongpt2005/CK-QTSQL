import { Module } from '@nestjs/common';
import { WarehousesService } from './services/warehouses.service';
import { LocationsService } from './services/locations.service';
import { WarehousesController } from './controllers/warehouses.controller';
import { LocationsController } from './controllers/locations.controller';

@Module({
  controllers: [WarehousesController, LocationsController],
  providers: [WarehousesService, LocationsService],
  exports: [WarehousesService, LocationsService],
})
export class WarehouseModule {}
