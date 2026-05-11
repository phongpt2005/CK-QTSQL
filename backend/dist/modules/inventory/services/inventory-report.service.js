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
var InventoryReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
let InventoryReportService = InventoryReportService_1 = class InventoryReportService {
    prisma;
    logger = new common_1.Logger(InventoryReportService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAggregatedInventoryByCTE() {
        this.logger.log('Executing RAW SQL CTE...');
        const rawResult = await this.prisma.$queryRaw `
      WITH InventorySummary AS (
        SELECT 
          ProductID, 
          SUM(Quantity) as TotalQuantity
        FROM Inventory
        GROUP BY ProductID
      )
      SELECT 
        p.ProductCode, 
        p.ProductName, 
        s.TotalQuantity 
      FROM InventorySummary s
      JOIN Products p ON s.ProductID = p.id
      ORDER BY s.TotalQuantity DESC;
    `;
        return rawResult;
    }
    async getInventoryFromView() {
        this.logger.log('Querying Database View via Raw SQL...');
        const viewData = await this.prisma.$queryRaw `
      SELECT ProductCode, ProductName, WarehouseName, Quantity 
      FROM InventoryReportView 
      WHERE Quantity > 0
      LIMIT 100;
    `;
        return viewData;
    }
    async decreaseInventoryStockRawAcid(productId, locationId, qtyToDecrease) {
        this.logger.log(`Executing ACID Transaction Raw for Product ${productId}`);
        return await this.prisma.$transaction(async (tx) => {
            const inventoryList = await tx.$queryRaw `
        SELECT id, Quantity 
        FROM Inventory 
        WHERE ProductID = ${productId} AND LocationID = ${locationId}
        FOR UPDATE;
      `;
            if (!inventoryList || inventoryList.length === 0) {
                throw new Error('Không tìm thấy tồn kho cho sản phẩm này ở vị trí chỉ định.');
            }
            const currentStock = inventoryList[0].Quantity;
            if (currentStock < qtyToDecrease) {
                throw new Error('Số lượng tồn kho không đủ để xuất.');
            }
            await tx.$executeRaw `
        UPDATE Inventory 
        SET Quantity = Quantity - ${qtyToDecrease}, LastUpdated = NOW()
        WHERE id = ${inventoryList[0].id};
      `;
            await tx.$executeRaw `
        INSERT INTO InventoryTransactions (ProductID, Quantity, TransactionType, TransactionDate)
        VALUES (${productId}, ${-qtyToDecrease}, 'OUT_RAW', NOW());
      `;
            return { success: true, oldStock: currentStock, newStock: currentStock - qtyToDecrease };
        });
    }
};
exports.InventoryReportService = InventoryReportService;
exports.InventoryReportService = InventoryReportService = InventoryReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryReportService);
//# sourceMappingURL=inventory-report.service.js.map