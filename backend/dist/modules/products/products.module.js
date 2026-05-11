"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./services/products.service");
const categories_service_1 = require("./services/categories.service");
const units_service_1 = require("./services/units.service");
const suppliers_service_1 = require("./services/suppliers.service");
const customers_service_1 = require("./services/customers.service");
const products_controller_1 = require("./controllers/products.controller");
const categories_controller_1 = require("./controllers/categories.controller");
const units_controller_1 = require("./controllers/units.controller");
const suppliers_controller_1 = require("./controllers/suppliers.controller");
const customers_controller_1 = require("./controllers/customers.controller");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            products_controller_1.ProductsController,
            categories_controller_1.CategoriesController,
            units_controller_1.UnitsController,
            suppliers_controller_1.SuppliersController,
            customers_controller_1.CustomersController,
        ],
        providers: [
            products_service_1.ProductsService,
            categories_service_1.CategoriesService,
            units_service_1.UnitsService,
            suppliers_service_1.SuppliersService,
            customers_service_1.CustomersService,
        ],
        exports: [
            products_service_1.ProductsService,
            categories_service_1.CategoriesService,
            units_service_1.UnitsService,
            suppliers_service_1.SuppliersService,
            customers_service_1.CustomersService,
        ],
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map