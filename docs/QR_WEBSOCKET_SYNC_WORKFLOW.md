# Quy trình Đồng bộ Quét mã QR qua WebSocket (WMS Pro)

Tài liệu này mô tả chi tiết kiến trúc, luồng hoạt động và các bài học kinh nghiệm (troubleshooting) của hệ thống Quét mã QR đồng bộ thời gian thực giữa Máy tính (PC) và Điện thoại di động (Mobile) trong phân hệ Tạo đơn xuất hàng (Sales Order).

---

## 1. Tổng quan Kiến trúc (Architecture)

Hệ thống sử dụng **WebSocket (Socket.io)** để thiết lập kênh giao tiếp hai chiều thời gian thực giữa các thiết bị của người dùng và máy chủ.

*   **Backend (NestJS):** 
    *   `AllocationGateway`: Quản lý các kết nối Socket.
    *   Chia phòng (Rooms): 
        *   `user:{userId}`: Dùng để đồng bộ trạng thái (mở/đóng bảng, xác nhận) giữa các thiết bị của cùng một người dùng (hoặc giữa Quản lý và Nhân viên).
        *   `product:{productId}`: Dùng để cập nhật tức thời số lượng tồn kho khả dụng cho những người dùng khác đang xem cùng một sản phẩm.
*   **Frontend (React + Vite):**
    *   `useAllocationSocket` (Hook): Quản lý vòng đời kết nối Socket, tự động kết nối lại, và hứng các sự kiện từ Server.
    *   `CreateSalesOrderPage`: Chứa giao diện tạo QR, hiển thị bảng phân bổ (`Modal`) và xử lý logic quét mã qua Camera.
    *   `App.tsx` & `LoginPage.tsx`: Quản lý bảo vệ tuyến đường (Protected Routes) và bảo lưu trạng thái URL.

---

## 2. Luồng Hoạt động Chi tiết (Step-by-Step Workflow)

Luồng hoạt động dưới đây hỗ trợ hoàn hảo cả trường hợp **PC và Điện thoại đăng nhập cùng một tài khoản** hoặc **đăng nhập bằng hai tài khoản khác nhau** (vd: Quản lý tạo đơn trên PC, Nhân viên kho dùng điện thoại đi quét).

### Bước 1: Máy tính tạo mã QR (PC)
*   Người dùng trên PC chọn sản phẩm và bấm "Tạo QR".
*   Hệ thống kiểm tra: Nếu URL hiện tại là `localhost`, hệ thống sẽ chặn lại và yêu cầu dùng IP mạng LAN (vd: `192.168.1.5`) để đảm bảo điện thoại có thể truy cập được.
*   Mã QR được tạo ra chứa đường dẫn sâu (Deep Link): 
    `http://192.168.1.5:5173/sales-orders/new?scan=PROD001&ownerId=1`
    *(Trong đó `ownerId` là ID của tài khoản đang thao tác trên PC).*

### Bước 2: Điện thoại quét mã và Xác thực (Mobile)
*   Nhân viên dùng camera điện thoại quét QR, trình duyệt mở ra.
*   **Nếu chưa đăng nhập:** Tuyến đường bảo vệ (`ProtectedRoute`) sẽ chuyển hướng về `/login`, nhưng **bảo lưu lại toàn bộ URL gốc** vào bộ nhớ (state). Sau khi đăng nhập thành công, hệ thống tự động điều hướng ngược lại trang quét mã mà không làm mất tham số `?scan=PROD001`.

### Bước 3: Vượt Tường lửa và Kết nối Socket (Vite Proxy)
*   Để tránh việc Windows Firewall chặn cổng 3000 của Backend, kết nối Socket trên điện thoại được cấu hình gọi thẳng vào cổng 5173 của giao diện Web (`backendUrl = ''`).
*   Vite Server (tại cổng 5173) đóng vai trò làm Proxy, âm thầm đẩy luồng WebSocket (`/socket.io`) vào cổng 3000 của Backend một cách hợp lệ và an toàn.

### Bước 4: Đồng bộ Bảng phân bổ (Cross-User Sync)
*   Điện thoại bắt được tham số `scan` trên URL, tự động gửi sự kiện `scan:product` kèm theo `targetUserId` (chính là `ownerId` của PC).
*   Backend tạo một bản nháp phân bổ (Draft Allocation) **thuộc sở hữu của PC**.
*   Backend phát sóng (broadcast) sự kiện `modal:open` tới phòng `user:{ownerId}` (để PC mở bảng) VÀ đồng thời gửi lại cho chính điện thoại.
*   **Kết quả:** Bảng phân bổ bật lên cùng lúc trên cả 2 màn hình.

### Bước 5: Quét Vị trí và Xác nhận hoàn thành
*   Nhân viên cầm điện thoại đến kệ hàng, bấm quét mã QR dán trên kệ. Điện thoại gửi sự kiện `scan:location`.
*   Backend xác thực và gửi lại sự kiện `location:confirmed`. Màn hình PC lập tức hiện dấu tích xanh "✓ Đã quét".
*   Nhân viên bấm "Xác nhận phân bổ" trên điện thoại.
*   Backend không kiểm tra cứng `draft.userId` nữa (cho phép Nhân viên xác nhận hộ Quản lý). Nhận lệnh, Backend chốt dữ liệu, phát sự kiện `modal:close`.
*   Cả 2 màn hình cùng đóng lại, sản phẩm tự động được thêm vào danh sách chuẩn bị xuất kho trên máy tính.

---

## 3. Các Bài học Cốt lõi (Key Takeaways & Troubleshooting)

Khi bảo trì hoặc mở rộng hệ thống này trong tương lai, cần lưu ý các nguyên tắc sau:

1. **Vấn đề Localhost vs LAN IP:** 
   Các tính năng tương tác đa thiết bị (Mobile - PC) không bao giờ được dùng `localhost`. Phải luôn lấy LAN IP. Mã nguồn đã được bảo vệ bằng cảnh báo `isLocalhost = window.location.hostname === 'localhost'`.
2. **Vấn đề Tường lửa (Firewall) & WebSocket:**
   Khi Mobile gọi API REST hoặc WebSocket vào PC, cổng Backend (vd: 3000) thường bị chặn bởi Firewall. Giải pháp hoàn hảo là dùng **Reverse Proxy** (như Vite proxy `target: 'http://localhost:3000'`). Khi đó, Client chỉ cần gọi vào cổng Web (5173), bỏ qua mọi giới hạn của Firewall.
3. **Bảo lưu Tham số Truy vấn (Query Params) qua trang Đăng nhập:**
   Đây là lỗi cực kỳ dễ gặp ở các hệ thống có quét QR Deep-link. Lệnh `<Navigate to="/login" replace />` mặc định sẽ xóa sạch Query Params. Phải luôn truyền theo state: `<Navigate to="/login" state={{ from: location }} replace />` và xử lý phục hồi sau khi đăng nhập xong.
4. **Kiến trúc Phòng Socket cho nhiều người dùng (Cross-Account Socket Rooms):**
   Nếu hệ thống chỉ broadcast vào `user:{id}`, hai người dùng khác nhau sẽ không thấy thao tác của nhau. Cần thiết kế để API/Socket nhận tham số `targetUserId`, cho phép một người thực hiện lệnh (Sender) nhưng tác động trực tiếp vào luồng công việc của người khác (Target) và server phải chủ động phản hồi lại cho cả 2 bên.
