"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("./common/database");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const products_module_1 = require("./modules/products/products.module");
const warehouse_module_1 = require("./modules/warehouse/warehouse.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const purchase_module_1 = require("./modules/purchase/purchase.module");
const sales_module_1 = require("./modules/sales/sales.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            warehouse_module_1.WarehouseModule,
            inventory_module_1.InventoryModule,
            purchase_module_1.PurchaseModule,
            sales_module_1.SalesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map