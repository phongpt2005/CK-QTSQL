# BÁO CÁO QUẢN TRỊ CƠ SỞ DỮ LIỆU
## Hệ thống Quản lý Kho hàng (WMS Pro)

**Công nghệ sử dụng:** MySQL 8.0 + Prisma ORM + NestJS Backend
**Tổng số bảng:** 21 bảng (18 bảng dữ liệu + 4 Database Views - 1 bảng phụ trợ)

---

# CHƯƠNG 1: THIẾT KẾ CƠ SỞ DỮ LIỆU

## 1.1. Phân tích Thực thể (Entity Analysis)

Hệ thống WMS được thiết kế dựa trên **21 thực thể**, chia thành 5 nhóm chức năng:

### Nhóm 1: Quản lý Người dùng
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| User | `Users` | Lưu trữ tài khoản đăng nhập (Admin, Staff) |
| PasswordReset | `PasswordResets` | Quản lý mã OTP đặt lại mật khẩu |
| SupportTicket | `SupportTickets` | Quản lý phiếu hỗ trợ kỹ thuật |

### Nhóm 2: Danh mục & Sản phẩm
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| ProductCategory | `ProductCategories` | Phân loại sản phẩm (Điện tử, Thực phẩm...) |
| Unit | `Units` | Đơn vị tính (Cái, Thùng, Kg...) |
| Product | `Products` | Thông tin chi tiết hàng hóa trong kho |

### Nhóm 3: Kho bãi & Vị trí
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| Warehouse | `Warehouses` | Thông tin kho vật lý (địa chỉ, quản lý) |
| Location | `Locations` | Vị trí chi tiết trong kho (Khu A, Kệ 1) |

### Nhóm 4: Đối tác kinh doanh
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| Supplier | `Suppliers` | Nhà cung cấp hàng hóa |
| Customer | `Customers` | Khách hàng mua hàng |

### Nhóm 5: Nghiệp vụ Nhập/Xuất kho & Tồn kho
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| PurchaseOrder | `PurchaseOrders` | Đơn mua hàng (Nhập kho) |
| PurchaseOrderDetail | `PurchaseOrderDetails` | Chi tiết từng dòng đơn mua |
| GoodsReceipt | `GoodsReceipts` | Phiếu nhập kho thực tế |
| GoodsReceiptDetail | `GoodsReceiptDetails` | Chi tiết từng dòng phiếu nhập |
| SalesOrder | `SalesOrders` | Đơn bán hàng (Xuất kho) |
| SalesOrderDetail | `SalesOrderDetails` | Chi tiết từng dòng đơn bán |
| DeliveryNote | `DeliveryNotes` | Phiếu xuất kho thực tế |
| DeliveryNoteDetail | `DeliveryNoteDetails` | Chi tiết từng dòng phiếu xuất |
| Inventory | `Inventory` | Số lượng tồn kho tại từng vị trí |
| InventoryTransaction | `InventoryTransactions` | Nhật ký mọi biến động Nhập/Xuất |
| StockReservation | `StockReservations` | Giữ hàng tạm khi tạo đơn bán |

---

## 1.2. Quan hệ giữa các Thực thể (Relationships)

```
Users ──1:N──> PurchaseOrders ──1:N──> PurchaseOrderDetails ──N:1──> Products
Users ──1:N──> SalesOrders    ──1:N──> SalesOrderDetails    ──N:1──> Products
Users ──1:N──> GoodsReceipts  ──1:N──> GoodsReceiptDetails  ──N:1──> Products
Users ──1:N──> DeliveryNotes  ──1:N──> DeliveryNoteDetails  ──N:1──> Products
Users ──1:N──> PasswordResets
Users ──1:N──> SupportTickets

Products ──N:1──> ProductCategories
Products ──N:1──> Units
Products ──1:N──> Inventory         ──N:1──> Warehouses
                  Inventory         ──N:1──> Locations ──N:1──> Warehouses
Products ──1:N──> StockReservations

Suppliers ──1:N──> PurchaseOrders
Customers ──1:N──> SalesOrders
PurchaseOrders ──1:N──> GoodsReceipts
SalesOrders    ──1:N──> DeliveryNotes
```

---

## 1.3. Data Dictionary (Từ điển Dữ liệu)

### Bảng: `Users`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| Username | VARCHAR(100) | UNIQUE NOT NULL | Tên đăng nhập duy nhất |
| PasswordHash | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa bcrypt |
| Role | VARCHAR(50) | NULL | Vai trò: Admin, Staff |
| Status | INT | DEFAULT 1 | 1=Hoạt động, 0=Khóa |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo tài khoản |

### Bảng: `PasswordResets`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| UserID | INT | FK → Users.id | Tài khoản cần đặt lại mật khẩu |
| Code | VARCHAR(6) | NOT NULL | Mã OTP 6 chữ số |
| ExpiresAt | DATETIME | NOT NULL | Thời điểm hết hạn OTP |
| Used | BOOLEAN | DEFAULT false | Đã sử dụng chưa |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo mã |

### Bảng: `SupportTickets`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| UserID | INT | FK → Users.id | Người gửi phiếu hỗ trợ |
| Subject | VARCHAR(255) | NOT NULL | Tiêu đề phiếu |
| Description | TEXT | NOT NULL | Nội dung mô tả chi tiết |
| Status | VARCHAR(20) | DEFAULT "PENDING" | Trạng thái: PENDING, RESOLVED |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật cuối |

### Bảng: `ProductCategories`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| CategoryName | VARCHAR(100) | NOT NULL | Tên danh mục (Điện tử, Thực phẩm) |
| Description | TEXT | NULL | Mô tả chi tiết danh mục |
| Status | INT | DEFAULT 1 | 1=Hoạt động, 0=Ẩn |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật |
| IsDeleted | BOOLEAN | DEFAULT false | Xóa mềm (Soft Delete) |

### Bảng: `Units`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| UnitName | VARCHAR(50) | NOT NULL | Tên đơn vị (Cái, Thùng, Kg) |
| Symbol | VARCHAR(10) | NULL | Ký hiệu viết tắt (pce, box, kg) |

### Bảng: `Products`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ProductCode | VARCHAR(50) | UNIQUE NOT NULL | Mã vạch/QR sản phẩm |
| ProductName | VARCHAR(255) | NOT NULL | Tên hiển thị sản phẩm |
| CategoryID | INT | FK → ProductCategories.id | Liên kết danh mục |
| UnitID | INT | FK → Units.id | Liên kết đơn vị tính |
| Price | DECIMAL(18,2) | DEFAULT 0 | Đơn giá sản phẩm |
| Description | TEXT | NULL | Mô tả chi tiết |
| Status | INT | DEFAULT 1 | 1=Kinh doanh, 0=Ngừng |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật |
| IsDeleted | BOOLEAN | DEFAULT false | Xóa mềm (Soft Delete) |

### Bảng: `Warehouses`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| WarehouseName | VARCHAR(100) | NOT NULL | Tên kho (Kho Chính, Kho Phụ) |
| Address | VARCHAR(255) | NULL | Địa chỉ kho hàng |
| Phone | VARCHAR(20) | NULL | Số điện thoại liên hệ |
| ManagerName | VARCHAR(100) | NULL | Tên quản lý kho |
| Status | INT | DEFAULT 1 | 1=Hoạt động, 0=Đóng |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật |

### Bảng: `Locations`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| WarehouseID | INT | FK → Warehouses.id | Thuộc kho nào |
| LocationCode | VARCHAR(50) | NOT NULL | Mã vị trí (WH1-L01) |
| Description | TEXT | NULL | Mô tả (Zone A, Shelf 1) |
| Capacity | INT | DEFAULT 0 | Sức chứa tối đa |
| Status | INT | DEFAULT 1 | 1=Còn trống, 0=Đầy |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật |

### Bảng: `Suppliers`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| SupplierCode | VARCHAR(50) | UNIQUE NOT NULL | Mã nhà cung cấp duy nhất |
| Name | VARCHAR(255) | NOT NULL | Tên nhà cung cấp |
| Phone | VARCHAR(20) | NULL | Số điện thoại |
| Email | VARCHAR(100) | NULL | Email liên hệ |
| Address | VARCHAR(255) | NULL | Địa chỉ |
| Status | INT | DEFAULT 1 | 1=Hợp tác, 0=Ngừng |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| IsDeleted | BOOLEAN | DEFAULT false | Xóa mềm |

### Bảng: `Customers`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| CustomerCode | VARCHAR(50) | UNIQUE NOT NULL | Mã khách hàng duy nhất |
| Name | VARCHAR(255) | NOT NULL | Tên khách hàng |
| Phone | VARCHAR(20) | NULL | Số điện thoại |
| Email | VARCHAR(100) | NULL | Email liên hệ |
| Address | VARCHAR(255) | NULL | Địa chỉ giao hàng |
| Status | INT | DEFAULT 1 | 1=Hoạt động, 0=Ngừng |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| IsDeleted | BOOLEAN | DEFAULT false | Xóa mềm |

### Bảng: `PurchaseOrders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| POCode | VARCHAR(50) | UNIQUE NOT NULL | Mã đơn mua hàng |
| SupplierID | INT | FK → Suppliers.id | Nhà cung cấp |
| OrderDate | DATE | NOT NULL | Ngày đặt hàng |
| Status | VARCHAR(20) | DEFAULT "Pending" | Pending/Completed/Cancelled |
| TotalAmount | DECIMAL(18,2) | DEFAULT 0 | Tổng giá trị đơn |
| Note | TEXT | NULL | Ghi chú đơn hàng |
| CreatedBy | INT | FK → Users.id | Người tạo đơn |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |
| UpdatedAt | DATETIME | AUTO UPDATE | Thời điểm cập nhật |

### Bảng: `PurchaseOrderDetails`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| POID | INT | FK → PurchaseOrders.id | Thuộc đơn mua nào |
| ProductID | INT | FK → Products.id | Sản phẩm mua |
| Quantity | INT | NOT NULL | Số lượng đặt mua |
| UnitPrice | DECIMAL(18,2) | NOT NULL | Đơn giá mua |
| TotalPrice | DECIMAL(18,2) | NULL | Thành tiền = Quantity × UnitPrice |

### Bảng: `GoodsReceipts`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ReceiptCode | VARCHAR(50) | UNIQUE NOT NULL | Mã phiếu nhập kho |
| POID | INT | FK → PurchaseOrders.id | Liên kết đơn mua gốc |
| ReceiptDate | DATE | NOT NULL | Ngày nhập kho thực tế |
| Status | VARCHAR(20) | NULL | Trạng thái phiếu nhập |
| Note | TEXT | NULL | Ghi chú |
| CreatedBy | INT | FK → Users.id | Người lập phiếu |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |

### Bảng: `GoodsReceiptDetails`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ReceiptID | INT | FK → GoodsReceipts.id | Thuộc phiếu nhập nào |
| ProductID | INT | FK → Products.id | Sản phẩm nhập kho |
| LocationID | INT | FK → Locations.id | Vị trí lưu trữ trong kho |
| Quantity | INT | NOT NULL | Số lượng nhập thực tế |

### Bảng: `SalesOrders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| SOCode | VARCHAR(50) | UNIQUE NOT NULL | Mã đơn bán hàng |
| CustomerID | INT | FK → Customers.id | Khách hàng mua |
| OrderDate | DATE | NOT NULL | Ngày đặt hàng |
| Status | VARCHAR(20) | DEFAULT "Pending" | Pending/Delivered/Cancelled |
| TotalAmount | DECIMAL(18,2) | DEFAULT 0 | Tổng giá trị đơn |
| Note | TEXT | NULL | Ghi chú |
| CreatedBy | INT | FK → Users.id | Người tạo đơn |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |

### Bảng: `SalesOrderDetails`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| SOID | INT | FK → SalesOrders.id | Thuộc đơn bán nào |
| ProductID | INT | FK → Products.id | Sản phẩm bán |
| Quantity | INT | NOT NULL | Số lượng bán |
| UnitPrice | DECIMAL(18,2) | NOT NULL | Đơn giá bán |
| TotalPrice | DECIMAL(18,2) | NULL | Thành tiền |

### Bảng: `DeliveryNotes`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| DeliveryCode | VARCHAR(50) | UNIQUE NOT NULL | Mã phiếu xuất kho |
| SOID | INT | FK → SalesOrders.id | Liên kết đơn bán gốc |
| DeliveryDate | DATE | NOT NULL | Ngày xuất kho thực tế |
| Status | VARCHAR(20) | NULL | Trạng thái phiếu xuất |
| Note | TEXT | NULL | Ghi chú |
| CreatedBy | INT | FK → Users.id | Người lập phiếu |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm tạo |

### Bảng: `DeliveryNoteDetails`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| DeliveryID | INT | FK → DeliveryNotes.id | Thuộc phiếu xuất nào |
| ProductID | INT | FK → Products.id | Sản phẩm xuất kho |
| LocationID | INT | FK → Locations.id | Lấy hàng từ vị trí nào |
| Quantity | INT | NOT NULL | Số lượng xuất thực tế |

### Bảng: `Inventory`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ProductID | INT | FK → Products.id | Sản phẩm |
| WarehouseID | INT | FK → Warehouses.id | Kho lưu trữ |
| LocationID | INT | FK → Locations.id | Vị trí cụ thể trong kho |
| Quantity | INT | DEFAULT 0 | Số lượng tồn kho hiện tại |
| LastUpdated | DATETIME(3) | AUTO UPDATE | Thời điểm cập nhật cuối |

> **Ràng buộc đặc biệt:** Bộ ba `(ProductID, WarehouseID, LocationID)` được đánh UNIQUE INDEX, đảm bảo mỗi sản phẩm chỉ có **đúng 1 dòng tồn kho** tại mỗi vị trí.

### Bảng: `InventoryTransactions`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ProductID | INT | FK → Products.id | Sản phẩm giao dịch |
| WarehouseID | INT | FK → Warehouses.id | Kho thực hiện |
| Quantity | INT | NOT NULL | Số lượng tăng/giảm |
| TransactionType | VARCHAR(50) | NULL | INBOUND / OUTBOUND |
| ReferenceType | VARCHAR(50) | NULL | GoodsReceipt / DeliveryNote |
| ReferenceID | INT | NULL | ID chứng từ gốc |
| TransactionDate | DATETIME | DEFAULT NOW() | Thời gian giao dịch |
| Note | TEXT | NULL | Ghi chú giao dịch |

### Bảng: `StockReservations`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả mục đích |
|---------|---------------|-----------|-----------------|
| id | INT AUTO_INCREMENT | PRIMARY KEY | Khóa chính tự tăng |
| ProductID | INT | FK → Products.id | Sản phẩm giữ hàng |
| WarehouseID | INT | FK → Warehouses.id | Kho giữ hàng |
| LocationID | INT | FK → Locations.id | Vị trí giữ hàng |
| ReservedQty | INT | NOT NULL | Số lượng đang giữ |
| ReferenceType | VARCHAR(50) | NULL | Nguồn: SalesOrder |
| ReferenceID | INT | NULL | ID đơn bán gốc |
| Status | VARCHAR(20) | NULL | Active / Delivered |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời điểm giữ hàng |

---


# CHƯƠNG 2: KHỞI TẠO CƠ SỞ DỮ LIỆU (Migration & Seed)

## 2.1. Scripts Khởi tạo Bảng (Database Migration)

Dự án sử dụng **Prisma ORM** quản lý Migration theo phong cách Declarative từ file `schema.prisma`.

### Cơ chế Up/Down Migration
- **Up:** Lệnh `npx prisma db push` hoặc `npx prisma migrate dev` tự động so sánh file `schema.prisma` với Database hiện tại và sinh lệnh UP tương ứng.
- **Down:** Prisma khuyến khích chiến lược "Forward-only". Để rollback, chỉ cần xóa cột/bảng trong `schema.prisma` và chạy lại migrate.

### Lệnh Migration thực tế
```bash
npx prisma migrate dev --name init_tables   # Tạo migration mới
npx prisma db push                          # Đồng bộ trực tiếp
npx prisma generate                         # Sinh Prisma Client
```

### Minh chứng Script Up (Raw SQL)
```sql
CREATE TABLE IF NOT EXISTS `Inventory` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `ProductID` INT NULL,
    `WarehouseID` INT NULL,
    `LocationID` INT NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `LastUpdated` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_inventory_product` FOREIGN KEY (`ProductID`) 
        REFERENCES `Products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`WarehouseID`) 
        REFERENCES `Warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_inventory_location` FOREIGN KEY (`LocationID`) 
        REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2.2. Scripts Khởi tạo Dữ liệu (Database Seeding)

**File mã nguồn:** `backend/prisma/seed.ts`

### Chiến lược Seeding

**A. Kỹ thuật Truncate:** Xóa sạch dữ liệu cũ trước khi nạp mới. Dùng `SET FOREIGN_KEY_CHECKS = 0` để tạm tắt ràng buộc khóa ngoại.

**B. Kỹ thuật Batching:** Chia 10,000 sản phẩm thành các lô 2,000 bản ghi để tránh tràn bộ nhớ.

**C. Kỹ thuật Random Link:** Dùng `faker.helpers.arrayElement(categories).id` để gán khóa ngoại ngẫu nhiên hợp lệ.

### Quy trình Seeding theo thứ tự phụ thuộc

| Bước | Thực thể | Số lượng | Phụ thuộc |
|------|----------|----------|-----------|
| 1 | Users | 2 | Không |
| 2 | ProductCategories | 50 | Không |
| 3 | Units | 10 | Không |
| 4 | Suppliers | 200 | Không |
| 5 | Customers | 500 | Không |
| 6 | Warehouses | 20 | Không |
| 7 | Locations | 200 | Warehouses (Bước 6) |
| 8 | Products | 10,000 | Categories + Units |
| 9 | Inventory | 10,000 | Products + Locations |
| **Tổng** | | **~21,000+** | |

### Cách chạy Seed
```bash
npm run db:seed
```
Tài khoản mặc định: `admin` / `admin123` và `staff01` / `staff123`

---

# CHƯƠNG 3: TỐI ƯU CƠ SỞ DỮ LIỆU (Database Optimization)

## 3.1. Danh sách Chỉ mục (Indexes) và Mục đích sử dụng

| STT | Bảng | Cột Index | Loại | Tên Index | Mục đích |
|-----|------|-----------|------|-----------|----------|
| 1 | `Users` | `Username` | UNIQUE | `User_Username_key` | Tối ưu đăng nhập, đảm bảo không trùng tên |
| 2 | `Products` | `ProductCode` | UNIQUE | `Product_ProductCode_key` | Tối ưu quét mã vạch khi Nhập/Xuất kho |
| 3 | `Suppliers` | `SupplierCode` | UNIQUE | `Supplier_SupplierCode_key` | Tăng tốc autocomplete khi tạo PO |
| 4 | `Customers` | `CustomerCode` | UNIQUE | `Customer_CustomerCode_key` | Tăng tốc autocomplete khi tạo SO |
| 5 | `Inventory` | `ProductID + WarehouseID + LocationID` | UNIQUE Composite | `Inventory_..._key` | Ngăn trùng lặp tồn kho cùng vị trí |
| 6 | `Inventory` | `ProductID + WarehouseID + LocationID` | Normal B-Tree | `idx_inventory_main` | Tối ưu truy vấn lấy hàng xuất kho |
| 7 | `InventoryTransactions` | `ProductID` | Normal | `idx_transaction_product` | Tối ưu xem thẻ kho theo sản phẩm |
| 8 | `InventoryTransactions` | `TransactionDate` | Normal | `idx_transaction_date` | Tối ưu lọc báo cáo theo thời gian |

### Chiến lược tối ưu
- **Hạn chế Index trên bảng Transaction** (tần suất GHI cao): chỉ đánh 2 Index cần thiết nhất.
- **Dùng Composite Index** thay vì 3 Index đơn: hiệu quả hơn, phục vụ đúng nghiệp vụ.

## 3.2. Kỹ thuật ACID Transaction (Row-level Locking)

```sql
BEGIN;
SELECT id, Quantity FROM `Inventory` 
WHERE `ProductID` = 1 AND `LocationID` = 1 FOR UPDATE;
UPDATE `Inventory` SET `Quantity` = `Quantity` - 10 WHERE `id` = 1;
COMMIT;
```

| Tính chất | Ý nghĩa | Áp dụng trong WMS |
|-----------|---------|---------------------|
| **A** - Atomicity | Tất cả hoặc Không | Trừ kho thất bại → hủy toàn bộ giao dịch |
| **C** - Consistency | Dữ liệu luôn đúng | Tồn kho không bao giờ bị âm |
| **I** - Isolation | Tách biệt giao dịch | 2 người cùng xuất → xử lý tuần tự |
| **D** - Durability | Ghi vĩnh viễn | Sau COMMIT, mất điện vẫn còn dữ liệu |

## 3.3. Minh chứng EXPLAIN

### Truy vấn Thẻ kho (Index đơn)
```sql
EXPLAIN SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 ORDER BY `TransactionDate` DESC;
```
Kỳ vọng: `type = ref`, `key = idx_transaction_product`, `rows = số nhỏ`

### Truy vấn Tồn kho (Composite Index)
```sql
EXPLAIN SELECT * FROM `Inventory` 
WHERE `ProductID` = 1 AND `WarehouseID` = 1 AND `LocationID` = 1;
```
Kỳ vọng: `type = const`, `rows = 1` → Tìm trong **1 bước duy nhất**

---

# CHƯƠNG 4: SAO LƯU & PHỤC HỒI (Backup & Restore)

## 4.1. Chiến lược Sao lưu

| Phương pháp | Tần suất | Mô tả |
|-------------|----------|-------|
| **Full Backup** | Hàng ngày 2:00 AM | `mysqldump` toàn bộ database |
| **Incremental** | Mỗi giờ | Binary Log ghi thay đổi |
| **Offsite Storage** | Hàng ngày | Upload lên Cloud (S3) |
| **Retention** | Giữ 30 ngày | Tự động xóa backup cũ |

## 4.2. Lệnh Sao lưu (Backup)
```bash
mysqldump -u root -proot wms_db --routines --triggers --events > backup_wms_db_$(date +%Y%m%d).sql
```

## 4.3. Lệnh Phục hồi (Restore)
```bash
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS wms_db;"
mysql -u root -proot wms_db < backup_wms_db_20260512.sql
```

## 4.4. Hướng dẫn phục hồi khi xóa nhầm dữ liệu
```bash
# Bước 1: Dừng ứng dụng backend
pm2 stop wms-backend

# Bước 2: Xóa database hỏng và tạo lại rỗng
mysql -u root -proot -e "DROP DATABASE wms_db;"
mysql -u root -proot -e "CREATE DATABASE wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Bước 3: Import file backup gần nhất
mysql -u root -proot wms_db < backup_wms_db_20260512.sql

# Bước 4: Kiểm tra và khởi động lại
mysql -u root -proot wms_db -e "SELECT COUNT(*) FROM Products;"
npm run start:dev
```

## 4.5. Database View (Khung nhìn ảo)

| View | Mục đích | Các bảng JOIN |
|------|----------|---------------|
| `InventoryReportView` | Báo cáo tồn kho chi tiết | Inventory + Products + Warehouses + Locations |
| `PurchaseOrderSummaryView` | Tổng hợp đơn mua hàng | PurchaseOrders + Suppliers + PurchaseOrderDetails |
| `SalesOrderSummaryView` | Tổng hợp đơn bán hàng | SalesOrders + Customers + SalesOrderDetails |
| `TransactionHistoryView` | Nhật ký giao dịch kho | InventoryTransactions + Products + Warehouses |

## 4.6. Kỹ thuật CTE (Common Table Expression)
```sql
WITH InventorySummary AS (
    SELECT ProductID, SUM(Quantity) as TotalQuantity
    FROM `Inventory` GROUP BY ProductID
)
SELECT p.ProductCode, p.ProductName, s.TotalQuantity
FROM InventorySummary s
JOIN `Products` p ON s.ProductID = p.id
ORDER BY s.TotalQuantity DESC;
```

---

# CHƯƠNG 5: KỸ THUẬT NÂNG CAO (Không bắt buộc)

## 5.1. Replication (Nhân bản dữ liệu)

**Mô hình Master - Slave:**
- **Master (Port 3306):** Nhận lệnh Ghi (INSERT/UPDATE/DELETE)
- **Slave (Port 3307):** Nhận lệnh Đọc (SELECT)
- MySQL tự động đồng bộ qua Binary Log

**Tích hợp Prisma:**
```typescript
const prisma = new PrismaClient().$extends(
  readReplicas({ url: process.env.DATABASE_URL_REPLICA_1 })
)
prisma.inventory.findMany()  // → Tự động sang Slave
prisma.inventory.create()    // → Tự động về Master
```

## 5.2. Sharding (Phân mảnh dữ liệu)

**Shard Key:** `WarehouseID`
- Kho ID 1-10 (Miền Bắc) → Server Miền Bắc
- Kho ID 11-20 (Miền Nam) → Server Miền Nam

**Minh chứng phân bổ:**
```sql
SELECT w.WarehouseName, COUNT(i.id) AS SKU_Count,
  ROUND(COUNT(i.id) * 100.0 / (SELECT COUNT(*) FROM Inventory), 2) AS Data_Percent
FROM `Inventory` i JOIN `Warehouses` w ON i.WarehouseID = w.id
GROUP BY w.id, w.WarehouseName;
```

## 5.3. Partitioning (Phân vùng dữ liệu vật lý)

Bảng `InventoryTransactions` chia theo **Quý**:

| Partition | Phạm vi | Ghi chú |
|-----------|---------|---------|
| `p_history` | Trước 2026-01-01 | Dữ liệu lịch sử |
| `p_2026_q1` | T1-T3/2026 | Quý 1/2026 |
| `p_2026_q2` | T4-T6/2026 | Quý 2/2026 |
| `p_2026_q3` | T7-T9/2026 | Quý 3/2026 |
| `p_2026_q4` | T10-T12/2026 | Quý 4/2026 |
| `p_future` | MAXVALUE | Dữ liệu tương lai |

**Minh chứng Partition Pruning:**
```sql
EXPLAIN SELECT * FROM `InventoryTransactions`
WHERE `TransactionDate` >= '2026-04-01' AND `TransactionDate` < '2026-07-01';
-- → partitions = p_2026_q2 (CHỈ đọc 1 phân vùng)
```

---

# CHƯƠNG 6: TỔNG HỢP CÂU LỆNH MINH CHỨNG

Toàn bộ câu lệnh minh chứng nằm trong file `sql/evidence_collection.sql`, gồm 10 phần:

| Phần | Nội dung | Kỹ thuật chứng minh |
|------|----------|---------------------|
| 1 | Quy mô dữ liệu | SELECT COUNT(*) |
| 2 | Danh sách Index | information_schema.STATISTICS |
| 3 | Ràng buộc FK | information_schema.KEY_COLUMN_USAGE |
| 4 | Tối ưu truy vấn | EXPLAIN (3 loại) |
| 5 | Database View | SELECT FROM View (4 views) |
| 6 | CTE | WITH ... AS |
| 7 | Deep Joins | JOIN 6 bảng |
| 8 | Analytics | GROUP BY + Thống kê |
| 9 | Partitioning | INFORMATION_SCHEMA.PARTITIONS |
| 10 | Replication | SHOW VARIABLES |

> **Hướng dẫn:** Mở MySQL Workbench → Chọn database `wms_db` → Copy từng đoạn SQL → Bôi đen và bấm nút tia sét (Execute) → Chụp ảnh kết quả để dán vào báo cáo.
