# Tài liệu Khởi tạo Cơ sở Dữ liệu (Database Initialization)

Tài liệu này trình bày các phương thức và kịch bản (scripts) được sử dụng để khởi tạo cấu trúc các bảng (Migration) và nạp dữ liệu mẫu ban đầu (Seeding) cho hệ thống Quản lý Kho hàng (WMS).

## 1. Scripts Khởi tạo Bảng (Database Migration)

Dự án WMS sử dụng **Prisma ORM** làm công cụ thiết kế và quản lý cấu trúc cơ sở dữ liệu. So với các công cụ cũ, Prisma quản lý Migration theo một phong cách Declarative (Khai báo) từ file `schema.prisma`.

### Cơ chế Up/Down Migration
Trong lý thuyết CSDL truyền thống:
- **Up Migration:** Chứa mã SQL `CREATE TABLE` hoặc `ALTER TABLE` để thêm bảng, thêm cột.
- **Down Migration:** Chứa mã SQL `DROP TABLE` để rollback (quay xe) lại trạng thái trước đó.

**Áp dụng trong hệ thống WMS (Prisma):**
- **Up:** Lệnh `npx prisma db push` hoặc `npx prisma migrate dev` sẽ tự động so sánh file `schema.prisma` với Database hiện tại và sinh ra lệnh **UP** tương ứng.
- **Down:** Khác với Laravel hay TypeORM, Prisma khuyến khích chiến lược "Tiến tới" (Forward-only). Để thực hiện **DOWN**, thay vì chạy file rollback, lập trình viên chỉ cần xóa cột/bảng trong `schema.prisma` và chạy lại lệnh migrate, Prisma sẽ tự động xử lý phần việc `DROP` dữ liệu.

*Minh chứng Script Up (Đã được trích xuất thành raw SQL)*:
Tham khảo file: `sql/01_create_tables_and_indexes.sql`.

---

## 2. Scripts Khởi tạo Dữ liệu Ban đầu (Database Seeding)

Sau khi tạo bảng, một hệ thống WMS cần các dữ liệu Master (Danh mục, Kho bãi, Tài khoản Admin) để có thể chạy được ngay. Quá trình này gọi là Seeding.

**Logic Seeding trong dự án:**
File mã nguồn thực thi: `backend/prisma/seed.ts`.

Quy trình Seeding được thiết kế theo chuẩn phụ thuộc (Dependency Order) để không vi phạm Khóa ngoại (Foreign Key Constraint):
1. **Khởi tạo Tài khoản (Users):** Dùng lệnh `upsert` (Update or Insert) để tạo tài khoản `admin` và `staff01`. Đảm bảo file seed có chạy nhiều lần thì tài khoản cũng không bị nhân bản hay báo lỗi.
2. **Khởi tạo Danh mục (ProductCategory) & Đơn vị (Unit):** Tạo các danh mục cơ bản như Điện tử, Văn phòng phẩm. Đây là các dữ liệu gốc độc lập.
3. **Khởi tạo Hàng hóa (Products):** Chỉ được tạo sau bước 2 vì nó tham chiếu Khóa ngoại đến `categoryId` và `unitId`.
4. **Khởi tạo Cơ sở vật chất (Warehouses & Locations):** Tạo 2 kho tổng (Kho Chính và Kho Phụ). Trong mỗi Kho tạo ra các Vị trí chi tiết (Ví dụ: Khu A, Kệ 1, Ngăn 1).
5. **Khởi tạo Đối tác (Suppliers & Customers):** Dữ liệu nhà cung cấp và khách hàng giả lập.

**Cách chạy lệnh Seed:**
```bash
# Lệnh chạy Seed thông qua file package.json đã được cấu hình
npm run db:seed
```
Sau khi chạy, hệ thống in ra thông báo `🌱 Starting seed...` và kết thúc bằng tài khoản đăng nhập mặc định:
- Admin: `admin` / `admin123`
- Nhân viên: `staff01` / `staff123`
