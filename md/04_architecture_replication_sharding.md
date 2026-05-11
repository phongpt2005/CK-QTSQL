# Hướng dẫn Kết nối MySQL Workbench & Thiết lập WMS Nâng cao

## 1. Kết nối MySQL Workbench với Cơ sở dữ liệu Cũ
Để bạn có thể chạy các file SQL rỗng (`sql/01_create_tables_and_indexes.sql`, `sql/02_create_views.sql`) và nhìn thấy bản chất dữ liệu, bạn cần kết nối MySQL Workbench vào database hiện tại của dự án.

**Các bước thực hiện:**
1. Mở file `backend/.env`. Bạn sẽ thấy chuỗi kết nối giống như sau:
   `DATABASE_URL="mysql://root:password@localhost:3306/wms_db"`
   (Thông số thực tế phụ thuộc vào máy bạn).
2. Mở ứng dụng **MySQL Workbench**.
3. Bấm vào nút `+` (Add new connection) ở mục MySQL Connections.
4. Nhập các thông tin sau lấy từ chuỗi kết nối ở trên:
   - **Hostname:** `localhost`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** Bấm `Store in Vault...` và nhập mật khẩu (`password`).
   - **Default Schema:** `wms_db` (Tên DB của bạn).
5. Bấm **Test Connection**. Nếu báo Success, bấm OK để lưu.
6. Mở Connection đó ra, mở tab **SQL Query mới**, copy nội dung file `sql/02_create_views.sql` dán vào và bấm tia sét (Run) để tạo Database View.

---

## 2. Kỹ thuật Database Nâng cao: Replication (Nhân bản)
Khi dự án WMS của bạn phát triển (hàng ngàn kho, hàng triệu mã sản phẩm), một máy chủ MySQL sẽ không chịu nổi tải. Lúc này ta dùng **Replication**.

### Định nghĩa
Replication là mô hình Master - Slave:
- **Master (Write):** 1 máy chủ duy nhất nhận lệnh Thêm/Sửa/Xóa (INSERT/UPDATE/DELETE). Vd: Tạo Phiếu xuất, Trừ kho.
- **Slave/Replica (Read):** 1 hoặc nhiều máy chủ chỉ nhận lệnh Đọc (SELECT). Vd: User xem báo cáo tồn kho, tìm kiếm sản phẩm.
- MySQL sẽ tự động đồng bộ data từ Master sang Slave.

### Ứng dụng với Prisma
Prisma hỗ trợ Replication thông qua Prisma Client Extension (Read Replicas). Bạn không cần đổi code backend cũ (không đổi logic), chỉ cần đổi lúc khởi tạo Prisma:

```typescript
// Ví dụ cấu hình Replication với Prisma
import { PrismaClient } from '@prisma/client'
import { readReplicas } from '@prisma/extension-read-replicas'

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.DATABASE_URL_REPLICA_1, // Trỏ tới máy chủ Read
  })
)

// Khi bạn chạy:
prisma.inventory.findMany() // Prisma tự động đẩy lệnh này sang máy chủ Replica_1
prisma.inventory.create()   // Prisma tự động đẩy lệnh này về máy chủ Master gốc
```

---

## 3. Kỹ thuật Database Nâng cao: Sharding (Phân mảnh)
Khi ổ cứng của máy chủ Master đầy hoặc bảng `InventoryTransaction` có vài trăm triệu dòng làm quá tải cả quá trình index, ta dùng **Sharding**.

### Định nghĩa
Sharding là băm nhỏ 1 CSDL lớn ra thành nhiều CSDL nhỏ nằm ở các máy chủ khác nhau.
**Ví dụ cho WMS:** 
- Khách hàng ở Miền Bắc (WarehouseID 1-10) -> Lưu ở Server Miền Bắc.
- Khách hàng ở Miền Nam (WarehouseID 11-20) -> Lưu ở Server Miền Nam.

### Ứng dụng với Prisma
Để dùng Sharding mà giữ nguyên Backend cũ (không phải if/else trong code), người ta sử dụng một **Database Proxy** (Ví dụ: `ProxySQL` hoặc `Vitess`).
1. Cài đặt ProxySQL làm người gác cổng.
2. Cấu hình `DATABASE_URL` trong Prisma trỏ thẳng vào IP của ProxySQL thay vì MySQL thực.

---

## 4. Hướng dẫn Minh chứng (Demo Guide) cho Đồ án

Vì việc cài đặt nhiều server MySQL thật sự trên máy cá nhân rất phức tạp, tôi đã thiết lập sẵn một **Service Demo Logic** tại `backend/src/common/database/sharding-demo.service.ts` để bạn làm minh chứng giải trình.

### 4.1. Cách trình bày Replication (Read/Write Splitting)
*   **Mục tiêu:** Chứng minh hệ thống biết phân biệt lệnh Đọc (vào Slave) và lệnh Ghi (vào Master).
*   **Giải trình:** Hãy mở file `sharding-demo.service.ts` và chỉ cho Giảng viên hàm `demoReplication`.
*   **Log minh chứng:** Khi chạy hàm này, hệ thống sẽ log ra URL server tương ứng:
    *   Lệnh `WRITE` -> trỏ về port `3306` (Master).
    *   Lệnh `READ` -> trỏ về port `3307` (Slave - Giả định).

### 4.2. Cách trình bày Sharding (Phân mảnh theo WarehouseID)
*   **Mục tiêu:** Chứng minh hệ thống tự biết chia dữ liệu ra các server vùng miền khác nhau.
*   **Giải trình:** Hãy mở hàm `demoSharding`. Giải thích rằng:
    *   Nếu `WarehouseID <= 10` -> Dữ liệu được đẩy về **Server Miền Bắc**.
    *   Nếu `WarehouseID > 10` -> Dữ liệu được đẩy về **Server Miền Nam**.
*   **Kết luận:** Cách làm này giúp giảm tải cho một database duy nhất và cho phép hệ thống mở rộng không giới hạn.

> [!IMPORTANT]
> Việc có sẵn các hàm xử lý này trong mã nguồn Backend chứng tỏ bạn đã có **tư duy thiết kế hệ thống lớn (Scalable Architecture)**, đây là điểm cộng cực lớn cho một đồ án tốt nghiệp hoặc bài tập lớn.

