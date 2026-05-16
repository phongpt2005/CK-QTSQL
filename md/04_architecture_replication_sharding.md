# Tài liệu Kỹ thuật Nâng cao: Replication, Sharding & Partitioning

Tài liệu này trình bày chi tiết các kỹ thuật quản trị cơ sở dữ liệu nâng cao đã được thiết kế và triển khai (mô phỏng) trong hệ thống WMS, bao gồm: **Replication (Nhân bản)**, **Sharding (Phân mảnh)** và **Partitioning (Phân vùng)**.

---

## 1. Kỹ thuật Replication (Nhân bản dữ liệu)

### 1.1. Định nghĩa
Replication là kỹ thuật sao chép dữ liệu từ một máy chủ MySQL (Master) sang một hoặc nhiều máy chủ khác (Slave/Replica) một cách tự động và liên tục.

### 1.2. Mô hình Master - Slave trong WMS

```
┌─────────────────────────────────┐
│         APPLICATION             │
│    (NestJS Backend + Prisma)    │
└───────────┬─────────┬───────────┘
            │         │
     WRITE  │         │  READ
  (INSERT,  │         │  (SELECT)
   UPDATE,  │         │
   DELETE)  │         │
            ▼         ▼
   ┌────────────┐  ┌────────────────┐
   │   MASTER   │  │   SLAVE/REPLICA │
   │  Port 3306 │──│   Port 3307     │
   │  (Ghi)     │  │   (Đọc)        │
   └────────────┘  └────────────────┘
         │              ▲
         │   Binary Log │
         └──────────────┘
         (Đồng bộ tự động)
```

**Giải thích luồng hoạt động:**
1. Khi nhân viên **tạo Phiếu nhập kho** (INSERT) → Lệnh đi vào **Master** (Port 3306).
2. Khi nhân viên **xem Báo cáo tồn kho** (SELECT) → Lệnh đi vào **Slave** (Port 3307).
3. MySQL tự động đồng bộ dữ liệu từ Master sang Slave thông qua **Binary Log**.

### 1.3. Lợi ích cho hệ thống WMS

| Lợi ích | Giải thích | Ví dụ trong WMS |
|---------|-----------|-----------------|
| **Giảm tải Master** | Master chỉ xử lý lệnh Ghi, tải giảm 60-70% | 1000 nhân viên cùng xem báo cáo tồn kho → Slave xử lý, Master không bị ảnh hưởng |
| **Tăng tốc độ đọc** | Có thể thêm nhiều Slave để chia tải đọc | Thêm Slave thứ 2 khi số lượng kho mở rộng |
| **Dự phòng (High Availability)** | Nếu Master chết, Slave có thể "lên chức" thành Master mới | Đảm bảo hệ thống kho không bao giờ ngừng hoạt động |

### 1.4. Tích hợp với Prisma (Code Backend)

Prisma hỗ trợ Replication thông qua `Prisma Client Extension (Read Replicas)`. Không cần thay đổi logic backend hiện tại, chỉ cần thay đổi cấu hình khởi tạo:

```typescript
// File: backend/src/common/database/prisma.service.ts (Ví dụ cấu hình)
import { PrismaClient } from '@prisma/client'
import { readReplicas } from '@prisma/extension-read-replicas'

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.DATABASE_URL_REPLICA_1, // Trỏ tới máy chủ Slave (Read)
  })
)

// Khi gọi lệnh trong code:
prisma.inventory.findMany()   // → Prisma TỰ ĐỘNG đẩy lệnh này sang Slave (Read)
prisma.inventory.create()     // → Prisma TỰ ĐỘNG đẩy lệnh này về Master (Write)
```

**Điểm mạnh:** Lập trình viên KHÔNG cần viết if/else để phân biệt lệnh Đọc/Ghi. Prisma xử lý hoàn toàn tự động.

### 1.5. Mô phỏng trong dự án (Demo Service)

File mã nguồn: `backend/src/common/database/sharding-demo.service.ts`

Vì việc cài đặt nhiều server MySQL trên máy cá nhân rất phức tạp, dự án đã xây dựng sẵn một **Service Demo Logic** để mô phỏng cơ chế Read/Write Splitting:

```typescript
// Khi gọi demoReplication():
// Lệnh WRITE → Log: "Routing to MASTER (port 3306)"
// Lệnh READ  → Log: "Routing to SLAVE (port 3307)"
```

### 1.6. Câu lệnh SQL minh chứng

```sql
-- Kiểm tra cấu hình Server ID (phân biệt Master và Slave)
SHOW VARIABLES LIKE 'server_id';

-- Kiểm tra chế độ Read-Only (Slave thường bật read_only = ON)
SHOW VARIABLES LIKE 'read_only';

-- Kiểm tra trạng thái Binary Log (Master dùng để đồng bộ sang Slave)
SHOW VARIABLES LIKE 'log_bin';
```

---

## 2. Kỹ thuật Sharding (Phân mảnh dữ liệu)

### 2.1. Định nghĩa
Sharding là kỹ thuật **chia ngang** (Horizontal Partitioning) một cơ sở dữ liệu lớn thành nhiều cơ sở dữ liệu nhỏ hơn, mỗi phần nằm trên một máy chủ riêng biệt.

### 2.2. Thiết kế Sharding cho WMS

**Shard Key (Khóa phân mảnh):** `WarehouseID` — Phân chia theo vùng miền kho hàng.

```
┌────────────────────────────────────────────────┐
│              DATABASE PROXY                     │
│         (ProxySQL / Vitess)                     │
│    Prisma trỏ DATABASE_URL vào đây              │
└──────────┬────────────────────┬─────────────────┘
           │                    │
    WarehouseID ≤ 10     WarehouseID > 10
           │                    │
           ▼                    ▼
  ┌─────────────────┐  ┌─────────────────┐
  │  SHARD 1         │  │  SHARD 2         │
  │  Server Miền Bắc │  │  Server Miền Nam │
  │  (Kho 1-10)      │  │  (Kho 11-20)     │
  │  Port 3306       │  │  Port 3307       │
  └─────────────────┘  └─────────────────┘
```

### 2.3. Lợi ích cho hệ thống WMS

| Lợi ích | Giải thích | Ví dụ |
|---------|-----------|-------|
| **Giảm kích thước bảng** | Mỗi shard chỉ chứa 50% dữ liệu | 10 triệu sản phẩm → Mỗi shard chỉ 5 triệu |
| **Mở rộng không giới hạn** | Thêm shard mới khi mở rộng vùng miền | Mở kho Miền Trung → Thêm Shard 3 |
| **Giảm thời gian backup** | Backup từng shard song song | Backup 3 shard cùng lúc, nhanh gấp 3 lần |
| **Cô lập sự cố** | Shard 1 chết không ảnh hưởng Shard 2 | Kho Miền Bắc ngừng, Miền Nam vẫn hoạt động |

### 2.4. Tích hợp với Prisma

Để sử dụng Sharding mà giữ nguyên Backend (không cần viết if/else trong code), ta sử dụng một **Database Proxy**:

1. Cài đặt **ProxySQL** hoặc **Vitess** làm người gác cổng.
2. Cấu hình `DATABASE_URL` trong Prisma trỏ thẳng vào IP của ProxySQL thay vì MySQL thực.
3. ProxySQL tự động đọc `WarehouseID` trong câu truy vấn và chuyển hướng đến đúng Shard.

### 2.5. Mô phỏng trong dự án (Demo Service)

```typescript
// File: backend/src/common/database/sharding-demo.service.ts

demoSharding(warehouseId: number) {
  if (warehouseId <= 10) {
    // → Route đến Shard 1 (Server Miền Bắc, Port 3306)
    return { shard: 'SHARD_NORTH', server: 'mysql-north:3306' };
  } else {
    // → Route đến Shard 2 (Server Miền Nam, Port 3307)
    return { shard: 'SHARD_SOUTH', server: 'mysql-south:3307' };
  }
}
```

### 2.6. Câu lệnh SQL minh chứng phân bổ dữ liệu

```sql
-- Thống kê tỷ lệ dữ liệu trên từng Warehouse (mô phỏng phân bổ Shard)
SELECT 
    w.WarehouseName, 
    COUNT(i.id) AS SKU_Count,
    SUM(i.Quantity) AS Total_Items,
    ROUND(COUNT(i.id) * 100.0 / SUM(COUNT(i.id)) OVER(), 2) AS Data_Percent
FROM `Inventory` i
JOIN `Warehouses` w ON i.WarehouseID = w.id
GROUP BY w.id, w.WarehouseName
ORDER BY w.id;
```

### 2.7. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/architecture/sharding` | Tổng quan cấu hình Sharding |
| GET | `/api/admin/architecture/sharding/routing?warehouseId=5` | Xem kho được route tới server nào |
| GET | `/api/admin/architecture/sharding/distribution` | Phân bố dữ liệu theo Shard |
| GET | `/api/admin/architecture/sharding/write-demo?warehouseId=5` | Mô phỏng INSERT đi vào server nào |
| GET | `/api/admin/architecture/sharding/read-demo?warehouseId=15` | Mô phỏng SELECT đi vào server nào |

---

## 3. Kỹ thuật Partitioning (Phân vùng dữ liệu vật lý)

### 3.1. Định nghĩa
Partitioning là kỹ thuật chia **một bảng** lớn thành nhiều **phân vùng vật lý** (file riêng biệt trên ổ cứng). Khác với Sharding (chia database ra nhiều server), Partitioning chia bảng **trong cùng một server**.

### 3.2. So sánh Sharding vs Partitioning

| Tiêu chí | Sharding | Partitioning |
|----------|----------|-------------|
| Phạm vi | Chia **database** ra nhiều server | Chia **bảng** ra nhiều file trong 1 server |
| Phức tạp | Cần Proxy, nhiều server | Chỉ cần 1 câu ALTER TABLE |
| Chi phí | Cao (nhiều máy chủ) | Thấp (cùng 1 máy) |
| Khi nào dùng | Dữ liệu cực lớn (hàng tỷ dòng) | Dữ liệu lớn (hàng triệu dòng) |

### 3.3. Kỹ thuật áp dụng: Range Partitioning theo thời gian

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

### 3.4. Các bước thực hiện Partitioning

File SQL: `sql/04_real_partitioning.sql`

**Bước 1:** Xóa Foreign Key (MySQL không hỗ trợ Partition trên bảng có FK)
```sql
ALTER TABLE `InventoryTransactions`
  DROP FOREIGN KEY `InventoryTransactions_ProductID_fkey`;
ALTER TABLE `InventoryTransactions`
  DROP FOREIGN KEY `InventoryTransactions_WarehouseID_fkey`;
```

**Bước 2:** Mở rộng Primary Key (cột phân vùng phải nằm trong PK)
```sql
ALTER TABLE `InventoryTransactions`
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`id`, `TransactionDate`);
```

**Bước 3:** Tạo Partitions
```sql
ALTER TABLE `InventoryTransactions`
PARTITION BY RANGE COLUMNS(`TransactionDate`) (
  PARTITION p_history VALUES LESS THAN ('2026-01-01'),
  PARTITION p_2026_q1 VALUES LESS THAN ('2026-04-01'),
  PARTITION p_2026_q2 VALUES LESS THAN ('2026-07-01'),
  -- ... (xem đầy đủ tại sql/04_real_partitioning.sql)
  PARTITION p_future VALUES LESS THAN (MAXVALUE)
);
```

### 3.5. Minh chứng Partition Pruning

```sql
-- Kiểm tra danh sách Partitions đã tạo
SELECT
  PARTITION_NAME AS 'Tên Partition',
  TABLE_ROWS AS 'Số dòng',
  ROUND(DATA_LENGTH / 1024, 2) AS 'Dung lượng (KB)',
  PARTITION_DESCRIPTION AS 'Giới hạn trên'
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_SCHEMA = 'wms_db'
  AND TABLE_NAME = 'InventoryTransactions'
  AND PARTITION_NAME IS NOT NULL;

-- Truy vấn chỉ đọc Quý 2/2026 (Partition Pruning):
EXPLAIN SELECT * FROM `InventoryTransactions`
WHERE `TransactionDate` >= '2026-04-01'
  AND `TransactionDate` < '2026-07-01';
-- → Kết quả: partitions = p_2026_q2 (CHỈ 1 phân vùng)
```

### 3.6. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/architecture/partitions` | Danh sách Partitions hiện có |
| GET | `/api/admin/architecture/partitions/explain` | Minh chứng Partition Pruning |

---

## 4. Kiểm thử trên Frontend

Trang **Kiến trúc hệ thống** (`/admin/architecture`) — chỉ hiển thị cho Admin:

### 4.1. Test Sharding & Replication Routing
- Nhập `WarehouseID` (ví dụ: 5 hoặc 15) và bấm **"Check Routing"** → Xem dữ liệu rẽ nhánh về Server nào.
- Bấm **"Demo Read (Slave)"** → Xem lệnh SELECT đi vào Slave nào.
- Bấm **"Demo Write (Master)"** → Xem lệnh INSERT đi vào Master nào.

### 4.2. Test Partitioning
- Bảng liệt kê Partitions hiện có trong MySQL (tên, số dòng, dung lượng).
- Nút **"Run EXPLAIN (Q2-2026)"** → Chứng minh Partition Pruning trực tiếp trên UI.

> **Kết luận:** Việc có sẵn các hàm xử lý Replication, Sharding, và Partitioning trong mã nguồn Backend chứng tỏ dự án đã có **tư duy thiết kế hệ thống lớn (Scalable Architecture)**, sẵn sàng mở rộng khi doanh nghiệp phát triển.
