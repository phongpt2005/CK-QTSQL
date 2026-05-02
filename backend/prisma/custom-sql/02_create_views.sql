-- ==============================================================================
-- DATABASE VIEWS (KHUNG NHÌN ẢO)
-- Chạy đoạn mã này trong MySQL Workbench để tạo View
-- View giúp bạn viết query phức tạp (JOIN nhiều bảng) 1 lần và sử dụng lại như 1 bảng.
-- Prisma sẽ đọc View này thông qua `view` trong schema.prisma
-- ==============================================================================

USE wms_db;

-- 1. BÁO CÁO TỒN KHO CHI TIẾT
CREATE OR REPLACE VIEW `InventoryReportView` AS
SELECT 
    i.id AS id,
    p.id AS ProductID,
    p.ProductCode,
    p.ProductName,
    w.WarehouseName,
    l.LocationCode,
    i.Quantity
FROM 
    `Inventory` i
INNER JOIN `Products` p ON i.ProductID = p.id
INNER JOIN `Warehouses` w ON i.WarehouseID = w.id
INNER JOIN `Locations` l ON i.LocationID = l.id;

-- 2. TỔNG HỢP ĐƠN MUA HÀNG (INBOUND)
CREATE OR REPLACE VIEW `PurchaseOrderSummaryView` AS
SELECT 
    po.id AS id,
    po.POCode,
    s.Name AS SupplierName,
    po.OrderDate,
    po.Status,
    po.TotalAmount,
    COUNT(pod.id) AS TotalItems
FROM `PurchaseOrders` po
LEFT JOIN `Suppliers` s ON po.SupplierID = s.id
LEFT JOIN `PurchaseOrderDetails` pod ON po.id = pod.POID
GROUP BY po.id, po.POCode, s.Name, po.OrderDate, po.Status, po.TotalAmount;

-- 3. TỔNG HỢP ĐƠN BÁN HÀNG (OUTBOUND)
CREATE OR REPLACE VIEW `SalesOrderSummaryView` AS
SELECT 
    so.id AS id,
    so.SOCode,
    c.Name AS CustomerName,
    so.OrderDate,
    so.Status,
    so.TotalAmount,
    COUNT(sod.id) AS TotalItems
FROM `SalesOrders` so
LEFT JOIN `Customers` c ON so.CustomerID = c.id
LEFT JOIN `SalesOrderDetails` sod ON so.id = sod.SOID
GROUP BY so.id, so.SOCode, c.Name, so.OrderDate, so.Status, so.TotalAmount;

-- 4. NHẬT KÝ GIAO DỊCH (TRANSACTION HISTORY)
CREATE OR REPLACE VIEW `TransactionHistoryView` AS
SELECT 
    t.id AS id,
    t.TransactionDate,
    t.TransactionType,
    p.ProductCode,
    p.ProductName,
    w.WarehouseName,
    t.Quantity,
    t.ReferenceType,
    t.ReferenceID
FROM `InventoryTransactions` t
INNER JOIN `Products` p ON t.ProductID = p.id
LEFT JOIN `Warehouses` w ON t.WarehouseID = w.id;
