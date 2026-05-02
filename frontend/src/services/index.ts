import api from './api';
import type {
  ApiResponse, PaginatedResult, LoginRequest, LoginResponse, RegisterRequest,
  Product, CreateProductDto, UpdateProductDto,
  ProductCategory, CreateCategoryDto, UpdateCategoryDto,
  Unit, CreateUnitDto, UpdateUnitDto,
  Supplier, CreateSupplierDto, UpdateSupplierDto,
  Customer, CreateCustomerDto, UpdateCustomerDto,
  Warehouse, CreateWarehouseDto, UpdateWarehouseDto,
  Location, CreateLocationDto, UpdateLocationDto,
  PurchaseOrder, CreatePurchaseOrderDto,
  GoodsReceipt, CreateGoodsReceiptDto,
  SalesOrder, CreateSalesOrderDto,
  DeliveryNote, CreateDeliveryNoteDto,
  InventoryItem, InventoryQuery, InventoryProductSummary,
  InventoryTransaction, TransactionQuery,
  User, CreateUserDto, UpdateUserDto,
  PaginationQuery,
} from '@/types';

// ── Helpers ──
function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

// ============================================================
// AUTH
// ============================================================
export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data).then(unwrap),
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', data).then(unwrap),
};

// ============================================================
// USERS
// ============================================================
export const usersService = {
  getAll: () =>
    api.get<ApiResponse<User[]>>('/users').then(unwrap),
  create: (data: CreateUserDto) =>
    api.post<ApiResponse<User>>('/users', data).then(unwrap),
  update: (id: number, data: UpdateUserDto) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data).then(unwrap),
};

// ============================================================
// PRODUCTS
// ============================================================
export const productsService = {
  getAll: (q?: PaginationQuery & { search?: string }) =>
    api.get<ApiResponse<PaginatedResult<Product>>>('/products', { params: q }).then(unwrap),
  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`).then(unwrap),
  create: (data: CreateProductDto) =>
    api.post<ApiResponse<Product>>('/products', data).then(unwrap),
  update: (id: number, data: UpdateProductDto) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Product>>(`/products/${id}`).then(unwrap),
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesService = {
  getAll: () =>
    api.get<ApiResponse<ProductCategory[]>>('/categories').then(unwrap),
  create: (data: CreateCategoryDto) =>
    api.post<ApiResponse<ProductCategory>>('/categories', data).then(unwrap),
  update: (id: number, data: UpdateCategoryDto) =>
    api.put<ApiResponse<ProductCategory>>(`/categories/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<ProductCategory>>(`/categories/${id}`).then(unwrap),
};

// ============================================================
// UNITS
// ============================================================
export const unitsService = {
  getAll: () =>
    api.get<ApiResponse<Unit[]>>('/units').then(unwrap),
  create: (data: CreateUnitDto) =>
    api.post<ApiResponse<Unit>>('/units', data).then(unwrap),
  update: (id: number, data: UpdateUnitDto) =>
    api.put<ApiResponse<Unit>>(`/units/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Unit>>(`/units/${id}`).then(unwrap),
};

// ============================================================
// SUPPLIERS
// ============================================================
export const suppliersService = {
  getAll: () =>
    api.get<ApiResponse<Supplier[]>>('/suppliers').then(unwrap),
  create: (data: CreateSupplierDto) =>
    api.post<ApiResponse<Supplier>>('/suppliers', data).then(unwrap),
  update: (id: number, data: UpdateSupplierDto) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Supplier>>(`/suppliers/${id}`).then(unwrap),
};

// ============================================================
// CUSTOMERS
// ============================================================
export const customersService = {
  getAll: () =>
    api.get<ApiResponse<Customer[]>>('/customers').then(unwrap),
  create: (data: CreateCustomerDto) =>
    api.post<ApiResponse<Customer>>('/customers', data).then(unwrap),
  update: (id: number, data: UpdateCustomerDto) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Customer>>(`/customers/${id}`).then(unwrap),
};

// ============================================================
// WAREHOUSES
// ============================================================
export const warehousesService = {
  getAll: () =>
    api.get<ApiResponse<Warehouse[]>>('/warehouses').then(unwrap),
  getById: (id: number) =>
    api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`).then(unwrap),
  create: (data: CreateWarehouseDto) =>
    api.post<ApiResponse<Warehouse>>('/warehouses', data).then(unwrap),
  update: (id: number, data: UpdateWarehouseDto) =>
    api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Warehouse>>(`/warehouses/${id}`).then(unwrap),
};

// ============================================================
// LOCATIONS
// ============================================================
export const locationsService = {
  getAll: (warehouseId?: number) =>
    api.get<ApiResponse<Location[]>>('/locations', { params: warehouseId ? { warehouseId } : {} }).then(unwrap),
  create: (data: CreateLocationDto) =>
    api.post<ApiResponse<Location>>('/locations', data).then(unwrap),
  update: (id: number, data: UpdateLocationDto) =>
    api.put<ApiResponse<Location>>(`/locations/${id}`, data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<Location>>(`/locations/${id}`).then(unwrap),
};

// ============================================================
// PURCHASE ORDERS
// ============================================================
export const purchaseOrdersService = {
  getAll: (q?: PaginationQuery & { status?: string }) =>
    api.get<ApiResponse<PaginatedResult<PurchaseOrder>>>('/purchase-orders', { params: q }).then(unwrap),
  getById: (id: number) =>
    api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`).then(unwrap),
  create: (data: CreatePurchaseOrderDto) =>
    api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/purchase-orders/${id}`).then(unwrap),
};

// ============================================================
// GOODS RECEIPTS
// ============================================================
export const goodsReceiptsService = {
  create: (data: CreateGoodsReceiptDto) =>
    api.post<ApiResponse<GoodsReceipt>>('/goods-receipts', data).then(unwrap),
};

// ============================================================
// SALES ORDERS
// ============================================================
export const salesOrdersService = {
  getAll: (q?: PaginationQuery & { status?: string }) =>
    api.get<ApiResponse<PaginatedResult<SalesOrder>>>('/sales-orders', { params: q }).then(unwrap),
  getById: (id: number) =>
    api.get<ApiResponse<SalesOrder>>(`/sales-orders/${id}`).then(unwrap),
  create: (data: CreateSalesOrderDto) =>
    api.post<ApiResponse<SalesOrder>>('/sales-orders', data).then(unwrap),
  delete: (id: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/sales-orders/${id}`).then(unwrap),
};

// ============================================================
// DELIVERY NOTES
// ============================================================
export const deliveryNotesService = {
  create: (data: CreateDeliveryNoteDto) =>
    api.post<ApiResponse<DeliveryNote>>('/delivery-notes', data).then(unwrap),
};

// ============================================================
// INVENTORY
// ============================================================
export const inventoryService = {
  getAll: (q?: InventoryQuery) =>
    api.get<ApiResponse<PaginatedResult<InventoryItem>>>('/inventory', { params: q }).then(unwrap),
  getByProduct: (productId: number) =>
    api.get<ApiResponse<InventoryProductSummary>>(`/inventory/${productId}`).then(unwrap),
  getTransactions: (q?: TransactionQuery) =>
    api.get<ApiResponse<PaginatedResult<InventoryTransaction>>>('/inventory/transactions', { params: q }).then(unwrap),
};
