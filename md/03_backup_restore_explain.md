# Tài liệu Sao lưu, Phục hồi và Minh chứng Tối ưu

Tài liệu này vạch ra chiến lược bảo vệ dữ liệu (Data Protection Strategy) cho hệ thống WMS thông qua các công cụ sao lưu chuẩn của MySQL, đồng thời cung cấp minh chứng phân tích truy vấn (`EXPLAIN`) và các kỹ thuật nâng cao như Database View và CTE.

---

## 1. Chiến lược Sao lưu & Phục hồi CSDL (Backup & Restore Strategy)

Dữ liệu của WMS đặc biệt quan trọng (liên quan đến tài sản vật lý). Do đó, dự án đề xuất chiến lược Backup theo cơ chế **Daily Full Backup** (Sao lưu toàn phần hàng ngày) bằng tiện ích `mysqldump`.

### 1.1. Lệnh Sao lưu (Backup)

Để kết xuất toàn bộ cấu trúc bảng và dữ liệu thành một file SQL, ta cấu hình hệ thống Cronjob (hoặc Task Scheduler) chạy đoạn script sau vào 2:00 sáng mỗi ngày:

```bash
# Cấu trúc lệnh: mysqldump -u [username] -p[password] [database_name] > [file_path]

mysqldump -u root -proot wms_db > backup_wms_db_$(date +%Y%m%d).sql
```

**Giải thích từng tham số:**

| Tham số | Ý nghĩa |
|---------|---------|
| `-u root` | Đăng nhập bằng tài khoản `root` |
| `-proot` | Mật khẩu (không có khoảng trắng sau `-p`) |
| `wms_db` | Tên cơ sở dữ liệu cần backup |
| `> backup_wms_db_...sql` | Ghi kết quả ra file SQL |
| `$(date +%Y%m%d)` | Thêm ngày hiện tại vào tên file (Ví dụ: `backup_wms_db_20260512.sql`) |

**Kết quả:** File SQL sinh ra sẽ chứa toàn bộ:
- Lệnh `CREATE TABLE` (Cấu trúc bảng)
- Lệnh `INSERT INTO` (Dữ liệu)
- Lệnh `CREATE INDEX` (Chỉ mục)
- Lệnh `CREATE VIEW` (Khung nhìn)

### 1.2. Lệnh Phục hồi (Restore)

Trong trường hợp server gặp sự cố (bị xóa nhầm data hoặc hỏng phần cứng), Quản trị viên (DBA) có thể phục hồi lại CSDL bằng lệnh sau:

```bash
# Bước 1: Đảm bảo database đã được tạo rỗng
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS wms_db;"

# Bước 2: Import lại file SQL đã backup
mysql -u root -proot wms_db < backup_wms_db_20260512.sql
```

### 1.3. Chiến lược Backup nâng cao (Đề xuất cho Production)

| Phương pháp | Tần suất | Mô tả | Dung lượng |
|-------------|----------|-------|------------|
| **Full Backup** | Hàng ngày (2:00 AM) | `mysqldump` toàn bộ database | Lớn |
| **Incremental Backup** | Mỗi giờ | Sử dụng Binary Log (binlog) để ghi lại các thay đổi từ lần backup cuối | Nhỏ |
| **Offsite Storage** | Hàng ngày | Upload file backup lên Cloud (Amazon S3 / Google Cloud Storage) | - |
| **Retention Policy** | Giữ 30 ngày | Tự động xóa các bản backup cũ hơn 30 ngày | - |

### 1.4. Hướng dẫn cấu hình Task Scheduler (Windows)

```powershell
# Tạo Scheduled Task chạy backup mỗi ngày lúc 2:00 AM
schtasks /create /sc daily /tn "WMS_DB_Backup" /tr "mysqldump -u root -proot wms_db > C:\backup\wms_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql" /st 02:00
```

### 1.5. Hướng dẫn Sao lưu & Phục hồi chi tiết (Step-by-Step)

#### Kịch bản 1: Sao lưu thủ công trước khi nâng cấp hệ thống

Trước khi chạy `prisma migrate dev` hoặc cập nhật schema, DBA phải backup:

```bash
# Bước 1: Mở Terminal / Command Prompt

# Bước 2: Chạy lệnh backup (thay thông tin đăng nhập MySQL của bạn)
mysqldump -u root -proot wms_db --routines --triggers --events > backup_before_migrate.sql

# Bước 3: Kiểm tra file backup đã được tạo
ls -la backup_before_migrate.sql
# Kết quả: hiển thị dung lượng file (ví dụ: 15MB = bình thường)

# Bước 4: Tiến hành nâng cấp
npx prisma migrate dev --name add_new_feature
```

**Giải thích các tham số mở rộng:**

| Tham số | Ý nghĩa |
|---------|---------|
| `--routines` | Sao lưu cả Stored Procedures và Functions |
| `--triggers` | Sao lưu cả Triggers (bẫy sự kiện) |
| `--events` | Sao lưu cả Scheduled Events |
| `--single-transaction` | Đảm bảo backup nhất quán (không khóa bảng) |

#### Kịch bản 2: Phục hồi khi bị xóa nhầm dữ liệu

```bash
# Tình huống: Nhân viên vô tình xóa toàn bộ bảng Products

# Bước 1: NGAY LẬP TỨC dừng ứng dụng backend
# (Để tránh ghi thêm dữ liệu sai vào database)
pm2 stop wms-backend  # Hoặc Ctrl+C nếu đang chạy dev

# Bước 2: Xóa database bị hỏng và tạo lại rỗng
mysql -u root -proot -e "DROP DATABASE wms_db;"
mysql -u root -proot -e "CREATE DATABASE wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Bước 3: Import file backup gần nhất
mysql -u root -proot wms_db < backup_wms_db_20260512.sql

# Bước 4: Kiểm tra dữ liệu đã phục hồi
mysql -u root -proot wms_db -e "SELECT COUNT(*) FROM Products;"
# Kết quả mong đợi: 10000 (hoặc số lượng sản phẩm trước khi bị xóa)

# Bước 5: Khởi động lại ứng dụng
npm run start:dev
```

#### Kịch bản 3: Sao lưu chỉ cấu trúc (không có dữ liệu)

Dùng khi cần chia sẻ schema cho đồng nghiệp mà không kèm dữ liệu nhạy cảm:

```bash
mysqldump -u root -proot wms_db --no-data > schema_only.sql
```

### 1.6. Bảng tổng kết các phương pháp Backup

| Phương pháp | Công cụ | Ưu điểm | Nhược điểm | Khi nào dùng |
|-------------|---------|---------|------------|--------------|
| **Logical Backup** | `mysqldump` | Dễ sử dụng, file SQL đọc được | Chậm với database lớn (>10GB) | Database nhỏ-vừa, backup hàng ngày |
| **Physical Backup** | `mysqlbackup` / `xtrabackup` | Nhanh, backup trực tiếp file | Cần cài thêm công cụ | Database lớn (>10GB) |
| **Binary Log** | `mysqlbinlog` | Backup từng thay đổi (incremental) | Phức tạp hơn | Phục hồi đến thời điểm cụ thể |
| **Snapshot** | Docker Volume / Cloud Snapshot | Cực nhanh | Phụ thuộc hạ tầng | Môi trường Cloud/Docker |

---

## 2. Minh chứng Tối ưu bằng EXPLAIN Query

Để minh chứng cho Giảng viên thấy tác dụng của việc đánh Index, ta sử dụng công cụ `EXPLAIN` mặc định của MySQL. Tiện ích này sẽ "chụp X-quang" cách MySQL thực thi một câu lệnh truy vấn.

### 2.1. Minh chứng 1: Truy vấn Thẻ kho theo Sản phẩm

**Bối cảnh:** Thủ kho gõ mã sản phẩm vào ô tìm kiếm để xem lịch sử giao dịch.

```sql
EXPLAIN 
SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 
ORDER BY `TransactionDate` DESC;
```

**Đọc hiểu kết quả:**

| Cột trong kết quả | Giá trị mong đợi | Ý nghĩa |
|--------------------|--------------------|---------|
| `type` | `ref` | MySQL đang dùng Index (tốt). Nếu là `ALL` = quét toàn bảng (tệ). |
| `key` | `idx_transaction_product` | Bằng chứng thép: MySQL đã chọn đúng Index ta thiết kế. |
| `rows` | Số nhỏ (vd: 15) | Chỉ quét 15 dòng thay vì hàng vạn → Hiệu năng cực cao. |
| `Extra` | `Using index condition` | Điều kiện lọc được xử lý ngay tại tầng Index, không cần đọc dữ liệu gốc. |

### 2.2. Minh chứng 2: Truy vấn Tồn kho tại Vị trí cụ thể (Composite Index)

**Bối cảnh:** Hệ thống cần kiểm tra "Sản phẩm 1 ở Kho 1, Vị trí 1 còn bao nhiêu?"

```sql
EXPLAIN 
SELECT * FROM `Inventory` 
WHERE `ProductID` = 1 AND `WarehouseID` = 1 AND `LocationID` = 1;
```

**Kết quả mong đợi:**

| Cột | Giá trị | Ý nghĩa |
|-----|---------|---------|
| `type` | `const` | Tìm được kết quả chỉ trong **1 bước duy nhất** (nhanh nhất có thể). |
| `key` | `Inventory_ProductID_WarehouseID_LocationID_key` | Sử dụng đúng Composite UNIQUE Index. |
| `rows` | `1` | Chỉ cần đọc đúng 1 dòng. |

### 2.3. Minh chứng 3: Partition Pruning (Phân vùng thông minh)

**Bối cảnh:** Truy vấn giao dịch chỉ trong Quý 2/2026.

```sql
EXPLAIN
SELECT * FROM `InventoryTransactions`
WHERE `TransactionDate` >= '2026-04-01'
  AND `TransactionDate` < '2026-07-01';
```

**So sánh với truy vấn không có điều kiện:**

| Truy vấn | Cột `partitions` | Ý nghĩa |
|----------|-------------------|---------|
| Có WHERE theo ngày | `p_2026_q2` | MySQL CHỈ đọc 1 phân vùng (Partition Pruning) |
| Không có WHERE | `p_history, p_2026_q1, ..., p_future` | MySQL đọc TẤT CẢ phân vùng |

---

## 3. Minh chứng Database View (Khung nhìn ảo)

View là "bảng ảo" được tạo từ câu lệnh SELECT phức tạp (JOIN nhiều bảng). Sau khi tạo, ta truy vấn View như một bảng bình thường.

### 3.1. Danh sách Views đã triển khai

| View | Mục đích | Các bảng JOIN |
|------|----------|---------------|
| `InventoryReportView` | Báo cáo tồn kho chi tiết | Inventory + Products + Warehouses + Locations |
| `PurchaseOrderSummaryView` | Tổng hợp đơn mua hàng | PurchaseOrders + Suppliers + PurchaseOrderDetails |
| `SalesOrderSummaryView` | Tổng hợp đơn bán hàng | SalesOrders + Customers + SalesOrderDetails |
| `TransactionHistoryView` | Nhật ký giao dịch kho | InventoryTransactions + Products + Warehouses |

### 3.2. Câu lệnh tạo View (Ví dụ: Báo cáo tồn kho)

```sql
CREATE OR REPLACE VIEW `InventoryReportView` AS
SELECT 
    i.id AS id,
    p.id AS ProductID,
    p.ProductCode,
    p.ProductName,
    w.WarehouseName,
    l.LocationCode,
    i.Quantity
FROM `Inventory` i
INNER JOIN `Products` p ON i.ProductID = p.id
INNER JOIN `Warehouses` w ON i.WarehouseID = w.id
INNER JOIN `Locations` l ON i.LocationID = l.id;
```

### 3.3. Câu lệnh minh chứng

```sql
-- Xem kết quả từ View báo cáo tồn kho
SELECT * FROM `InventoryReportView` LIMIT 10;

-- Xem kết quả từ View báo cáo Đơn mua hàng (PO)
SELECT * FROM `PurchaseOrderSummaryView` LIMIT 10;

-- Xem kết quả từ View báo cáo Đơn bán hàng (SO)
SELECT * FROM `SalesOrderSummaryView` LIMIT 10;

-- Xem kết quả từ View nhật ký giao dịch
SELECT * FROM `TransactionHistoryView` LIMIT 10;
```

> **Nhận xét:** Việc sử dụng View giúp câu lệnh ở phía Backend cực kỳ ngắn gọn (`SELECT * FROM View`), đồng thời tăng tính bảo mật vì không cần cấp quyền truy cập trực tiếp vào các bảng dữ liệu gốc.

---

## 4. Minh chứng kỹ thuật CTE (Common Table Expression)

CTE là kỹ thuật viết truy vấn con có tên (sử dụng `WITH ... AS`) để phân tầng logic phức tạp thành các bước rõ ràng, dễ đọc.

### 4.1. CTE trong hệ thống WMS: Báo cáo tổng hợp tồn kho

```sql
WITH InventorySummary AS (
    SELECT 
        ProductID, 
        SUM(Quantity) as TotalQuantity
    FROM `Inventory`
    GROUP BY ProductID
)
SELECT 
    p.ProductCode, 
    p.ProductName, 
    s.TotalQuantity
FROM InventorySummary s
JOIN `Products` p ON s.ProductID = p.id
ORDER BY s.TotalQuantity DESC;
```

**Giải thích từng phần:**
1. **`WITH InventorySummary AS (...)`**: Tạo "bảng tạm" tên `InventorySummary`, gom tồn kho theo từng `ProductID`.
2. **`SELECT ... FROM InventorySummary s JOIN Products p`**: Dùng bảng tạm đó JOIN với `Products` để lấy tên sản phẩm.
3. **Ưu điểm so với Subquery:** CTE dễ đọc hơn, có thể tái sử dụng trong cùng 1 câu query, và MySQL có thể tối ưu hóa tốt hơn.

### 4.2. API Endpoints sử dụng View và CTE

| Method | Endpoint | Kỹ thuật | Mô tả |
|--------|----------|----------|-------|
| GET | `/api/inventory/report/view` | Database View | Lấy báo cáo tồn kho từ `InventoryReportView` |
| GET | `/api/inventory/report/cte` | CTE | Lấy báo cáo tổng hợp tồn kho bằng CTE |

---

## 5. Tổng hợp các câu lệnh minh chứng (Evidence Collection)

Toàn bộ các câu lệnh minh chứng đã được tập hợp trong file `sql/evidence_collection.sql`, bao gồm:
- **Phần 1:** Danh sách Index (SHOW INDEX)
- **Phần 2:** Minh chứng EXPLAIN (chứng minh Index hoạt động)
- **Phần 3:** Kết quả Database View (báo cáo tổng hợp)

> Hướng dẫn: Mở MySQL Workbench → Chọn database `wms_db` → Copy từng đoạn SQL → Bôi đen và bấm nút tia sét (Execute) → Chụp ảnh kết quả để dán vào báo cáo.
