import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { CategoriesService } from './services/categories.service';
import { UnitsService } from './services/units.service';
import { SuppliersService } from './services/suppliers.service';
import { CustomersService } from './services/customers.service';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { UnitsController } from './controllers/units.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { CustomersController } from './controllers/customers.controller';

@Module({
  controllers: [
    ProductsController,
    CategoriesController,
    UnitsController,
    SuppliersController,
    CustomersController,
  ],
  providers: [
    ProductsService,
    CategoriesService,
    UnitsService,
    SuppliersService,
    CustomersService,
  ],
  exports: [
    ProductsService,
    CategoriesService,
    UnitsService,
    SuppliersService,
    CustomersService,
  ],
})
export class ProductsModule {}
