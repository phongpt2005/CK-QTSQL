# Review Logic Backend - Hệ Thống Quản Lý Kho (WMS)

Tài liệu này tổng hợp toàn bộ các logic cốt lõi của backend để bạn dễ dàng nắm bắt cấu trúc và luồng xử lý của hệ thống.

---

## 1. Kiến Trúc Cơ Sở Dữ Liệu & Hiệu Năng
Hệ thống được thiết kế với các kỹ thuật tối ưu hóa database mức cao:

*   **Phân tách Đọc/Ghi (Read/Write Splitting):**
    *   **Master (Ghi):** Xử lý `INSERT`, `UPDATE`, `DELETE`.
    *   **Replica (Đọc):** Xử lý `SELECT` (thông qua `this.prisma.reader`). Giúp giảm tải cho Master khi có hàng nghìn người dùng truy vấn báo cáo.
*   **Khóa dòng (Row-level Locking):**
    *   Sử dụng `SELECT ... FOR UPDATE` trong các giao dịch (`$transaction`) để ngăn chặn tranh chấp dữ liệu (Race Conditions) khi nhiều người cùng xuất/nhập một loại mặt hàng tại cùng một thời điểm.
*   **Database Views:**
    *   Các báo cáo phức tạp (Tồn kho chi tiết, Tổng hợp đơn hàng, Thẻ kho) được xử lý bằng SQL View để đạt hiệu năng tối đa thay vì join thủ công trong code.

---

## 2. Luồng Nghiệp Vụ Cốt Lõi

### A. Luồng Nhập Kho (Inbound)
1.  **Đơn mua hàng (Purchase Order - PO):** Khởi tạo đơn hàng với nhà cung cấp ở trạng thái `Pending`.
2.  **Phiếu nhập kho (Goods Receipt):**
    *   Xác nhận hàng về thực tế.
    *   Hệ thống gọi `InventoryService.increaseStock()`.
    *   Ghi nhận nhật ký giao dịch (`InventoryTransactions`).
    *   Cập nhật số lượng vào bảng `Inventory`.

### B. Luồng Xuất Kho (Outbound)
1.  **Đơn bán hàng (Sales Order - SO):**
    *   Kiểm tra tồn kho khả dụng (Available = Total - Reserved).
    *   Nếu đủ hàng, tạo SO và thực hiện **Stock Reservation** (Giữ hàng). Hàng bị "giữ" sẽ không thể bán cho đơn khác nhưng vẫn nằm trong kho.
2.  **Phiếu xuất kho (Delivery Note):**
    *   Thực hiện xuất hàng thực tế từ vị trí (Location) cụ thể.
    *   Hệ thống gọi `InventoryService.decreaseStock()`.
    *   **Giải phóng Reservation:** Chuyển trạng thái giữ hàng sang `Delivered`.
    *   Cập nhật trạng thái SO thành `Delivered`.

---

## 3. Quản Lý Tồn Kho (Inventory Logic)
Đây là phần quan trọng nhất, đảm bảo tính chính xác của số liệu:

*   **Tính toán tồn kho khả dụng:** 
    `Available Qty = Thực tế trong kho - Tổng số lượng đang bị giữ (Active Reservations)`
*   **Chặn xuất âm:** Logic trong `decreaseStock` luôn kiểm tra số lượng trước khi trừ, nếu không đủ sẽ `Rollback` toàn bộ giao dịch.
*   **Nhật ký thẻ kho (Transactions):** Mọi biến động tăng/giảm đều được lưu lại để phục vụ việc truy xuất nguồn gốc (ai nhập, lúc nào, từ đơn hàng nào).

---

## 4. Cơ Chế Xóa Dữ Liệu (Data Integrity)
*   **Hard Delete (Xóa hẳn):** Chỉ cho phép xóa hoàn toàn các đơn hàng (PO/SO) đang ở trạng thái `Pending`. Khi xóa, hệ thống sẽ xóa sạch các bản ghi liên quan trong bảng `Details` và `Reservations` để làm gọn database.
*   **Soft Delete (Xóa mềm):** Áp dụng cho Danh mục sản phẩm, Khách hàng, Nhà cung cấp (gán `isDeleted = true`) để giữ lại lịch sử giao dịch cũ.

---

## 5. Các Modules Chính
*   **Auth/Users:** Quản lý đăng nhập và phân quyền (Admin/User).
*   **Products:** Quản lý thông tin sản phẩm, đơn vị tính, danh mục.
*   **Inventory:** Module lõi điều khiển việc tăng/giảm và khóa dữ liệu kho.
*   **Purchase/Sales:** Quản lý quy trình mua bán và phiếu nhập/xuất tương ứng.
*   **Warehouse:** Quản lý kho và các vị trí (Location) chi tiết trong kho.

---
*Tài liệu này giúp bạn có cái nhìn tổng thể để tiếp tục phát triển hoặc debug hệ thống một cách tự tin.*
