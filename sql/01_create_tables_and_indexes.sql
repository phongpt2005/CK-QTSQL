-- ==============================================================================
-- BẢN CHẤT CÁC CÂU LỆNH TẠO BẢNG VÀ CHỈ MỤC (INDEX) BÊN DƯỚI PRISMA
-- File này dùng để học tập và thực hành trên MySQL Workbench
-- ==============================================================================

-- 1. BẢN CHẤT LỆNH CREATE TABLE
-- Dưới đây là cách MySQL tạo bảng Inventory thực tế (Prisma generate ra lệnh tương tự)
CREATE TABLE IF NOT EXISTS `Inventory` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `ProductID` INT NULL,
    `WarehouseID` INT NULL,
    `LocationID` INT NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `LastUpdated` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_inventory_product` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `Warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_inventory_location` FOREIGN KEY (`LocationID`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢN CHẤT LỆNH CREATE INDEX (TẠO CHỈ MỤC)
-- Index B-Tree giúp truy vấn tìm kiếm nhanh hơn. Khi dùng @@index trong schema.prisma, nó sẽ sinh ra lệnh này.
-- Mục đích: Tăng tốc độ khi query "Lấy tồn kho của Sản Phẩm A tại Kho B và Vị Trí C"
CREATE INDEX `idx_inventory_main` ON `Inventory`(`ProductID`, `WarehouseID`, `LocationID`);

-- 3. BẢN CHẤT UNIQUE CONSTRAINT (Ràng buộc duy nhất)
-- Khi dùng @@unique trong schema.prisma, nó đảm bảo không bao giờ có 2 dòng trùng nhau cho cùng 1 Sản phẩm ở 1 Vị trí.
CREATE UNIQUE INDEX `Inventory_ProductID_WarehouseID_LocationID_key` ON `Inventory`(`ProductID`, `WarehouseID`, `LocationID`);

-- 4. BẢN CHẤT CÂU LỆNH INSERT
-- Khi bạn gọi prisma.inventory.create({ data: ... }), bản chất lệnh chạy ở CSDL là:
INSERT INTO `Inventory` (`ProductID`, `WarehouseID`, `LocationID`, `Quantity`, `LastUpdated`) 
VALUES (1, 1, 1, 100, NOW());

-- ==============================================================================
-- KỸ THUẬT ACID BẰNG RAW SQL (Row-level lock)
-- Prisma dùng $transaction, bản chất MySQL sẽ thực thi tuần tự như sau:
-- ==============================================================================

BEGIN; -- Bắt đầu giao dịch (Atomicity)

-- Chọn dòng cần cập nhật và KHÓA NÓ LẠI (Isolation - Chống người khác sửa cùng lúc)
SELECT id, Quantity 
FROM `Inventory` 
WHERE `ProductID` = 1 AND `LocationID` = 1 
FOR UPDATE; 

-- Trừ tồn kho (Consistency)
UPDATE `Inventory` 
SET `Quantity` = `Quantity` - 10 
WHERE `id` = 1;

COMMIT; -- Ghi vĩnh viễn vào ổ cứng (Durability)
