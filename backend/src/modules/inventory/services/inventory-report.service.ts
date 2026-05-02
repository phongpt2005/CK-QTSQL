import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';

@Injectable()
export class InventoryReportService {
  private readonly logger = new Logger(InventoryReportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 1. Ví dụ sử dụng RAW SQL với CTE (Common Table Expression)
   * 
   * Bản chất: Truy vấn SQL thuần thay vì dùng ORM prisma.inventory.findMany()
   * Mục đích: Dùng CTE (WITH clause) để tổng hợp tồn kho theo nhóm trước khi truy xuất, 
   * giúp giảm tải cho database so với việc lấy lên Node.js rồi dùng JavaScript reduce/map.
   */
  async getAggregatedInventoryByCTE() {
    this.logger.log('Executing RAW SQL CTE...');
    
    // Câu lệnh SQL thuần túy với CTE (WITH)
    // CTE sẽ tính tổng tồn kho theo ProductID trên toàn bộ các kho
    const rawResult = await this.prisma.$queryRaw`
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

  /**
   * 2. Ví dụ sử dụng RAW SQL với Database VIEW
   * 
   * Dù Prisma có tính năng view, đôi khi query raw lên view vẫn nhanh và kiểm soát tốt hơn.
   * Đây là cách bạn trích xuất dữ liệu từ cái View (InventoryReportView) đã tạo trong MySQL Workbench.
   */
  async getInventoryFromView() {
    this.logger.log('Querying Database View via Raw SQL...');
    
    // Do Prisma trả về kiểu mảng object, ta có thể an tâm sử dụng
    const viewData = await this.prisma.$queryRaw`
      SELECT ProductCode, ProductName, WarehouseName, Quantity 
      FROM InventoryReportView 
      WHERE Quantity > 0
      LIMIT 100;
    `;

    return viewData;
  }

  /**
   * 3. Ví dụ thể hiện bản chất Transaction ACID và Row-Level Lock (SELECT FOR UPDATE)
   * 
   * Kỹ thuật này ngăn chặn Race Condition nếu có 2 hệ thống cùng lúc đọc và đòi trừ tồn kho.
   * Lệnh FOR UPDATE sẽ bắt máy chủ MySQL khóa cứng dòng dữ liệu đó, user thứ 2 phải chờ user 1 xong.
   */
  async decreaseInventoryStockRawAcid(productId: number, locationId: number, qtyToDecrease: number) {
    this.logger.log(`Executing ACID Transaction Raw for Product ${productId}`);

    // Bắt đầu một Transaction tương đương lệnh BEGIN; trong MySQL
    return await this.prisma.$transaction(async (tx) => {
      
      // BƯỚC 1: Khóa dòng (Row-level Lock)
      // Lấy dữ liệu tồn kho hiện tại, nhưng bắt MySQL khóa dòng này lại (Isolation)
      const inventoryList = await tx.$queryRaw<any[]>`
        SELECT id, Quantity 
        FROM Inventory 
        WHERE ProductID = ${productId} AND LocationID = ${locationId}
        FOR UPDATE;
      `;

      if (!inventoryList || inventoryList.length === 0) {
        throw new Error('Không tìm thấy tồn kho cho sản phẩm này ở vị trí chỉ định.');
      }

      const currentStock = inventoryList[0].Quantity;

      // Đảm bảo tính Consistency (Không để hàng bị âm)
      if (currentStock < qtyToDecrease) {
        throw new Error('Số lượng tồn kho không đủ để xuất.');
      }

      // BƯỚC 2: Cập nhật (Trừ hàng)
      // Chạy UPDATE bằng Raw SQL
      await tx.$executeRaw`
        UPDATE Inventory 
        SET Quantity = Quantity - ${qtyToDecrease}, LastUpdated = NOW()
        WHERE id = ${inventoryList[0].id};
      `;

      // Ghi log Transaction bằng Raw
      await tx.$executeRaw`
        INSERT INTO InventoryTransactions (ProductID, Quantity, TransactionType, TransactionDate)
        VALUES (${productId}, ${-qtyToDecrease}, 'OUT_RAW', NOW());
      `;

      return { success: true, oldStock: currentStock, newStock: currentStock - qtyToDecrease };
    });
    // Kết thúc vòng block này, Prisma tự gọi COMMIT; để chốt dữ liệu (Durability)
  }
}
