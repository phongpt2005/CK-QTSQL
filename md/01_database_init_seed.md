# Tài liệu Khởi tạo Cơ sở Dữ liệu (Database Initialization)

Tài liệu này trình bày chi tiết các phương thức và kịch bản (scripts) được sử dụng để khởi tạo cấu trúc các bảng (Migration) và nạp dữ liệu mẫu ban đầu (Seeding) cho hệ thống Quản lý Kho hàng (WMS).

---

## 1. Phân tích Thực thể (Entity Analysis)

Hệ thống WMS được thiết kế dựa trên **15 thực thể chính**, chia thành 5 nhóm chức năng:

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
| Location | `Locations` | Vị trí chi tiết trong kho (Khu A, Kệ 1, Ngăn 1) |

### Nhóm 4: Đối tác kinh doanh
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| Supplier | `Suppliers` | Nhà cung cấp hàng hóa |
| Customer | `Customers` | Khách hàng mua hàng |

### Nhóm 5: Nghiệp vụ Nhập/Xuất kho & Tồn kho
| Thực thể | Tên bảng MySQL | Mục đích |
|-----------|----------------|----------|
| PurchaseOrder / PurchaseOrderDetail | `PurchaseOrders` / `PurchaseOrderDetails` | Đơn mua hàng (Nhập kho) |
| GoodsReceipt / GoodsReceiptDetail | `GoodsReceipts` / `GoodsReceiptDetails` | Phiếu nhập kho thực tế |
| SalesOrder / SalesOrderDetail | `SalesOrders` / `SalesOrderDetails` | Đơn bán hàng (Xuất kho) |
| DeliveryNote / DeliveryNoteDetail | `DeliveryNotes` / `DeliveryNoteDetails` | Phiếu xuất kho thực tế |
| Inventory | `Inventory` | Số lượng tồn kho tại từng vị trí |
| InventoryTransaction | `InventoryTransactions` | Nhật ký mọi biến động Nhập/Xuất |
| StockReservation | `StockReservations` | Giữ hàng tạm khi tạo đơn bán |

---

## 2. Từ điển Dữ liệu (Data Dictionary)

### 2.1. Bảng `Users`
| Cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|-----|---------------|-----------|----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính |
| Username | VARCHAR(100) | UNIQUE, NOT NULL | Tên đăng nhập (không trùng lặp) |
| PasswordHash | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa bcrypt |
| Role | VARCHAR(50) | NULL | Phân quyền: Admin hoặc Staff |
| Status | INT | DEFAULT 1 | 1 = Hoạt động, 0 = Bị khóa |
| CreatedAt | DATETIME | DEFAULT NOW() | Thời gian tạo tài khoản |

### 2.2. Bảng `Products`
| Cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|-----|---------------|-----------|----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính |
| ProductCode | VARCHAR(50) | UNIQUE, NOT NULL | Mã vạch/QR Code sản phẩm |
| ProductName | VARCHAR(255) | NOT NULL | Tên hiển thị sản phẩm |
| CategoryID | INT | FOREIGN KEY → `ProductCategories.id` | Liên kết danh mục |
| UnitID | INT | FOREIGN KEY → `Units.id` | Liên kết đơn vị tính |
| Price | DECIMAL(18,2) | DEFAULT 0 | Đơn giá |
| Description | TEXT | NULL | Mô tả chi tiết |
| Status | INT | DEFAULT 1 | 1 = Đang kinh doanh, 0 = Ngừng |
| IsDeleted | BOOLEAN | DEFAULT false | Xóa mềm (Soft Delete) |

### 2.3. Bảng `Inventory` (Bảng lõi - quan trọng nhất)
| Cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|-----|---------------|-----------|----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính |
| ProductID | INT | FK → `Products.id`, UNIQUE(combo) | Sản phẩm nào |
| WarehouseID | INT | FK → `Warehouses.id`, UNIQUE(combo) | Ở kho nào |
| LocationID | INT | FK → `Locations.id`, UNIQUE(combo) | Tại vị trí nào |
| Quantity | INT | DEFAULT 0, NOT NULL | Số lượng tồn thực tế |
| LastUpdated | DATETIME | AUTO UPDATE | Lần cập nhật cuối |

> **Ràng buộc đặc biệt:** Bộ ba `(ProductID, WarehouseID, LocationID)` được đánh UNIQUE INDEX để đảm bảo mỗi sản phẩm chỉ có **đúng 1 dòng tồn kho** tại mỗi vị trí.

### 2.4. Bảng `InventoryTransactions` (Nhật ký giao dịch)
| Cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|-----|---------------|-----------|----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Khóa chính |
| ProductID | INT | FK → `Products.id` | Sản phẩm giao dịch |
| WarehouseID | INT | FK → `Warehouses.id` | Kho thực hiện |
| Quantity | INT | NOT NULL | Số lượng tăng/giảm |
| TransactionType | VARCHAR(50) | NULL | Loại: INBOUND / OUTBOUND |
| ReferenceType | VARCHAR(50) | NULL | Nguồn: GoodsReceipt / DeliveryNote |
| ReferenceID | INT | NULL | ID chứng từ gốc |
| TransactionDate | DATETIME | DEFAULT NOW() | Thời gian giao dịch |

---

## 3. Quan hệ giữa các Thực thể (Relationships)

```
Users ──1:N──> PurchaseOrders ──1:N──> PurchaseOrderDetails ──N:1──> Products
Users ──1:N──> SalesOrders ──1:N──> SalesOrderDetails ──N:1──> Products
Users ──1:N──> GoodsReceipts ──1:N──> GoodsReceiptDetails ──N:1──> Products
Users ──1:N──> DeliveryNotes ──1:N──> DeliveryNoteDetails ──N:1──> Products

Products ──N:1──> ProductCategories
Products ──N:1──> Units
Products ──1:N──> Inventory ──N:1──> Warehouses
                  Inventory ──N:1──> Locations ──N:1──> Warehouses

Suppliers ──1:N──> PurchaseOrders
Customers ──1:N──> SalesOrders
```

**Giải thích ký hiệu:**
- `1:N` = Quan hệ Một - Nhiều (Ví dụ: 1 User tạo được nhiều PurchaseOrders)
- `N:1` = Quan hệ Nhiều - Một (Ví dụ: Nhiều Products thuộc 1 ProductCategory)

---

## 4. Scripts Khởi tạo Bảng (Database Migration)

Dự án WMS sử dụng **Prisma ORM** làm công cụ thiết kế và quản lý cấu trúc cơ sở dữ liệu. So với các công cụ cũ, Prisma quản lý Migration theo một phong cách Declarative (Khai báo) từ file `schema.prisma`.

### 4.1. Cơ chế Up/Down Migration
Trong lý thuyết CSDL truyền thống:
- **Up Migration:** Chứa mã SQL `CREATE TABLE` hoặc `ALTER TABLE` để thêm bảng, thêm cột.
- **Down Migration:** Chứa mã SQL `DROP TABLE` để rollback (quay xe) lại trạng thái trước đó.

**Áp dụng trong hệ thống WMS (Prisma):**
- **Up:** Lệnh `npx prisma db push` hoặc `npx prisma migrate dev` sẽ tự động so sánh file `schema.prisma` với Database hiện tại và sinh ra lệnh **UP** tương ứng.
- **Down:** Khác với Laravel hay TypeORM, Prisma khuyến khích chiến lược "Tiến tới" (Forward-only). Để thực hiện **DOWN**, thay vì chạy file rollback, lập trình viên chỉ cần xóa cột/bảng trong `schema.prisma` và chạy lại lệnh migrate, Prisma sẽ tự động xử lý phần việc `DROP` dữ liệu.

### 4.2. Lệnh Migration thực tế
```bash
# Tạo migration mới và áp dụng vào database
npx prisma migrate dev --name init_tables

# Hoặc đồng bộ trực tiếp (dùng trong môi trường phát triển)
npx prisma db push

# Sinh Prisma Client để sử dụng trong code
npx prisma generate
```

### 4.3. Minh chứng Script Up (Raw SQL)
Tham khảo file: `sql/01_create_tables_and_indexes.sql`.

Ví dụ bản chất lệnh tạo bảng Inventory mà Prisma sinh ra:
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

## 5. Scripts Khởi tạo Dữ liệu Ban đầu (Database Seeding)

Sau khi tạo bảng, một hệ thống WMS cần các dữ liệu Master (Danh mục, Kho bãi, Tài khoản Admin) để có thể chạy được ngay. Quá trình này gọi là Seeding.

**File mã nguồn thực thi:** `backend/prisma/seed.ts`

### 5.1. Chiến lược Seeding

#### A. Kỹ thuật Truncate (Làm sạch trước khi nạp)
```typescript
async function truncateTables() {
  // Tắt kiểm tra khóa ngoại để xóa không bị chặn
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
  
  // Xóa sạch từng bảng (TRUNCATE = xóa data + reset ID về 1)
  for (const tableName of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
  }
  
  // Bật lại kiểm tra khóa ngoại
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
}
```

**Giải thích cú pháp:**
- `$executeRawUnsafe()`: Hàm Prisma cho phép chạy lệnh SQL thuần (raw SQL).
- `SET FOREIGN_KEY_CHECKS = 0`: Tạm tắt ràng buộc khóa ngoại (MySQL), cho phép xóa bảng cha trước bảng con.
- `TRUNCATE TABLE`: Khác với `DELETE`, lệnh này xóa toàn bộ dữ liệu VÀ reset AUTO_INCREMENT về 1.

#### B. Kỹ thuật Batching (Chia lô xử lý)
```typescript
const BATCH_SIZE = 2000;
for (let i = 0; i < 10000; i += BATCH_SIZE) {
  const productsData = Array.from({ length: BATCH_SIZE }).map((_, idx) => ({
    productCode: `PRD-${String(i + idx + 1).padStart(6, '0')}`,
    productName: faker.commerce.productName(),
    categoryId: faker.helpers.arrayElement(categories).id,
    // ...
  }));
  await prisma.product.createMany({ data: productsData });
}
```

**Tại sao cần Batching?** Nếu đẩy 10,000 bản ghi cùng lúc vào một câu lệnh SQL, cơ sở dữ liệu có thể bị tràn bộ nhớ. Chia nhỏ mỗi lần 2,000 cái giúp hệ thống ổn định.

#### C. Kỹ thuật Random Link (Liên kết ngẫu nhiên)
```typescript
categoryId: faker.helpers.arrayElement(categories).id
```
Lấy danh sách `categories` đã tạo trước đó, chọn ngẫu nhiên 1 cái để gán vào sản phẩm → Đảm bảo khóa ngoại hợp lệ.

### 5.2. Quy trình Seeding theo thứ tự phụ thuộc (Dependency Order)

Quy trình được thiết kế để không vi phạm Khóa ngoại (Foreign Key Constraint):

| Bước | Thực thể | Số lượng | Phụ thuộc vào | Cú pháp Prisma |
|------|----------|----------|---------------|-----------------|
| 1 | Users | 2 | Không | `createMany` |
| 2 | ProductCategories | 50 | Không | `createMany` |
| 3 | Units | 10 | Không | `createMany` |
| 4 | Suppliers | 200 | Không | `createMany` |
| 5 | Customers | 500 | Không | `createMany` |
| 6 | Warehouses | 20 | Không | `createMany` |
| 7 | Locations | 200 | Warehouses (Bước 6) | `createMany` |
| 8 | Products | 10,000 | Categories (Bước 2), Units (Bước 3) | `createMany` (Batching) |
| 9 | Inventory | 10,000 | Products (Bước 8), Locations (Bước 7) | `createMany` (Batching) |

> **Lưu ý:** Dữ liệu giả được tạo bằng thư viện `@faker-js/faker`. Thư viện này sinh ra tên người, địa chỉ, số điện thoại, tên sản phẩm... trông như thật, giúp giao diện chuyên nghiệp khi demo.

### 5.3. Cách chạy lệnh Seed
```bash
# Lệnh chạy Seed thông qua file package.json đã được cấu hình
npm run db:seed
```
Sau khi chạy, hệ thống in ra thông báo `🌱 Starting seed...` và kết thúc bằng tài khoản đăng nhập mặc định:
- Admin: `admin` / `admin123`
- Nhân viên: `staff01` / `staff123`

### 5.4. Tổng kết quy mô dữ liệu sau Seed

| Bảng | Số bản ghi | Ghi chú |
|------|------------|---------|
| Users | 2 | 1 Admin + 1 Staff |
| ProductCategories | 50 | Faker tạo ngẫu nhiên |
| Units | 10 | Piece, Box, Kg, Meter... |
| Suppliers | 200 | Nhà cung cấp giả lập |
| Customers | 500 | Khách hàng giả lập |
| Warehouses | 20 | Kho hàng giả lập |
| Locations | 200 | 10 vị trí / kho |
| Products | 10,000 | Sản phẩm giả lập (Batching) |
| Inventory | 10,000 | Tồn kho ngẫu nhiên 10-1000 |
| **Tổng cộng** | **~21,000+** | |
