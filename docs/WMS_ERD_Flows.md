# Sơ Đồ ERD Theo Từng Luồng Nghiệp Vụ - Hệ Thống WMS

Tài liệu này chia nhỏ sơ đồ ERD tổng thể của hệ thống WMS thành **6 luồng nghiệp vụ** riêng biệt, giúp dễ đọc và dễ hiểu hơn.

> **Ghi chú:** Mỗi luồng bao gồm sơ đồ ERD dạng Mermaid (render tự động) và hình ảnh minh họa dạng Chen (nếu có).

---

## 1. Luồng Đăng Nhập & Bảo Mật (Auth & Security)

**Mô tả:** Quản lý người dùng, đặt lại mật khẩu và phiếu hỗ trợ kỹ thuật.

**Các bảng liên quan:** `Users`, `PasswordResets`, `SupportTickets`

**Quan hệ:**
- Một `User` có thể yêu cầu nhiều lần `PasswordReset` (1:N)
- Một `User` có thể gửi nhiều `SupportTicket` (1:N)

### Sơ đồ ERD dạng Chen

![ERD Chen - Luồng Đăng Nhập](./ERD_Chen_Auth.png)

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    Users ||--o{ PasswordResets : "yêu cầu đổi mật khẩu"
    Users ||--o{ SupportTickets : "gửi phiếu hỗ trợ"

    Users {
        string id PK
        string email
        string password_hash
        string full_name
        string role
    }

    PasswordResets {
        string id PK
        string user_id FK
        string token
        datetime expires_at
    }

    SupportTickets {
        string id PK
        string user_id FK
        string subject
        string status
        text description
    }
```

---

## 2. Luồng Hạ Tầng Kho (Infrastructure)

**Mô tả:** Định nghĩa cấu trúc vật lý của kho hàng, từ tòa nhà đến vị trí lưu trữ cụ thể.

**Các bảng liên quan:** `Warehouses`, `Locations`

**Quan hệ:**
- Một `Warehouse` chứa nhiều `Location` (1:N)

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    Warehouses ||--o{ Locations : "chứa"

    Warehouses {
        string id PK
        string code
        string name
        string address
    }

    Locations {
        string id PK
        string warehouse_id FK
        string code
        string type
        string zone
        string shelf
        string bin
    }
```

---

## 3. Luồng Sản Phẩm & Dữ Liệu Gốc (Product & Core Data)

**Mô tả:** Danh mục sản phẩm, phân loại danh mục và đơn vị đo lường.

**Các bảng liên quan:** `Products`, `ProductCategories`, `Units`

**Quan hệ:**
- Một `ProductCategory` phân loại nhiều `Product` (1:N)
- Một `Unit` đo lường nhiều `Product` (1:N)

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    ProductCategories ||--o{ Products : "phân loại"
    Units ||--o{ Products : "đo lường"

    ProductCategories {
        string id PK
        string name
        string slug
    }

    Units {
        string id PK
        string name
        string abbreviation
    }

    Products {
        string id PK
        string category_id FK
        string unit_id FK
        string sku
        string name
        text description
        decimal price
    }
```

---

## 4. Luồng Nhập Hàng (Inbound Flow)

**Mô tả:** Vòng đời mua hàng: Nhà cung cấp → Đơn mua hàng → Phiếu nhập kho.

**Các bảng liên quan:** `Suppliers`, `PurchaseOrders`, `PurchaseOrderDetails`, `GoodsReceipts`, `GoodsReceiptDetails`, `Products`, `Locations`

**Quan hệ:**
- Một `Supplier` cung cấp nhiều `PurchaseOrder` (1:N)
- Một `PurchaseOrder` gồm nhiều `PurchaseOrderDetail` (1:N)
- Một `PurchaseOrder` kích hoạt nhiều `GoodsReceipt` (1:N)
- Một `GoodsReceipt` chứa nhiều `GoodsReceiptDetail` (1:N)
- `Products` được tham chiếu trong chi tiết đơn hàng và phiếu nhập
- `Locations` xác định vị trí lưu trữ hàng nhập

### Sơ đồ ERD dạng Chen

![ERD Chen - Luồng Nhập Hàng](./ERD_Chen_Inbound.png)

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    Suppliers ||--o{ PurchaseOrders : "cung cấp"
    PurchaseOrders ||--o{ PurchaseOrderDetails : "bao gồm"
    PurchaseOrders ||--o{ GoodsReceipts : "kích hoạt nhập kho"
    GoodsReceipts ||--o{ GoodsReceiptDetails : "chứa chi tiết"
    Products ||--o{ PurchaseOrderDetails : "được đặt mua"
    Products ||--o{ GoodsReceiptDetails : "được nhập kho"
    Locations ||--o{ GoodsReceiptDetails : "lưu trữ tại"

    Suppliers {
        string id PK
        string name
        string contact_info
    }

    PurchaseOrders {
        string id PK
        string supplier_id FK
        string po_number
        string status
        datetime order_date
    }

    PurchaseOrderDetails {
        string id PK
        string po_id FK
        string product_id FK
        int quantity
        decimal unit_price
    }

    GoodsReceipts {
        string id PK
        string po_id FK
        string gr_number
        datetime received_at
        string status
    }

    GoodsReceiptDetails {
        string id PK
        string gr_id FK
        string product_id FK
        string location_id FK
        int quantity_received
    }
```

---

## 5. Luồng Xuất Hàng (Outbound Flow)

**Mô tả:** Vòng đời bán hàng: Khách hàng → Đơn bán hàng → Phiếu xuất kho.

**Các bảng liên quan:** `Customers`, `SalesOrders`, `SalesOrderDetails`, `DeliveryNotes`, `DeliveryNoteDetails`, `Products`, `Locations`

**Quan hệ:**
- Một `Customer` đặt nhiều `SalesOrder` (1:N)
- Một `SalesOrder` gồm nhiều `SalesOrderDetail` (1:N)
- Một `SalesOrder` tạo ra nhiều `DeliveryNote` (1:N)
- Một `DeliveryNote` chứa nhiều `DeliveryNoteDetail` (1:N)
- `Products` được tham chiếu trong chi tiết đơn hàng và phiếu xuất
- `Locations` xác định vị trí lấy hàng xuất kho

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    Customers ||--o{ SalesOrders : "đặt hàng"
    SalesOrders ||--o{ SalesOrderDetails : "bao gồm"
    SalesOrders ||--o{ DeliveryNotes : "tạo phiếu xuất"
    DeliveryNotes ||--o{ DeliveryNoteDetails : "chứa chi tiết"
    Products ||--o{ SalesOrderDetails : "được bán"
    Products ||--o{ DeliveryNoteDetails : "được xuất kho"
    Locations ||--o{ DeliveryNoteDetails : "lấy hàng từ"

    Customers {
        string id PK
        string name
        string email
        string phone
    }

    SalesOrders {
        string id PK
        string customer_id FK
        string so_number
        string status
        datetime order_date
    }

    SalesOrderDetails {
        string id PK
        string so_id FK
        string product_id FK
        int quantity
        decimal unit_price
    }

    DeliveryNotes {
        string id PK
        string so_id FK
        string dn_number
        datetime shipped_at
        string status
    }

    DeliveryNoteDetails {
        string id PK
        string dn_id FK
        string product_id FK
        string location_id FK
        int quantity_shipped
    }
```

---

## 6. Luồng Tồn Kho & Quản Lý Stock (Inventory & Stock)

**Mô tả:** Theo dõi tồn kho thời gian thực, đặt trước hàng và lịch sử giao dịch kho.

**Các bảng liên quan:** `Inventory`, `StockReservations`, `InventoryTransactions`, `Products`, `Locations`

**Quan hệ:**
- Một `Product` có tồn kho tại nhiều vị trí (`Inventory`) (1:N)
- Một `Location` lưu giữ tồn kho nhiều sản phẩm (1:N)
- Một `Product` có thể bị đặt trước (`StockReservation`) nhiều lần (1:N)
- Một `Product` ghi lại nhiều giao dịch kho (`InventoryTransaction`) (1:N)

### Sơ đồ ERD dạng Mermaid

```mermaid
erDiagram
    Products ||--o{ Inventory : "có tồn kho"
    Locations ||--o{ Inventory : "lưu giữ"
    Products ||--o{ StockReservations : "đặt trước"
    Products ||--o{ InventoryTransactions : "ghi nhật ký"

    Inventory {
        string id PK
        string product_id FK
        string location_id FK
        int quantity_on_hand
    }

    StockReservations {
        string id PK
        string product_id FK
        string order_reference
        int reserved_quantity
        datetime expires_at
    }

    InventoryTransactions {
        string id PK
        string product_id FK
        string type
        int quantity_change
        string reference_id
        datetime created_at
    }
```

---

## Tổng Quan Bảng Theo Luồng

| Luồng | Số bảng | Các bảng chính |
|-------|---------|----------------|
| 1. Đăng nhập & Bảo mật | 3 | Users, PasswordResets, SupportTickets |
| 2. Hạ tầng Kho | 2 | Warehouses, Locations |
| 3. Sản phẩm | 3 | Products, ProductCategories, Units |
| 4. Nhập hàng | 5 | Suppliers, PurchaseOrders, PurchaseOrderDetails, GoodsReceipts, GoodsReceiptDetails |
| 5. Xuất hàng | 5 | Customers, SalesOrders, SalesOrderDetails, DeliveryNotes, DeliveryNoteDetails |
| 6. Tồn kho | 3 | Inventory, StockReservations, InventoryTransactions |
| **Tổng cộng** | **21** | |
