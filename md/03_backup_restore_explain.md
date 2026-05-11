# Tài liệu Sao lưu, Phục hồi và Minh chứng Tối ưu

Tài liệu này vạch ra chiến lược bảo vệ dữ liệu (Data Protection Strategy) cho hệ thống WMS thông qua các công cụ sao lưu chuẩn của MySQL, đồng thời cung cấp minh chứng phân tích truy vấn (`EXPLAIN`) để bảo vệ quyết định thiết kế Index.

---

## 1. Chiến lược Sao lưu & Phục hồi CSDL (Backup & Restore Strategy)

Dữ liệu của WMS đặc biệt quan trọng (liên quan đến tài sản vật lý). Do đó, dự án đề xuất chiến lược Backup theo cơ chế **Daily Full Backup** (Sao lưu toàn phần hàng ngày) bằng tiện ích `mysqldump`.

### 1.1. Lệnh Sao lưu (Backup)
Để kết xuất toàn bộ cấu trúc bảng và dữ liệu thành một file SQL, ta cấu hình hệ thống Cronjob (hoặc Task Scheduler) chạy đoạn script sau vào 2:00 sáng mỗi ngày:

```bash
# Cấu trúc lệnh: mysqldump -u [username] -p[password] [database_name] > [file_path]

mysqldump -u root -proot wms_db > backup_wms_db_$(date +%Y%m%d).sql
```
*Script này sẽ sinh ra file ví dụ: `backup_wms_db_20260425.sql`. File này sau đó sẽ được nén lại và upload lên Cloud Storage (như Amazon S3).*

### 1.2. Lệnh Phục hồi (Restore)
Trong trường hợp server gặp sự cố (bị xóa nhầm data hoặc hỏng phần cứng), Quản trị viên (DBA) có thể phục hồi lại CSDL bằng lệnh sau:

```bash
# Bước 1: Đảm bảo database đã được tạo rỗng
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS wms_db;"

# Bước 2: Import lại file SQL đã backup
mysql -u root -proot wms_db < backup_wms_db_20260425.sql
```

---

## 2. Minh chứng Tối ưu (EXPLAIN Query)

Để minh chứng cho Giảng viên thấy tác dụng của việc đánh Index, ta sử dụng công cụ `EXPLAIN` mặc định của MySQL. Tiện ích này sẽ "chụp x-quang" cách MySQL thực thi một câu lệnh truy vấn.

### Bối cảnh
Thủ kho gõ mã `ELEC-001` vào ô tìm kiếm để kiểm tra thẻ kho (Lịch sử giao dịch) của sản phẩm này.

### Lệnh cần phân tích
Bạn có thể copy đoạn mã này và chạy trực tiếp trên MySQL Workbench:

```sql
EXPLAIN 
SELECT * FROM `InventoryTransactions` 
WHERE `ProductID` = 1 
ORDER BY `TransactionDate` DESC;
```

### Đọc hiểu Kết quả EXPLAIN

| Cột trong kết quả | Ý nghĩa (Minh chứng tối ưu) |
|---|---|
| **type** | Chứng tỏ MySQL đang dùng Index để truy cập (Access Type tốt). Nên hiện `ref` thay vì `ALL`. |
| **key** | Đây là bằng chứng thép! MySQL xác nhận nó đã CHỌN SỬ DỤNG Index ta thiết kế. |
| **rows** | Số lượng dòng MySQL phải quét. Càng nhỏ càng chứng tỏ hiệu năng cao. |

### 2.1. Hình ảnh Minh chứng Thực tế (EXPLAIN Results)

*(Bạn hãy chạy phần 2 trong file `evidence_collection.sql` và dán ảnh/kết quả EXPLAIN vào đây)*

---

## 3. Minh chứng Database View (Report Evidence)

*Dữ liệu báo cáo được gom từ nhiều bảng (Products, Warehouses, Locations) vào một Frame duy nhất nhờ Database View:*

*(Bạn hãy chạy phần 3 trong file `evidence_collection.sql` và dán ảnh kết quả SELECT từ View vào đây)*

> [!IMPORTANT]
> **Nhận xét:** Việc sử dụng View giúp câu lệnh ở phía Backend cực kỳ ngắn gọn, đồng thời tăng tính bảo mật vì không cần cấp quyền truy cập trực tiếp vào các bảng dữ liệu gốc.

