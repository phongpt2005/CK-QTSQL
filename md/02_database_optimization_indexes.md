# Tài liệu Tối ưu Cơ sở Dữ liệu (Database Optimization)

Tài liệu này liệt kê các thiết kế tối ưu hóa được áp dụng trong Cơ sở dữ liệu của hệ thống WMS, tập trung vào chiến lược đánh Chỉ mục (Database Indexing) để đảm bảo tốc độ truy vấn kể cả khi hệ thống mở rộng lên hàng triệu bản ghi.

## Tầm quan trọng của Index trong WMS
Trong hệ thống Quản lý Kho, thao tác phổ biến nhất là tìm kiếm thông tin Hàng hóa (bằng mã vạch) và truy xuất Tồn kho. Việc cấu hình các Chỉ mục (B-Tree Index) hợp lý giúp tốc độ truy vấn tăng từ O(n) (Quét toàn bảng) xuống O(log n) (Tìm theo cấu trúc cây phân cấp).

## Danh sách Chỉ mục (Indexes) và Mục đích sử dụng

Dưới đây là các Indexes đã được cấu hình trong dự án (xem chi tiết tại `schema.prisma` và `sql/01_create_tables_and_indexes.sql`):

| STT | Bảng (Table) | Cột được Index | Loại Index | Tên Index | Mục đích sử dụng (Logic tối ưu) |
|---|---|---|---|---|---|
| 1 | `User` | `Username` | UNIQUE Index | `User_Username_key` | **Tối ưu đăng nhập:** Hàm tìm tài khoản lúc đăng nhập diễn ra cực kỳ nhiều. Index giúp tìm User chỉ trong 0.001s. Unique đảm bảo không thể tạo 2 tài khoản trùng tên. |
| 2 | `Product` | `ProductCode` | UNIQUE Index | `Product_ProductCode_key` | **Tối ưu tít mã vạch:** Thủ kho thao tác 100% qua thao tác tít mã `ProductCode`. Cột này được truy vấn liên tục trong mọi nghiệp vụ Nhập/Xuất kho. |
| 3 | `Supplier` | `SupplierCode` | UNIQUE Index | `Supplier_SupplierCode_key` | **Tìm kiếm nhà cung cấp:** Tăng tốc chức năng autocomplete (nhập nhanh) khi tạo Đơn mua hàng (PO). |
| 4 | `Customer` | `CustomerCode` | UNIQUE Index | `Customer_CustomerCode_key` | **Tìm kiếm khách hàng:** Tăng tốc autocomplete khi tạo Đơn bán hàng (SO). |
| 5 | `Inventory` | `ProductID`, `WarehouseID`, `LocationID` | UNIQUE Index (Composite) | `Inventory_ProductID_WarehouseID_LocationID_key` | **Ràng buộc Tồn kho Đơn nhất:** Ngăn chặn tuyệt đối việc sinh ra 2 dòng dữ liệu cho cùng 1 mặt hàng tại cùng 1 vị trí. Nếu thiếu cái này, hệ thống sẽ bị lỗi cộng dồn sai tồn kho. |
| 6 | `Inventory` | `ProductID`, `WarehouseID`, `LocationID` | Normal Index (B-Tree) | `idx_inventory_main` | **Tối ưu Báo cáo & Lấy hàng:** Phục vụ trực tiếp cho câu lệnh lấy hàng khi xuất kho: "Cần tìm sản phẩm A ở kho B vị trí C". |
| 7 | `InventoryTransactions` | `ProductID` | Normal Index | `idx_transaction_product` | **Tối ưu Thẻ kho (Báo cáo):** Khi người dùng muốn xem thẻ kho (Lịch sử Nhập/Xuất) của riêng rẽ 1 sản phẩm. Lọc hàng triệu giao dịch xuống chỉ vài chục giao dịch liên quan đến sản phẩm đó ngay lập tức. |
| 8 | `InventoryTransactions` | `TransactionDate` | Normal Index | `idx_transaction_date` | **Tối ưu Lọc theo Thời gian:** Các báo cáo WMS luôn đi kèm bộ lọc "Từ ngày... Đến ngày...". Index trên cột thời gian giúp việc gom báo cáo cuối tháng cực kì mượt mà. |

### Lưu ý về thiết kế
- **Hạn chế Index trên bảng Transaction:** Bảng `InventoryTransactions` là bảng có tần suất GHI (INSERT) lớn nhất hệ thống. Do đó, tôi cực kỳ dè xẻn, chỉ thiết lập đúng 2 Indexes (`ProductID` và `TransactionDate`) - là 2 thông số bị lọc nhiều nhất. Tuyệt đối không đánh Index vào cột `Quantity` hay `TransactionType` để bảo vệ tốc độ Ghi dữ liệu.

## Minh chứng thực tế (Evidence)

*(Bạn hãy chạy phần 1 trong file `sql/evidence_collection.sql` tại MySQL Workbench và dán ảnh bảng danh sách Index vào đây)*

> [!TIP]
> Một hệ thống WMS chuyên nghiệp cần chứng minh được các Index này thực sự tồn tại trong Database Engine chứ không chỉ nằm trên khai báo code.

