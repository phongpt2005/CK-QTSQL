"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    findAll(warehouseId, productId, locationId, page, limit) {
        return this.inventoryService.findAll({
            warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
            productId: productId ? parseInt(productId) : undefined,
            locationId: locationId ? parseInt(locationId) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    getTransactions(productId, warehouseId, page, limit) {
        return this.inventoryService.getTransactions({
            productId: productId ? parseInt(productId) : undefined,
            warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    findByProduct(productId) {
        return this.inventoryService.findByProduct(productId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List inventory with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'warehouseId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'locationId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('locationId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'List inventory transactions' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'warehouseId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock summary for a product (all locations)' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findByProduct", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map