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
exports.ArchitectureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const partition_manager_service_1 = require("../../common/database/partition-manager.service");
const sharding_demo_service_1 = require("../../common/database/sharding-demo.service");
let ArchitectureController = class ArchitectureController {
    partitionManager;
    shardingDemo;
    constructor(partitionManager, shardingDemo) {
        this.partitionManager = partitionManager;
        this.shardingDemo = shardingDemo;
    }
    async getOverview() {
        const base = await this.partitionManager.getArchitectureOverview();
        const sharding = this.shardingDemo.getShardingOverview();
        return { ...base, sharding };
    }
    getPartitions() {
        return this.partitionManager.getPartitionDistribution();
    }
    explainPruning(startDate = '2026-04-01', endDate = '2026-07-01') {
        return this.partitionManager.explainPartitionPruning(startDate, endDate);
    }
    getShardingOverview() {
        return this.shardingDemo.getShardingOverview();
    }
    demoRouting(warehouseId = 1) {
        return this.shardingDemo.demoShardRouting(Number(warehouseId));
    }
    demoDistribution() {
        return this.shardingDemo.demoShardDistribution();
    }
    demoWrite(warehouseId = 5) {
        return this.shardingDemo.demoWriteRouting(Number(warehouseId));
    }
    demoRead(warehouseId = 1) {
        return this.shardingDemo.demoReadRouting(Number(warehouseId));
    }
};
exports.ArchitectureController = ArchitectureController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Full architecture overview (Replication + Partitioning + Sharding)',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArchitectureController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('partitions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Partition distribution for InventoryTransactions',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "getPartitions", null);
__decorate([
    (0, common_1.Get)('partitions/explain'),
    (0, swagger_1.ApiOperation)({
        summary: 'Demonstrate Partition Pruning via EXPLAIN',
        description: 'Runs EXPLAIN on a date-filtered query. ' +
            'The "partitions" column proves MySQL only reads relevant partitions.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        example: '2026-04-01',
        description: 'Start date (inclusive)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        example: '2026-07-01',
        description: 'End date (exclusive)',
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "explainPruning", null);
__decorate([
    (0, common_1.Get)('sharding'),
    (0, swagger_1.ApiOperation)({
        summary: 'Tổng quan Sharding - Cấu hình phân mảnh theo WarehouseID',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "getShardingOverview", null);
__decorate([
    (0, common_1.Get)('sharding/routing'),
    (0, swagger_1.ApiOperation)({
        summary: 'Demo Sharding Routing - Xem kho được route tới server nào',
        description: 'Nhập WarehouseID để xem logic Sharding sẽ đẩy dữ liệu tới server Miền Bắc hay Miền Nam.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'warehouseId',
        required: false,
        example: 5,
        description: 'ID kho hàng (1-10: Miền Bắc, 11-20: Miền Nam)',
    }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "demoRouting", null);
__decorate([
    (0, common_1.Get)('sharding/distribution'),
    (0, swagger_1.ApiOperation)({
        summary: 'Phân bố dữ liệu theo Shard - Mỗi shard chứa bao nhiêu dữ liệu',
        description: 'Thống kê số kho, số giao dịch, số bản ghi tồn kho thuộc từng Shard.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "demoDistribution", null);
__decorate([
    (0, common_1.Get)('sharding/write-demo'),
    (0, swagger_1.ApiOperation)({
        summary: 'Demo Write Routing - Mô phỏng INSERT sẽ đi vào server nào',
        description: 'Cho thấy khi tạo Phiếu nhập kho, lệnh INSERT sẽ được route tới Shard nào.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'warehouseId',
        required: false,
        example: 5,
        description: 'ID kho hàng để mô phỏng ghi dữ liệu',
    }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "demoWrite", null);
__decorate([
    (0, common_1.Get)('sharding/read-demo'),
    (0, swagger_1.ApiOperation)({
        summary: 'Demo Read Routing - Mô phỏng SELECT sẽ đi vào server nào',
        description: 'Cho thấy khi đọc tồn kho, lệnh SELECT sẽ được route tới Shard nào. Trả về dữ liệu THẬT.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'warehouseId',
        required: false,
        example: 15,
        description: 'ID kho hàng để mô phỏng đọc dữ liệu',
    }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArchitectureController.prototype, "demoRead", null);
exports.ArchitectureController = ArchitectureController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Architecture'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/architecture'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [partition_manager_service_1.PartitionManagerService,
        sharding_demo_service_1.ShardingDemoService])
], ArchitectureController);
//# sourceMappingURL=architecture.controller.js.map