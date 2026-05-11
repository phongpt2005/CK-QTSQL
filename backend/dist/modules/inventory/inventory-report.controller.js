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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const inventory_report_service_1 = require("./services/inventory-report.service");
let InventoryReportController = class InventoryReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    getFromView() {
        return this.reportService.getInventoryFromView();
    }
    getAggregatedByCTE() {
        return this.reportService.getAggregatedInventoryByCTE();
    }
};
exports.InventoryReportController = InventoryReportController;
__decorate([
    (0, common_1.Get)('view'),
    (0, swagger_1.ApiOperation)({
        summary: 'Báo cáo tồn kho từ Database View (SQL View)',
        description: 'Lấy dữ liệu tồn kho từ InventoryReportView đã được tạo sẵn trong MySQL. ' +
            'View này JOIN 4 bảng (Inventory, Products, Warehouses, Locations) ở tầng Database, ' +
            'giúp truy vấn nhanh hơn so với ORM findMany() kèm include.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryReportController.prototype, "getFromView", null);
__decorate([
    (0, common_1.Get)('cte'),
    (0, swagger_1.ApiOperation)({
        summary: 'Báo cáo tổng hợp tồn kho bằng CTE (Common Table Expression)',
        description: 'Sử dụng SQL thuần với CTE (WITH clause) để tính tổng tồn kho ' +
            'theo từng sản phẩm trên toàn bộ các kho và vị trí. ' +
            'Phù hợp cho Kế toán kho và Quản lý tổng quan.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryReportController.prototype, "getAggregatedByCTE", null);
exports.InventoryReportController = InventoryReportController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory/report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_report_service_1.InventoryReportService])
], InventoryReportController);
//# sourceMappingURL=inventory-report.controller.js.map