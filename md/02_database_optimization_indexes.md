# Tài liệu Tối ưu Cơ sở Dữ liệu (Database Optimization)

Tài liệu này liệt kê chi tiết các thiết kế tối ưu hóa được áp dụng trong Cơ sở dữ liệu của hệ thống WMS, tập trung vào chiến lược đánh Chỉ mục (Database Indexing) và các kỹ thuật đảm bảo tính toàn vẹn dữ liệu (ACID Transaction).

---

## 1. Tầm quan trọng của Index trong WMS

Trong hệ thống Quản lý Kho, thao tác phổ biến nhất là tìm kiếm thông tin Hàng hóa (bằng mã vạch) và truy xuất Tồn kho. Việc cấu hình các Chỉ mục (B-Tree Index) hợp lý giúp tốc độ truy vấn tăng từ **O(n)** (Quét toàn bảng - Full Table Scan) xuống **O(log n)** (Tìm theo cấu trúc cây phân cấp - Index Seek).

### So sánh trực quan

| Tiêu chí | Không có Index (Full Table Scan) | Có Index (B-Tree Seek) |
|----------|----------------------------------|------------------------|
| Cách hoạt động | Duyệt từng dòng từ đầu đến cuối | Tra cứu theo cấu trúc cây nhị phân |
| Tốc độ với 10,000 dòng | Duyệt tối đa 10,000 dòng | Duyệt tối đa ~14 bước (log₂10000) |
| EXPLAIN `type` | `ALL` (tệ nhất) | `ref` hoặc `const` (tốt nhất) |
| Phù hợp khi | Bảng nhỏ, ít truy vấn | Bảng lớn, truy vấn thường xuyên |

---

## 2. Danh sách Chỉ mục (Indexes) và Mục đích sử dụng

Dưới đây là các Indexes đã được cấu hình trong dự án (xem chi tiết tại `schema.prisma` và `sql/01_create_tables_and_indexes.sql`):

| STT | Bảng (Table) | Cột được Index | Loại Index | Tên Index | Mục đích sử dụng |
|-----|--------------|----------------|------------|-----------|-------------------|
| 1 | `Users` | `Username` | UNIQUE | `User_Username_key` | **Tối ưu đăng nhập:** Hàm tìm tài khoản lúc đăng nhập diễn ra cực kỳ nhiều. Index giúp tìm User chỉ trong 0.001s. UNIQUE đảm bảo không thể tạo 2 tài khoản trùng tên. |
| 2 | `Products` | `ProductCode` | UNIQUE | `Product_ProductCode_key` | **Tối ưu tít mã vạch:** Thủ kho thao tác 100% qua mã `ProductCode`. Cột này được truy vấn liên tục trong mọi nghiệp vụ Nhập/Xuất kho. |
| 3 | `Suppliers` | `SupplierCode` | UNIQUE | `Supplier_SupplierCode_key` | **Tìm kiếm nhà cung cấp:** Tăng tốc chức năng autocomplete (nhập nhanh) khi tạo Đơn mua hàng (PO). |
| 4 | `Customers` | `CustomerCode` | UNIQUE | `Customer_CustomerCode_key` | **Tìm kiếm khách hàng:** Tăng tốc autocomplete khi tạo Đơn bán hàng (SO). |
| 5 | `Inventory` | `ProductID` + `WarehouseID` + `LocationID` | UNIQUE (Composite) | `Inventory_ProductID_WarehouseID_LocationID_key` | **Ràng buộc Tồn kho Đơn nhất:** Ngăn chặn tuyệt đối việc sinh ra 2 dòng dữ liệu cho cùng 1 mặt hàng tại cùng 1 vị trí. Nếu thiếu cái này, hệ thống sẽ bị lỗi cộng dồn sai tồn kho. |
| 6 | `Inventory` | `ProductID` + `WarehouseID` + `LocationID` | Normal (B-Tree) | `idx_inventory_main` | **Tối ưu Báo cáo & Lấy hàng:** Phục vụ trực tiếp cho câu lệnh lấy hàng khi xuất kho: "Cần tìm sản phẩm A ở kho B vị trí C". |
| 7 | `InventoryTransactions` | `ProductID` | Normal | `idx_transaction_product` | **Tối ưu Thẻ kho:** Khi người dùng muốn xem thẻ kho (Lịch sử Nhập/Xuất) của 1 sản phẩm. Lọc hàng triệu giao dịch xuống chỉ vài chục giao dịch liên quan ngay lập tức. |
| 8 | `InventoryTransactions` | `TransactionDate` | Normal | `idx_transaction_date` | **Tối ưu Lọc theo Thời gian:** Các báo cáo WMS luôn đi kèm bộ lọc "Từ ngày... Đến ngày...". Index trên cột thời gian giúp việc gom báo cáo cuối tháng cực kì mượt mà. |

### Khai báo Index trong Prisma Schema

```prisma
// File: backend/prisma/schema.prisma

model Product {
  // ...
  @@index([productCode], map: "idx_product_code")  // Index đơn
  @@map("Products")
}

model Inventory {
  // ...
  @@unique([productId, warehouseId, locationId])                        // UNIQUE Composite
  @@index([productId, warehouseId, locationId], map: "idx_inventory_main") // Normal Composite
  @@map("Inventory")
}

model InventoryTransaction {
  // ...
  @@index([productId], map: "idx_transaction_product")      // Index theo sản phẩm
  @@index([transactionDate], map: "idx_transaction_date")    // Index theo thời gian
  @@map("InventoryTransactions")
}
```

---

## 3. Chiến lược tối ưu Index

### 3.1. Nguyên tắc "Đánh Index có chọn lọc"
- **Hạn chế Index trên bảng Transaction:** Bảng `InventoryTransactions` là bảng có tần suất GHI (INSERT) lớn nhất hệ thống. Do đó, chỉ thiết lập đúng 2 Indexes (`ProductID` và `TransactionDate`) - là 2 thông số bị lọc nhiều nhất.
- **Tuyệt đối không đánh Index** vào cột `Quantity` hay `TransactionType` vì:
  - Mỗi lần INSERT, MySQL phải cập nhật lại toàn bộ cây B-Tree của Index.
  - Càng nhiều Index → Tốc độ GHI càng chậm.
  - Cột `Quantity` và `TransactionType` hiếm khi dùng trong mệnh đề WHERE.

### 3.2. Tại sao đánh Composite Index thay vì 3 Index đơn?
Bảng `Inventory` sử dụng Composite Index `(ProductID, WarehouseID, LocationID)` thay vì 3 index riêng lẻ vì:
- **Hiệu quả hơn:** MySQL chỉ cần tra 1 cây B-Tree duy nhất thay vì 3 cây riêng biệt.
- **Phục vụ đúng nghiệp vụ:** Câu hỏi phổ biến nhất là "Sản phẩm A ở Kho B vị trí C còn bao nhiêu?" - luôn cần cả 3 cột cùng lúc.
- **Leftmost Prefix Rule:** Index `(A, B, C)` cũng tự động tối ưu cho truy vấn chỉ dùng `(A)` hoặc `(A, B)`.

---

## 4. Kỹ thuật ACID Transaction (Row-level Locking)

Ngoài Index, hệ thống WMS còn áp dụng kỹ thuật **Khóa dòng (Row-level Lock)** để đảm bảo tính toàn vẹn khi nhiều người cùng thao tác trên một mặt hàng.

### Bản chất SQL của Prisma `$transaction`

```sql
-- Bắt đầu giao dịch (Atomicity - Tính nguyên tử)
BEGIN;

-- Chọn dòng cần cập nhật và KHÓA NÓ LẠI
-- (Isolation - Không ai khác có thể sửa dòng này cho đến khi COMMIT)
SELECT id, Quantity 
FROM `Inventory` 
WHERE `ProductID` = 1 AND `LocationID` = 1 
FOR UPDATE; 

-- Trừ tồn kho (Consistency - Tính nhất quán)
UPDATE `Inventory` 
SET `Quantity` = `Quantity` - 10 
WHERE `id` = 1;

-- Ghi vĩnh viễn vào ổ cứng (Durability - Tính bền vững)
COMMIT;
```

### Giải thích 4 tính chất ACID

| Tính chất | Ý nghĩa | Áp dụng trong WMS |
|-----------|---------|---------------------|
| **A** - Atomicity | Tất cả hoặc Không gì cả | Nếu trừ kho thất bại → toàn bộ giao dịch bị hủy, không mất dữ liệu |
| **C** - Consistency | Dữ liệu luôn đúng | Tồn kho không bao giờ bị âm (kiểm tra trước khi trừ) |
| **I** - Isolation | Tách biệt giao dịch | 2 nhân viên cùng xuất 1 mặt hàng → xử lý tuần tự, không bị xung đột |
| **D** - Durability | Ghi vĩnh viễn | Sau COMMIT, dù mất điện dữ liệu vẫn còn |

---

## 5. Câu lệnh Minh chứng (Evidence Queries)

### 5.1. Kiểm tra danh sách Index đã tồn tại trong Database
```sql
SELECT 
    TABLE_NAME AS 'Bảng', 
    INDEX_NAME AS 'Tên Index', 
    COLUMN_NAME AS 'Cột được đánh Index', 
    NON_UNIQUE AS 'Duy nhất (0=Yes)', 
    INDEX_TYPE AS 'Loại cấu trúc'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'wms_db'
AND TABLE_NAME IN ('Inventory', 'InventoryTransactions', 'Products', 'Users')
ORDER BY TABLE_NAME, INDEX_NAME;
```

### 5.2. Minh chứng EXPLAIN - Truy vấn Thẻ kho
```sql
EXPLAIN 
SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 
ORDER BY `TransactionDate` DESC;
```

**Đọc hiểu kết quả EXPLAIN:**

| Cột | Ý nghĩa |
|-----|---------|
| **type** = `ref` | MySQL dùng Index để truy cập (tốt). Nếu là `ALL` = quét toàn bảng (tệ). |
| **key** = `idx_transaction_product` | Bằng chứng MySQL đã CHỌN SỬ DỤNG Index ta thiết kế. |
| **rows** = số nhỏ | Số dòng MySQL phải quét. Càng nhỏ càng chứng tỏ hiệu năng cao. |

### 5.3. Minh chứng EXPLAIN - Composite Index
```sql
EXPLAIN 
SELECT * FROM `Inventory` 
WHERE `ProductID` = 1 AND `WarehouseID` = 1 AND `LocationID` = 1;
```

**Kết quả mong đợi:** `type = const`, `key = Inventory_ProductID_WarehouseID_LocationID_key`, `rows = 1`
→ Chứng minh MySQL tìm được kết quả chỉ trong **1 bước duy nhất** nhờ Composite Index.

---

## 6. Kiểm tra các Ràng buộc Khóa ngoại (Foreign Key Constraints)

```sql
-- Liệt kê tất cả Foreign Keys trong database WMS
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
```

> **Nhận xét:** Kết quả truy vấn trên sẽ hiển thị toàn bộ mạng lưới liên kết giữa các bảng, chứng minh cơ sở dữ liệu được thiết kế theo chuẩn quan hệ (Relational Database) với tính toàn vẹn tham chiếu đầy đủ.
