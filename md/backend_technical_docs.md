# Tài Liệu Kỹ Thuật Chi Tiết - Backend WMS

Tài liệu này mô tả chi tiết các hàm, cú pháp và logic nghiệp vụ được triển khai trong hệ thống Backend.

---

## 1. Cơ Chế Database (Prisma Service)
Hệ thống sử dụng **Read/Write Splitting** để tối ưu hiệu năng.

### `PrismaService` (`prisma.service.ts`)
*   **Thuộc tính `reader`:** Trả về một `PrismaClient` kết nối tới Database Replica (chỉ đọc).
*   **Cú pháp:**
    ```typescript
    // Dùng cho truy vấn Đọc (SELECT)
    this.prisma.reader.product.findMany();

    // Dùng cho truy vấn Ghi (INSERT/UPDATE/DELETE)
    this.prisma.product.create({ data: ... });
    ```
*   **Lợi ích:** Giảm tải cho Master DB, giúp các tác vụ ghi không bị block bởi các tác vụ đọc báo cáo nặng.

---

## 2. Quản Lý Kho Lõi (Inventory Module)
Đây là trái tim của hệ thống, xử lý mọi biến động hàng hóa.

### `InventoryService` (`inventory.service.ts`)

#### `increaseStock(tx, productId, warehouseId, locationId, qty, refType, refId)`
*   **Mục đích:** Tăng tồn kho khi nhập hàng.
*   **Logic cốt lõi:**
    1.  Dùng `SELECT ... FOR UPDATE` (Raw SQL) để khóa dòng dữ liệu của sản phẩm tại vị trí đó, ngăn chặn các transaction khác can thiệp cùng lúc.
    2.  Nếu đã có bản ghi tồn kho: `UPDATE quantity = quantity + qty`.
    3.  Nếu chưa có: `INSERT` bản ghi mới.
    4.  Ghi nhật ký vào bảng `InventoryTransactions`.

#### `decreaseStock(tx, productId, warehouseId, locationId, qty, refType, refId)`
*   **Mục đích:** Giảm tồn kho khi xuất hàng.
*   **Logic cốt lõi:**
    1.  Tương tự, dùng `FOR UPDATE` để khóa dòng.
    2.  Kiểm tra số lượng hiện tại (`Quantity`). Nếu `Quantity < qty`, ném lỗi `BadRequestException` để Rollback transaction (chặn xuất âm).
    3.  `UPDATE quantity = quantity - qty`.
    4.  Ghi nhật ký giao dịch với số lượng âm.

#### `getAvailableStock(tx, productId, warehouseId, locationId)`
*   **Công thức:** `Available = OnHand (Thực tế) - Reserved (Giữ chỗ)`.
*   **Cú pháp:** Kết hợp `FOR UPDATE` trên bảng `Inventory` và `aggregate` sum trên bảng `StockReservation`.

---

## 3. Quy Trình Bán Hàng (Sales Module)

### `SalesOrdersService.create()`
*   **Luồng xử lý (Transaction):**
    1.  Kiểm tra `availableStock` cho từng sản phẩm trong đơn hàng.
    2.  Tạo đơn hàng `SalesOrder` và `SalesOrderDetail`.
    3.  Tạo bản ghi `StockReservation` với trạng thái `Active`. Việc này "giữ chân" hàng hóa lại, không cho đơn hàng khác lấy mất.

### `DeliveryNotesService.create()`
*   **Luồng xử lý (Transaction):**
    1.  Tạo phiếu xuất kho `DeliveryNote`.
    2.  Gọi `inventoryService.decreaseStock()` để trừ hàng thật sự trong kho.
    3.  Cập nhật trạng thái `StockReservation` thành `Delivered` (Giải phóng giữ chỗ).
    4.  Cập nhật trạng thái `SalesOrder` thành `Delivered`.

---

## 4. Quy Trình Mua Hàng (Purchase Module)

### `GoodsReceiptsService.create()`
*   **Luồng xử lý (Transaction):**
    1.  Tạo phiếu nhập kho `GoodsReceipt`.
    2.  Gọi `inventoryService.increaseStock()` để tăng hàng trong kho.
    3.  Cập nhật trạng thái `PurchaseOrder` thành `Received`.

---

## 5. Các Hàm Tiện Ích & Hằng Số

### `generateUniqueCode(prefix)` (`code-generator.ts`)
*   **Cấu trúc mã:** `PREFIX-YYYYMMDD-HHMMSS-RANDOM` (Ví dụ: `SO-20240503-103000-1234`).
*   **Mục đích:** Đảm bảo mã đơn hàng là duy nhất ngay cả khi có hàng nghìn đơn hàng được tạo ra trong cùng một giây.

### Hằng Số Trạng Thái (`constants/index.ts`)
*   `ORDER_STATUS`: `Pending`, `Approved`, `Received`, `Delivered`, `Cancelled`.
*   `TRANSACTION_TYPE`: `IN` (Nhập), `OUT` (Xuất).
*   `RESERVATION_STATUS`: `Active` (Đang giữ), `Delivered` (Đã xuất), `Cancelled` (Đã hủy).

---

## 6. Tính Toàn Vẹn Dữ Liệu
*   **Giao dịch (Prisma $transaction):** Tất cả các thao tác liên quan đến nhiều bảng (ví dụ: tạo Phiếu xuất + Trừ kho + Cập nhật trạng thái) đều được bọc trong một transaction. Nếu một bước lỗi, toàn bộ quá trình sẽ bị hủy bỏ (Rollback), đảm bảo không bao giờ có chuyện phiếu đã tạo mà kho chưa trừ.
*   **Hard Delete:** Chỉ áp dụng cho các đơn hàng `Pending` chưa có biến động kho. Một khi đã có `GoodsReceipt` hoặc `DeliveryNote`, đơn hàng sẽ không được xóa để giữ lịch sử kế toán.

---
*Tài liệu này cung cấp chi tiết kỹ thuật cho lập trình viên để nắm bắt sâu hơn về cách code vận hành.*
