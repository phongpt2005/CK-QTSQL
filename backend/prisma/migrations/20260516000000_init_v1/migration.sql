-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(100) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `Role` VARCHAR(50) NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_Username_key`(`Username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `Code` VARCHAR(6) NOT NULL,
    `ExpiresAt` DATETIME(3) NOT NULL,
    `Used` BOOLEAN NOT NULL DEFAULT false,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `CategoryName` VARCHAR(100) NOT NULL,
    `Description` TEXT NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,
    `IsDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UnitName` VARCHAR(50) NOT NULL,
    `Symbol` VARCHAR(10) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductCode` VARCHAR(50) NOT NULL,
    `ProductName` VARCHAR(255) NOT NULL,
    `CategoryID` INTEGER NULL,
    `UnitID` INTEGER NULL,
    `Price` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `Description` TEXT NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,
    `IsDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Products_ProductCode_key`(`ProductCode`),
    INDEX `idx_product_code`(`ProductCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warehouses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `WarehouseName` VARCHAR(100) NOT NULL,
    `Address` VARCHAR(255) NULL,
    `Phone` VARCHAR(20) NULL,
    `ManagerName` VARCHAR(100) NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `WarehouseID` INTEGER NULL,
    `LocationCode` VARCHAR(50) NOT NULL,
    `Description` TEXT NULL,
    `Capacity` INTEGER NOT NULL DEFAULT 0,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SupplierCode` VARCHAR(50) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `Phone` VARCHAR(20) NULL,
    `Email` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `IsDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Suppliers_SupplierCode_key`(`SupplierCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `CustomerCode` VARCHAR(50) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `Phone` VARCHAR(20) NULL,
    `Email` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Status` INTEGER NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `IsDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Customers_CustomerCode_key`(`CustomerCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `POCode` VARCHAR(50) NOT NULL,
    `SupplierID` INTEGER NULL,
    `OrderDate` DATE NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `TotalAmount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `Note` TEXT NULL,
    `CreatedBy` INTEGER NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PurchaseOrders_POCode_key`(`POCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `POID` INTEGER NULL,
    `ProductID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,
    `UnitPrice` DECIMAL(18, 2) NOT NULL,
    `TotalPrice` DECIMAL(18, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoodsReceipts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ReceiptCode` VARCHAR(50) NOT NULL,
    `POID` INTEGER NULL,
    `ReceiptDate` DATE NOT NULL,
    `Status` VARCHAR(20) NULL,
    `Note` TEXT NULL,
    `CreatedBy` INTEGER NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GoodsReceipts_ReceiptCode_key`(`ReceiptCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoodsReceiptDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ReceiptID` INTEGER NULL,
    `ProductID` INTEGER NULL,
    `LocationID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SOCode` VARCHAR(50) NOT NULL,
    `CustomerID` INTEGER NULL,
    `OrderDate` DATE NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `TotalAmount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `Note` TEXT NULL,
    `CreatedBy` INTEGER NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SalesOrders_SOCode_key`(`SOCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SOID` INTEGER NULL,
    `ProductID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,
    `UnitPrice` DECIMAL(18, 2) NOT NULL,
    `TotalPrice` DECIMAL(18, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryNotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `DeliveryCode` VARCHAR(50) NOT NULL,
    `SOID` INTEGER NULL,
    `DeliveryDate` DATE NOT NULL,
    `Status` VARCHAR(20) NULL,
    `Note` TEXT NULL,
    `CreatedBy` INTEGER NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DeliveryNotes_DeliveryCode_key`(`DeliveryCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryNoteDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `DeliveryID` INTEGER NULL,
    `ProductID` INTEGER NULL,
    `LocationID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductID` INTEGER NULL,
    `WarehouseID` INTEGER NULL,
    `LocationID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL DEFAULT 0,
    `LastUpdated` DATETIME(3) NOT NULL,

    INDEX `idx_inventory_main`(`ProductID`, `WarehouseID`, `LocationID`),
    UNIQUE INDEX `Inventory_ProductID_WarehouseID_LocationID_key`(`ProductID`, `WarehouseID`, `LocationID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryTransactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductID` INTEGER NULL,
    `WarehouseID` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,
    `TransactionType` VARCHAR(50) NULL,
    `ReferenceType` VARCHAR(50) NULL,
    `ReferenceID` INTEGER NULL,
    `TransactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Note` TEXT NULL,

    INDEX `idx_transaction_product`(`ProductID`),
    INDEX `idx_transaction_date`(`TransactionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockReservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductID` INTEGER NULL,
    `WarehouseID` INTEGER NULL,
    `LocationID` INTEGER NULL,
    `ReservedQty` INTEGER NOT NULL,
    `ReferenceType` VARCHAR(50) NULL,
    `ReferenceID` INTEGER NULL,
    `Status` VARCHAR(20) NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `Subject` VARCHAR(255) NOT NULL,
    `Description` TEXT NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasswordResets` ADD CONSTRAINT `PasswordResets_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_CategoryID_fkey` FOREIGN KEY (`CategoryID`) REFERENCES `ProductCategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_UnitID_fkey` FOREIGN KEY (`UnitID`) REFERENCES `Units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Locations` ADD CONSTRAINT `Locations_WarehouseID_fkey` FOREIGN KEY (`WarehouseID`) REFERENCES `Warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrders` ADD CONSTRAINT `PurchaseOrders_SupplierID_fkey` FOREIGN KEY (`SupplierID`) REFERENCES `Suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrders` ADD CONSTRAINT `PurchaseOrders_CreatedBy_fkey` FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderDetails` ADD CONSTRAINT `PurchaseOrderDetails_POID_fkey` FOREIGN KEY (`POID`) REFERENCES `PurchaseOrders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderDetails` ADD CONSTRAINT `PurchaseOrderDetails_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceipts` ADD CONSTRAINT `GoodsReceipts_POID_fkey` FOREIGN KEY (`POID`) REFERENCES `PurchaseOrders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceipts` ADD CONSTRAINT `GoodsReceipts_CreatedBy_fkey` FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceiptDetails` ADD CONSTRAINT `GoodsReceiptDetails_ReceiptID_fkey` FOREIGN KEY (`ReceiptID`) REFERENCES `GoodsReceipts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceiptDetails` ADD CONSTRAINT `GoodsReceiptDetails_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceiptDetails` ADD CONSTRAINT `GoodsReceiptDetails_LocationID_fkey` FOREIGN KEY (`LocationID`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_CustomerID_fkey` FOREIGN KEY (`CustomerID`) REFERENCES `Customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_CreatedBy_fkey` FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderDetails` ADD CONSTRAINT `SalesOrderDetails_SOID_fkey` FOREIGN KEY (`SOID`) REFERENCES `SalesOrders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderDetails` ADD CONSTRAINT `SalesOrderDetails_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNotes` ADD CONSTRAINT `DeliveryNotes_SOID_fkey` FOREIGN KEY (`SOID`) REFERENCES `SalesOrders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNotes` ADD CONSTRAINT `DeliveryNotes_CreatedBy_fkey` FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNoteDetails` ADD CONSTRAINT `DeliveryNoteDetails_DeliveryID_fkey` FOREIGN KEY (`DeliveryID`) REFERENCES `DeliveryNotes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNoteDetails` ADD CONSTRAINT `DeliveryNoteDetails_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryNoteDetails` ADD CONSTRAINT `DeliveryNoteDetails_LocationID_fkey` FOREIGN KEY (`LocationID`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_WarehouseID_fkey` FOREIGN KEY (`WarehouseID`) REFERENCES `Warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_LocationID_fkey` FOREIGN KEY (`LocationID`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryTransactions` ADD CONSTRAINT `InventoryTransactions_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryTransactions` ADD CONSTRAINT `InventoryTransactions_WarehouseID_fkey` FOREIGN KEY (`WarehouseID`) REFERENCES `Warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockReservations` ADD CONSTRAINT `StockReservations_ProductID_fkey` FOREIGN KEY (`ProductID`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockReservations` ADD CONSTRAINT `StockReservations_WarehouseID_fkey` FOREIGN KEY (`WarehouseID`) REFERENCES `Warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockReservations` ADD CONSTRAINT `StockReservations_LocationID_fkey` FOREIGN KEY (`LocationID`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTickets` ADD CONSTRAINT `SupportTickets_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

