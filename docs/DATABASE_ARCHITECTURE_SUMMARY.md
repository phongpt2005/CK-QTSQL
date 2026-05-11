# Tổng quan Quản trị Cơ sở Dữ liệu - Hệ thống WMS Pro

Tài liệu này tổng hợp toàn bộ các kỹ thuật quản trị cơ sở dữ liệu đã được thiết kế và triển khai trong hệ thống Quản lý Kho (WMS Pro), bao gồm: **Index, View, Partition, Replication, và Sharding**.

---

## 1. Chỉ mục (Database Indexing)

> **Tài liệu gốc:** `md/02_database_optimization_indexes.md`
> **File SQL:** `sql/01_create_tables_and_indexes.sql`

### Tầm quan trọng
Trong hệ thống Quản lý Kho, thao tác phổ biến nhất là tìm kiếm Hàng hóa (bằng mã vạch) và truy xuất Tồn kho. Việc cấu hình các Chỉ mục (B-Tree Index) hợp lý giúp tốc độ truy vấn tăng từ **O(n)** (Quét toàn bảng) xuống **O(log n)** (Tìm theo cấu trúc cây phân cấp).

### Danh sách Indexes đã triển khai

| STT | Bảng | Cột Index | Loại | Mục đích |
|-----|------|-----------|------|----------|
| 1 | `User` | `Username` | UNIQUE | Tối ưu đăng nhập: Tìm User trong 0.001s. Unique đảm bảo không trùng tên. |
| 2 | `Product` | `ProductCode` | UNIQUE | Tối ưu tít mã vạch: Thủ kho thao tác 100% qua mã `ProductCode`. |
| 3 | `Supplier` | `SupplierCode` | UNIQUE | Tăng tốc autocomplete khi tạo Đơn mua hàng (PO). |
| 4 | `Customer` | `CustomerCode` | UNIQUE | Tăng tốc autocomplete khi tạo Đơn bán hàng (SO). |
| 5 | `Inventory` | `ProductID, WarehouseID, LocationID` | UNIQUE (Composite) | Ngăn chặn tuyệt đối việc sinh 2 dòng tồn kho trùng lặp cho cùng 1 mặt hàng tại cùng 1 vị trí. |
| 6 | `Inventory` | `ProductID, WarehouseID, LocationID` | Normal (B-Tree) | Tối ưu truy vấn lấy hàng khi xuất kho: "Tìm SP A ở kho B vị trí C". |
| 7 | `InventoryTransactions` | `ProductID` | Normal | Tối ưu Thẻ kho: Lọc lịch sử nhập/xuất của 1 sản phẩm ngay lập tức. |
| 8 | `InventoryTransactions` | `TransactionDate` | Normal | Tối ưu báo cáo "Từ ngày... Đến ngày..." cực kì mượt mà. |

### Chiến lược tối ưu
- **Hạn chế Index trên bảng Transaction:** Bảng `InventoryTransactions` có tần suất GHI (INSERT) lớn nhất. Chỉ đánh đúng 2 Indexes (`ProductID` và `TransactionDate`). Tuyệt đối không đánh Index vào cột `Quantity` hay `TransactionType` để bảo vệ tốc độ Ghi.

### Kiểm thử trên Frontend
Index hoạt động **ngầm** - không cần UI riêng. Bạn có thể test hiệu năng trực tiếp qua các tính năng:
- **Đăng nhập** → Dùng `Username UNIQUE Index`
- **Quét mã QR xuất/nhập kho** → Dùng `ProductCode Index`
- **Autocomplete NCC/Khách hàng** khi tạo đơn → Dùng `SupplierCode / CustomerCode Index`

---

## 2. Khung nhìn ảo (Database Views)

> **File SQL:** `sql/02_create_views.sql`
> **Backend Service:** `backend/src/modules/inventory/services/inventory-report.service.ts`
> **Backend Controller:** `backend/src/modules/inventory/inventory-report.controller.ts`

### Định nghĩa
View là một "bảng ảo" được tạo từ câu lệnh SELECT phức tạp (JOIN nhiều bảng). Sau khi tạo, ta truy vấn View như một bảng bình thường, giảm thiểu việc viết lại các câu JOIN lặp đi lặp lại.

### Danh sách Views đã tạo

| View | Mục đích | Các bảng JOIN |
|------|----------|---------------|
| `InventoryReportView` | Báo cáo tồn kho chi tiết | Inventory + Products + Warehouses + Locations |
| `PurchaseOrderSummaryView` | Tổng hợp đơn mua hàng | PurchaseOrders + Suppliers + PurchaseOrderDetails |
| `SalesOrderSummaryView` | Tổng hợp đơn bán hàng | SalesOrders + Customers + SalesOrderDetails |
| `TransactionHistoryView` | Nhật ký giao dịch kho | InventoryTransactions + Products + Warehouses |

### Kỹ thuật CTE (Common Table Expression)
Ngoài View, hệ thống còn sử dụng kỹ thuật **CTE (WITH clause)** để tổng hợp tồn kho theo sản phẩm trên toàn bộ hệ thống kho. CTE tính toán trực tiếp trên MySQL Engine thay vì lấy dữ liệu thô lên Node.js rồi dùng JavaScript `reduce/map`.

```sql
WITH InventorySummary AS (
  SELECT ProductID, SUM(Quantity) as TotalQuantity
  FROM Inventory
  GROUP BY ProductID
)
SELECT p.ProductCode, p.ProductName, s.TotalQuantity
FROM InventorySummary s
JOIN Products p ON s.ProductID = p.id
ORDER BY s.TotalQuantity DESC;
```

### API Endpoints đã triển khai

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/inventory/report/view` | Lấy báo cáo tồn kho từ `InventoryReportView` |
| GET | `/api/inventory/report/cte` | Lấy báo cáo tổng hợp tồn kho bằng CTE |

### Kiểm thử trên Frontend
Trang **Tồn kho (Inventory)** đã được nâng cấp thành giao diện dạng **Tabs**:
- **Tab 1 - "Tồn kho chi tiết"**: Giữ nguyên bảng tồn kho chi tiết gốc (ORM Prisma).
- **Tab 2 - "Báo cáo SQL View"**: Gọi API `/inventory/report/view`, hiển thị dữ liệu từ `InventoryReportView`.
- **Tab 3 - "Báo cáo Tổng hợp (CTE)"**: Gọi API `/inventory/report/cte`, hiển thị bảng gom nhóm tổng lượng tồn kho theo sản phẩm. Có dòng tổng cộng toàn hệ thống ở cuối bảng.

> **Lưu ý:** Cần chạy file `sql/02_create_views.sql` trong MySQL Workbench trước khi sử dụng Tab 2 (SQL View). Nếu chưa chạy, hệ thống sẽ hiển thị cảnh báo hướng dẫn.

---

## 3. Phân vùng dữ liệu vật lý (Partitioning)

> **File SQL:** `sql/04_real_partitioning.sql`
> **Backend Service:** `backend/src/common/database/partition-manager.service.ts`
> **Backend Controller:** `backend/src/common/database/architecture.controller.ts`

### Định nghĩa
Partitioning là kỹ thuật chia một bảng lớn thành nhiều **phân vùng vật lý** (file riêng biệt trên ổ cứng). Khi truy vấn có điều kiện lọc, MySQL chỉ đọc đúng phân vùng chứa dữ liệu cần thiết (**Partition Pruning**) thay vì quét toàn bộ bảng.

### Kỹ thuật áp dụng: Range Partitioning theo TransactionDate
Bảng `InventoryTransactions` được chia thành các phân vùng theo **từng Quý**:

| Partition | Phạm vi | Ghi chú |
|-----------|---------|---------|
| `p_history` | Trước 2026-01-01 | Dữ liệu lịch sử |
| `p_2026_q1` | T1-T3/2026 | Quý 1/2026 |
| `p_2026_q2` | T4-T6/2026 | Quý 2/2026 |
| `p_2026_q3` | T7-T9/2026 | Quý 3/2026 |
| `p_2026_q4` | T10-T12/2026 | Quý 4/2026 |
| `p_2027_q1` | T1-T3/2027 | Quý 1/2027 |
| `p_2027_q2` | T4-T6/2027 | Quý 2/2027 |
| `p_future` | MAXVALUE | Dữ liệu tương lai |

### Điều kiện tiên quyết khi Partition
1. MySQL **không hỗ trợ** Partitioning trên bảng có Foreign Key → Phải gỡ FK, đẩy quản lý toàn vẹn lên tầng Application (Prisma).
2. Cột phân vùng (`TransactionDate`) phải nằm trong Primary Key → PK được mở rộng thành `(id, TransactionDate)`.

### Minh chứng Partition Pruning
```sql
-- Truy vấn chỉ đọc Quý 2/2026:
EXPLAIN SELECT * FROM InventoryTransactions
WHERE TransactionDate >= '2026-04-01' AND TransactionDate < '2026-07-01';
-- → Kết quả: partitions = p_2026_q2 (chỉ 1 phân vùng)

-- So sánh: Không có điều kiện ngày (đọc TẤT CẢ):
EXPLAIN SELECT * FROM InventoryTransactions;
-- → Kết quả: partitions = p_history, p_2026_q1, ..., p_future (tất cả)
```

### Kiểm thử trên Frontend
Trang **Kiến trúc hệ thống** (`/admin/architecture`) có phần **Database Partitions**:
- Bảng liệt kê danh sách Partitions hiện có trong MySQL (tên, số dòng, dung lượng).
- Nút **"Run EXPLAIN (Q2-2026)"** để chứng minh Partition Pruning trực tiếp.

---

## 4. Nhân bản dữ liệu (Replication)

> **Tài liệu gốc:** `md/04_architecture_replication_sharding.md`
> **Backend Service:** `backend/src/common/database/sharding-demo.service.ts`

### Định nghĩa
Replication là mô hình **Master - Slave**:
- **Master (Write):** 1 máy chủ duy nhất nhận lệnh Thêm/Sửa/Xóa (INSERT/UPDATE/DELETE). Ví dụ: Tạo Phiếu xuất, Trừ kho.
- **Slave/Replica (Read):** 1 hoặc nhiều máy chủ chỉ nhận lệnh Đọc (SELECT). Ví dụ: Xem báo cáo tồn kho, tìm kiếm sản phẩm.
- MySQL tự động đồng bộ data từ Master sang Slave.

### Tích hợp với Prisma
Prisma hỗ trợ Replication thông qua `Prisma Client Extension (Read Replicas)`. Không cần đổi logic backend, chỉ cần đổi cấu hình khởi tạo:

```typescript
import { PrismaClient } from '@prisma/client'
import { readReplicas } from '@prisma/extension-read-replicas'

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.DATABASE_URL_REPLICA_1, // Trỏ tới máy chủ Read
  })
)

// Prisma tự động phân luồng:
prisma.inventory.findMany() // → Replica (Read)
prisma.inventory.create()   // → Master (Write)
```

### Kiểm thử trên Frontend
Trang **Kiến trúc hệ thống** (`/admin/architecture`) có phần **Sharding & Replication Routing**:
- Nhập `WarehouseID` và bấm **"Demo Read (Slave)"** → Xem lệnh SELECT đi vào Slave nào.
- Nhập `WarehouseID` và bấm **"Demo Write (Master)"** → Xem lệnh INSERT đi vào Master nào.

---

## 5. Phân mảnh dữ liệu (Sharding)

> **Tài liệu gốc:** `md/04_architecture_replication_sharding.md`
> **Backend Service:** `backend/src/common/database/sharding-demo.service.ts`
> **Backend Controller:** `backend/src/common/database/architecture.controller.ts`

### Định nghĩa
Sharding là kỹ thuật **băm nhỏ** 1 CSDL lớn ra thành nhiều CSDL nhỏ nằm ở các máy chủ khác nhau.

### Thiết kế cho WMS
- **Kho ID 1-10** (Miền Bắc) → Lưu ở Server Miền Bắc.
- **Kho ID 11-20** (Miền Nam) → Lưu ở Server Miền Nam.

### Tích hợp với Prisma
Sử dụng **Database Proxy** (ProxySQL hoặc Vitess) làm người gác cổng. Cấu hình `DATABASE_URL` trong Prisma trỏ thẳng vào IP của ProxySQL thay vì MySQL thực.

### API Endpoints đã triển khai

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/architecture` | Tổng quan toàn bộ kiến trúc |
| GET | `/api/admin/architecture/sharding` | Tổng quan cấu hình Sharding |
| GET | `/api/admin/architecture/sharding/routing?warehouseId=5` | Xem kho được route tới server nào |
| GET | `/api/admin/architecture/sharding/distribution` | Phân bố dữ liệu theo Shard |
| GET | `/api/admin/architecture/sharding/write-demo?warehouseId=5` | Mô phỏng INSERT đi vào server nào |
| GET | `/api/admin/architecture/sharding/read-demo?warehouseId=15` | Mô phỏng SELECT đi vào server nào |
| GET | `/api/admin/architecture/partitions` | Danh sách Partitions |
| GET | `/api/admin/architecture/partitions/explain` | Minh chứng Partition Pruning |

### Kiểm thử trên Frontend
Trang **Kiến trúc hệ thống** (`/admin/architecture`) — chỉ hiển thị cho Admin:
- Nhập `WarehouseID` (ví dụ: 5 hoặc 15) và bấm **"Check Routing"** → Xem luồng dữ liệu bị rẽ nhánh về Server nào (Miền Bắc hay Miền Nam).
- Bấm **"Demo Read"** và **"Demo Write"** → Xem chi tiết routing cho lệnh Đọc và Ghi.

---

## 6. Tổng kết các thay đổi Frontend đã triển khai

### Trang mới: Kiến trúc hệ thống (Admin Only)
- **File:** `frontend/src/pages/admin/AdminArchitecturePage.tsx`
- **Route:** `/admin/architecture`
- **Chức năng:** Mô phỏng và quản lý Sharding, Replication, Partitioning.
- **Vị trí menu:** Sidebar → Mục Admin → "Kiến trúc hệ thống" (icon Database).

### Nâng cấp: Trang Tồn kho (Inventory)
- **File:** `frontend/src/pages/inventory/InventoryPage.tsx`
- **Chức năng mới:** Thêm 2 tab báo cáo nâng cao từ Database View và CTE.
- Tab 1: Tồn kho chi tiết (giữ nguyên).
- Tab 2: Báo cáo SQL View.
- Tab 3: Báo cáo Tổng hợp CTE.

### Cập nhật Backend
- **File mới:** `backend/src/modules/inventory/inventory-report.controller.ts`
- **File sửa:** `backend/src/modules/inventory/inventory.module.ts` (đăng ký Controller mới).

### Các file liên quan khác (không thay đổi)
- `backend/src/common/database/architecture.controller.ts` — API Architecture (đã có sẵn).
- `backend/src/common/database/sharding-demo.service.ts` — Logic Sharding (đã có sẵn).
- `backend/src/common/database/partition-manager.service.ts` — Logic Partition (đã có sẵn).
- `backend/src/modules/inventory/services/inventory-report.service.ts` — Logic View & CTE (đã có sẵn).

---

## 7. Hướng dẫn chạy SQL trước khi test

Để các tính năng View và Partition hoạt động trên MySQL, cần chạy các file SQL sau trong **MySQL Workbench**:

1. **Tạo Views:** Chạy `sql/02_create_views.sql`
2. **Tạo Partitions:** Chạy `sql/04_real_partitioning.sql`

> **Lưu ý:** File `04_real_partitioning.sql` sẽ gỡ Foreign Key trên bảng `InventoryTransactions`. Đảm bảo đã backup dữ liệu trước khi chạy.
