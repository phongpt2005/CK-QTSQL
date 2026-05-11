"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_orders_service_1 = require("./services/purchase-orders.service");
const goods_receipts_service_1 = require("./services/goods-receipts.service");
const purchase_orders_controller_1 = require("./controllers/purchase-orders.controller");
const goods_receipts_controller_1 = require("./controllers/goods-receipts.controller");
const inventory_module_1 = require("../inventory/inventory.module");
let PurchaseModule = class PurchaseModule {
};
exports.PurchaseModule = PurchaseModule;
exports.PurchaseModule = PurchaseModule = __decorate([
    (0, common_1.Module)({
        imports: [inventory_module_1.InventoryModule],
        controllers: [purchase_orders_controller_1.PurchaseOrdersController, goods_receipts_controller_1.GoodsReceiptsController],
        providers: [purchase_orders_service_1.PurchaseOrdersService, goods_receipts_service_1.GoodsReceiptsService],
        exports: [purchase_orders_service_1.PurchaseOrdersService, goods_receipts_service_1.GoodsReceiptsService],
    })
], PurchaseModule);
//# sourceMappingURL=purchase.module.js.map