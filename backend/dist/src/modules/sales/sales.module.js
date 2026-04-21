"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_orders_service_1 = require("./services/sales-orders.service");
const delivery_notes_service_1 = require("./services/delivery-notes.service");
const sales_orders_controller_1 = require("./controllers/sales-orders.controller");
const delivery_notes_controller_1 = require("./controllers/delivery-notes.controller");
const inventory_module_1 = require("../inventory/inventory.module");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [inventory_module_1.InventoryModule],
        controllers: [sales_orders_controller_1.SalesOrdersController, delivery_notes_controller_1.DeliveryNotesController],
        providers: [sales_orders_service_1.SalesOrdersService, delivery_notes_service_1.DeliveryNotesService],
        exports: [sales_orders_service_1.SalesOrdersService, delivery_notes_service_1.DeliveryNotesService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map