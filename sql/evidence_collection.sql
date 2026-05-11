

USE wms_db;

-- ------------------------------------------------------------------------------
-- PHẦN 1: MINH CHỨNG DANH SÁCH INDEX (CHỈ MỤC)
-- Chụp ảnh bảng kết quả này để chứng minh bạn đã thiết lập Index thành công.
-- ------------------------------------------------------------------------------
SELECT 
    TABLE_NAME AS 'Bảng', 
    INDEX_NAME AS 'Tên Index', 
    COLUMN_NAME AS 'Cột được đánh Index', 
    NON_UNIQUE AS 'Duy nhất (0=Yes)', 
    INDEX_TYPE AS 'Loại cấu trúc'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'wms_db'
AND TABLE_NAME IN ('Inventory', 'InventoryTransactions', 'Products', 'User')
ORDER BY TABLE_NAME, INDEX_NAME;


-- ------------------------------------------------------------------------------
-- PHẦN 2: MINH CHỨNG TỐI ƯU TRUY VẤN (EXPLAIN)
-- Đây là "Bằng chứng thép" cho thấy Index giúp hệ thống chạy nhanh.
-- ------------------------------------------------------------------------------

-- Minh chứng 1: Truy vấn Thẻ kho (Inventory Transactions) theo Sản phẩm
-- Hãy chụp ảnh bảng kết quả EXPLAIN này. Lưu ý cột 'key' và 'rows'.
EXPLAIN 
SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 
ORDER BY `TransactionDate` DESC;

-- Minh chứng 2: Truy vấn Tồn kho tại Vị trí cụ thể
-- Chứng minh tính hiệu quả của Composite Index (Index tổ hợp)
EXPLAIN 
SELECT * FROM `Inventory` 
WHERE `ProductID` = 1 AND `WarehouseID` = 1 AND `LocationID` = 1;


-- ------------------------------------------------------------------------------
-- PHẦN 3: MINH CHỨNG DATABASE VIEW (BÁO CÁO TỔNG HỢP)
-- Chứng minh bạn đã gom dữ liệu từ nhiều bảng thành 1 báo cáo chuyên nghiệp.
-- ------------------------------------------------------------------------------

-- Xem kết quả từ View báo cáo tồn kho
SELECT * FROM `InventoryReportView` LIMIT 10;

-- Xem kết quả từ View báo cáo Đơn mua hàng (PO)
SELECT * FROM `PurchaseOrderSummaryView` LIMIT 10;
