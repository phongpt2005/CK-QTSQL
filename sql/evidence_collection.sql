
-- ==============================================================================
-- TỔNG HỢP CÁC CÂU LỆNH MINH CHỨNG (EVIDENCE COLLECTION)
-- Dùng để chứng minh các kỹ thuật CSDL đã triển khai trong dự án WMS
-- Cách dùng: Mở MySQL Workbench → Bôi đen từng phần → Bấm tia sét (Execute)
-- ==============================================================================

USE wms_db;

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 1: MINH CHỨNG QUY MÔ DỮ LIỆU (DATA SCALE)            ║
-- ║ Chứng minh hệ thống đã nạp hàng vạn bản ghi khoa học       ║
-- ╚═══════════════════════════════════════════════════════════════╝

SELECT 
    (SELECT COUNT(*) FROM `Products`) AS Total_Products,
    (SELECT COUNT(*) FROM `Inventory`) AS Total_Inventory,
    (SELECT COUNT(*) FROM `Warehouses`) AS Total_Warehouses,
    (SELECT COUNT(*) FROM `Locations`) AS Total_Locations,
    (SELECT COUNT(*) FROM `Suppliers`) AS Total_Suppliers,
    (SELECT COUNT(*) FROM `Customers`) AS Total_Customers,
    (SELECT COUNT(*) FROM `Users`) AS Total_Users;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 2: MINH CHỨNG DANH SÁCH INDEX (CHỈ MỤC)               ║
-- ║ Chụp ảnh bảng kết quả để chứng minh Index đã được thiết lập ║
-- ╚═══════════════════════════════════════════════════════════════╝

SELECT 
    TABLE_NAME AS 'Bảng', 
    INDEX_NAME AS 'Tên Index', 
    COLUMN_NAME AS 'Cột được đánh Index', 
    NON_UNIQUE AS 'Duy nhất (0=Yes)', 
    INDEX_TYPE AS 'Loại cấu trúc'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'wms_db'
AND TABLE_NAME IN ('Inventory', 'InventoryTransactions', 'Products', 'Users',
                    'Suppliers', 'Customers')
ORDER BY TABLE_NAME, INDEX_NAME;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 3: MINH CHỨNG RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEYS)     ║
-- ║ Chứng minh các bảng liên kết chặt chẽ theo chuẩn quan hệ   ║
-- ╚═══════════════════════════════════════════════════════════════╝

SELECT 
    TABLE_NAME AS 'Bảng con',
    COLUMN_NAME AS 'Cột khóa ngoại',
    CONSTRAINT_NAME AS 'Tên ràng buộc',
    REFERENCED_TABLE_NAME AS 'Bảng cha',
    REFERENCED_COLUMN_NAME AS 'Cột tham chiếu'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'wms_db'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 4: MINH CHỨNG TỐI ƯU TRUY VẤN (EXPLAIN)               ║
-- ║ "Bằng chứng thép" cho thấy Index giúp hệ thống chạy nhanh  ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 4.1: Truy vấn Thẻ kho theo Sản phẩm (dùng Index idx_transaction_product)
EXPLAIN 
SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 
ORDER BY `TransactionDate` DESC;

-- 4.2: Truy vấn Tồn kho tại Vị trí cụ thể (dùng Composite Index)
EXPLAIN 
SELECT * FROM `Inventory` 
WHERE `ProductID` = 1 AND `WarehouseID` = 1 AND `LocationID` = 1;

-- 4.3: Truy vấn tìm sản phẩm theo mã (dùng UNIQUE Index)
EXPLAIN
SELECT * FROM `Products`
WHERE `ProductCode` = 'PRD-000500';


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 5: MINH CHỨNG DATABASE VIEW (BÁO CÁO TỔNG HỢP)       ║
-- ║ Chứng minh gom dữ liệu từ nhiều bảng thành 1 báo cáo      ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 5.1: Báo cáo tồn kho chi tiết (JOIN 4 bảng)
SELECT * FROM `InventoryReportView` LIMIT 10;

-- 5.2: Báo cáo Đơn mua hàng (JOIN 3 bảng)
SELECT * FROM `PurchaseOrderSummaryView` LIMIT 10;

-- 5.3: Báo cáo Đơn bán hàng (JOIN 3 bảng)
SELECT * FROM `SalesOrderSummaryView` LIMIT 10;

-- 5.4: Nhật ký giao dịch kho (JOIN 3 bảng)
SELECT * FROM `TransactionHistoryView` LIMIT 10;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 6: MINH CHỨNG KỸ THUẬT CTE (Common Table Expression)  ║
-- ║ Truy vấn phân tầng phức tạp dùng WITH ... AS               ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 6.1: Tổng hợp tồn kho theo sản phẩm (gom từ tất cả kho)
WITH InventorySummary AS (
    SELECT 
        ProductID, 
        SUM(Quantity) AS TotalQuantity
    FROM `Inventory`
    GROUP BY ProductID
)
SELECT 
    p.ProductCode, 
    p.ProductName, 
    s.TotalQuantity
FROM InventorySummary s
JOIN `Products` p ON s.ProductID = p.id
ORDER BY s.TotalQuantity DESC
LIMIT 20;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 7: MINH CHỨNG QUAN HỆ DỮ LIỆU SÂU (DEEP JOINS)      ║
-- ║ Truy vấn xuyên suốt từ Sản phẩm → Kho → Vị trí → Danh mục ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 7.1: Chi tiết sản phẩm kèm vị trí trong kho
SELECT 
    p.ProductCode, 
    p.ProductName, 
    c.CategoryName, 
    u.UnitName,
    w.WarehouseName, 
    l.LocationCode, 
    i.Quantity
FROM `Products` p
JOIN `ProductCategories` c ON p.CategoryID = c.id
JOIN `Units` u ON p.UnitID = u.id
JOIN `Inventory` i ON p.id = i.ProductID
JOIN `Warehouses` w ON i.WarehouseID = w.id
JOIN `Locations` l ON i.LocationID = l.id
WHERE i.Quantity > 0
LIMIT 20;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 8: MINH CHỨNG PHÂN TÍCH DỮ LIỆU (ANALYTICS)          ║
-- ║ Chứng minh DB có khả năng trả về báo cáo kinh doanh        ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 8.1: Top 10 danh mục có nhiều sản phẩm nhất
SELECT 
    c.CategoryName, 
    COUNT(p.id) AS TotalProducts
FROM `ProductCategories` c
LEFT JOIN `Products` p ON c.id = p.CategoryID
GROUP BY c.id, c.CategoryName
ORDER BY TotalProducts DESC
LIMIT 10;

-- 8.2: Phân bổ tồn kho theo kho (mô phỏng Sharding distribution)
SELECT 
    w.WarehouseName, 
    COUNT(i.id) AS SKU_Count,
    SUM(i.Quantity) AS Total_Items,
    ROUND(COUNT(i.id) * 100.0 / (SELECT COUNT(*) FROM `Inventory`), 2) AS Data_Percent
FROM `Inventory` i
JOIN `Warehouses` w ON i.WarehouseID = w.id
GROUP BY w.id, w.WarehouseName
ORDER BY w.id;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 9: MINH CHỨNG PARTITIONING (PHÂN VÙNG DỮ LIỆU)       ║
-- ║ (Chỉ chạy sau khi đã thực thi sql/04_real_partitioning.sql) ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- 9.1: Kiểm tra danh sách Partitions đã tạo
SELECT
  PARTITION_NAME AS 'Tên Partition',
  TABLE_ROWS AS 'Số dòng',
  ROUND(DATA_LENGTH / 1024, 2) AS 'Dung lượng (KB)',
  PARTITION_DESCRIPTION AS 'Giới hạn trên'
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_SCHEMA = 'wms_db'
  AND TABLE_NAME = 'InventoryTransactions'
  AND PARTITION_NAME IS NOT NULL
ORDER BY PARTITION_ORDINAL_POSITION;

-- 9.2: Chứng minh Partition Pruning (chỉ đọc 1 phân vùng)
EXPLAIN
SELECT * FROM `InventoryTransactions`
WHERE `TransactionDate` >= '2026-04-01'
  AND `TransactionDate` < '2026-07-01';
-- → Kỳ vọng: partitions = p_2026_q2

-- 9.3: So sánh: Truy vấn không có điều kiện ngày (đọc TẤT CẢ)
EXPLAIN
SELECT * FROM `InventoryTransactions`;
-- → Kỳ vọng: partitions = p_history,p_2026_q1,...,p_future


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PHẦN 10: MINH CHỨNG REPLICATION (CẤU HÌNH HỆ THỐNG)        ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Kiểm tra Server ID (phân biệt Master / Slave)
SHOW VARIABLES LIKE 'server_id';

-- Kiểm tra chế độ Read-Only (Slave bật ON, Master bật OFF)
SHOW VARIABLES LIKE 'read_only';

-- Kiểm tra Binary Log (Master dùng để đồng bộ sang Slave)
SHOW VARIABLES LIKE 'log_bin';

-- Kiểm tra cấu hình an toàn dữ liệu
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';
