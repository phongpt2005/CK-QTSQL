// ============================================================
// WMS Types – Maps 1:1 with Backend Prisma Models
// ============================================================

// ── API Response Wrapper ──
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ── Auth ──
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  username: string;
  role: 'Admin' | 'Staff';
}

// ── Users ──
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: string | null;
  status: number;
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  password?: string;
  role?: string;
  status?: number;
}

// ── Product Categories ──
export interface ProductCategory {
  id: number;
  categoryName: string;
  description: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateCategoryDto {
  categoryName: string;
  description?: string;
}

export interface UpdateCategoryDto {
  categoryName?: string;
  description?: string;
  status?: number;
}

// ── Units ──
export interface Unit {
  id: number;
  unitName: string;
  symbol: string | null;
}

export interface CreateUnitDto {
  unitName: string;
  symbol?: string;
}

export interface UpdateUnitDto {
  unitName?: string;
  symbol?: string;
}

// ── Products ──
export interface Product {
  id: number;
  productCode: string;
  productName: string;
  categoryId: number | null;
  unitId: number | null;
  price: number;
  description: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  category?: ProductCategory | null;
  unit?: Unit | null;
}

export interface CreateProductDto {
  productCode: string;
  productName: string;
  categoryId?: number;
  unitId?: number;
  price?: number;
  description?: string;
}

export interface UpdateProductDto {
  productName?: string;
  categoryId?: number;
  unitId?: number;
  price?: number;
  description?: string;
  status?: number;
}

// ── Suppliers ──
export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateSupplierDto {
  supplierCode: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: number;
}

// ── Customers ──
export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface CreateCustomerDto {
  customerCode: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: number;
}

// ── Warehouses ──
export interface Warehouse {
  id: number;
  warehouseName: string;
  address: string | null;
  phone: string | null;
  managerName: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  warehouseName: string;
  address?: string;
  phone?: string;
  managerName?: string;
}

export interface UpdateWarehouseDto {
  warehouseName?: string;
  address?: string;
  phone?: string;
  managerName?: string;
  status?: number;
}

// ── Locations ──
export interface Location {
  id: number;
  warehouseId: number | null;
  locationCode: string;
  description: string | null;
  capacity: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  warehouse?: Warehouse | null;
}

export interface CreateLocationDto {
  warehouseId: number;
  locationCode: string;
  description?: string;
  capacity?: number;
}

export interface UpdateLocationDto {
  locationCode?: string;
  description?: string;
  capacity?: number;
  status?: number;
}

// ── Purchase Orders ──
export interface PurchaseOrder {
  id: number;
  poCode: string;
  supplierId: number | null;
  orderDate: string;
  status: string;
  totalAmount: number;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  supplier?: { id: number; supplierCode: string; name: string } | null;
  createdByUser?: { id: number; username: string } | null;
  details?: PurchaseOrderDetail[];
  goodsReceipts?: GoodsReceipt[];
  _count?: { goodsReceipts: number };
}

export interface PurchaseOrderDetail {
  id: number;
  poId: number | null;
  productId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number | null;
  product?: { id: number; productCode: string; productName: string } | null;
}

export interface PurchaseOrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  orderDate: string;
  note?: string;
  items: PurchaseOrderItemDto[];
}

// ── Goods Receipts ──
export interface GoodsReceipt {
  id: number;
  receiptCode: string;
  poId: number | null;
  receiptDate: string;
  status: string | null;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
  createdByUser?: { id: number; username: string } | null;
  details?: GoodsReceiptDetail[];
}

export interface GoodsReceiptDetail {
  id: number;
  receiptId: number | null;
  productId: number | null;
  locationId: number | null;
  quantity: number;
  product?: { id: number; productCode: string; productName: string } | null;
  location?: { id: number; locationCode: string; warehouseId?: number | null } | null;
}

export interface GoodsReceiptItemDto {
  productId: number;
  locationId: number;
  quantity: number;
}

export interface CreateGoodsReceiptDto {
  poId: number;
  receiptDate: string;
  note?: string;
  items: GoodsReceiptItemDto[];
}

// ── Sales Orders ──
export interface SalesOrder {
  id: number;
  soCode: string;
  customerId: number | null;
  orderDate: string;
  status: string;
  totalAmount: number;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
  customer?: { id: number; customerCode: string; name: string } | null;
  createdByUser?: { id: number; username: string } | null;
  details?: SalesOrderDetail[];
  deliveryNotes?: DeliveryNote[];
  _count?: { deliveryNotes: number };
}

export interface SalesOrderDetail {
  id: number;
  soId: number | null;
  productId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number | null;
  product?: { id: number; productCode: string; productName: string } | null;
}

export interface SalesOrderItemDto {
  productId: number;
  warehouseId: number;
  locationId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderDto {
  customerId: number;
  orderDate: string;
  note?: string;
  items: SalesOrderItemDto[];
}

// ── Delivery Notes ──
export interface DeliveryNote {
  id: number;
  deliveryCode: string;
  soId: number | null;
  deliveryDate: string;
  status: string | null;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
  createdByUser?: { id: number; username: string } | null;
  details?: DeliveryNoteDetail[];
}

export interface DeliveryNoteDetail {
  id: number;
  deliveryId: number | null;
  productId: number | null;
  locationId: number | null;
  quantity: number;
  product?: { id: number; productCode: string; productName: string } | null;
  location?: { id: number; locationCode: string; warehouseId?: number | null } | null;
}

export interface DeliveryNoteItemDto {
  productId: number;
  locationId: number;
  quantity: number;
}

export interface CreateDeliveryNoteDto {
  soId: number;
  deliveryDate: string;
  note?: string;
  items: DeliveryNoteItemDto[];
}

// ── Inventory ──
export interface InventoryItem {
  id: number;
  productId: number | null;
  warehouseId: number | null;
  locationId: number | null;
  quantity: number;
  lastUpdated: string;
  product?: { id: number; productCode: string; productName: string } | null;
  warehouse?: { id: number; warehouseName: string } | null;
  location?: { id: number; locationCode: string } | null;
  reservedQty?: number;
  availableQty?: number;
}

export interface InventoryQuery extends PaginationQuery {
  warehouseId?: number;
  productId?: number;
  locationId?: number;
}

export interface InventoryProductSummary {
  productId: number;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  details: InventoryItem[];
}

// ── Inventory Transactions ──
export interface InventoryTransaction {
  id: number;
  productId: number | null;
  warehouseId: number | null;
  quantity: number;
  transactionType: string | null;
  referenceType: string | null;
  referenceId: number | null;
  transactionDate: string;
  note: string | null;
  product?: { id: number; productCode: string; productName: string } | null;
  warehouse?: { id: number; warehouseName: string } | null;
}

export interface TransactionQuery extends PaginationQuery {
  productId?: number;
  warehouseId?: number;
}

// ── Stock Reservation ──
export interface StockReservation {
  id: number;
  productId: number | null;
  warehouseId: number | null;
  locationId: number | null;
  reservedQty: number;
  referenceType: string | null;
  referenceId: number | null;
  status: string | null;
  createdAt: string;
  product?: { id: number; productCode: string; productName: string } | null;
  warehouse?: { id: number; warehouseName: string } | null;
  location?: { id: number; locationCode: string } | null;
}

// ── Constants ──
export const ORDER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  RECEIVED: 'Received',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PARTIAL: 'Partial',
} as const;

export const TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export const USER_ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type TransactionTypeValue = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
