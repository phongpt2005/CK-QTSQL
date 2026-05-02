import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsService, categoriesService, unitsService,
  suppliersService, customersService, warehousesService,
  locationsService, purchaseOrdersService, goodsReceiptsService,
  salesOrdersService, deliveryNotesService, inventoryService,
  usersService,
} from '@/services';
import type {
  PaginationQuery, CreateProductDto, UpdateProductDto,
  CreateCategoryDto, UpdateCategoryDto, CreateUnitDto, UpdateUnitDto,
  CreateSupplierDto, UpdateSupplierDto, CreateCustomerDto, UpdateCustomerDto,
  CreateWarehouseDto, UpdateWarehouseDto, CreateLocationDto, UpdateLocationDto,
  CreatePurchaseOrderDto, CreateGoodsReceiptDto,
  CreateSalesOrderDto, CreateDeliveryNoteDto,
  InventoryQuery, TransactionQuery,
  CreateUserDto, UpdateUserDto,
} from '@/types';
import { message } from 'antd';

// ── QUERY KEYS ──
export const QK = {
  products: 'products',
  categories: 'categories',
  units: 'units',
  suppliers: 'suppliers',
  customers: 'customers',
  warehouses: 'warehouses',
  locations: 'locations',
  purchaseOrders: 'purchaseOrders',
  salesOrders: 'salesOrders',
  inventory: 'inventory',
  inventoryProduct: 'inventoryProduct',
  transactions: 'transactions',
  users: 'users',
} as const;

// ============================================================
// PRODUCTS
// ============================================================
export function useProducts(q?: PaginationQuery & { search?: string }) {
  return useQuery({
    queryKey: [QK.products, q],
    queryFn: () => productsService.getAll(q),
    staleTime: 30_000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [QK.products, id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.products] });
      message.success('Tạo sản phẩm thành công');
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) => productsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.products] });
      message.success('Cập nhật sản phẩm thành công');
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.products] });
      message.success('Xóa sản phẩm thành công');
    },
  });
}

// ============================================================
// CATEGORIES
// ============================================================
export function useCategories() {
  return useQuery({ queryKey: [QK.categories], queryFn: categoriesService.getAll, staleTime: 60_000 });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.categories] }); message.success('Tạo danh mục thành công'); },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) => categoriesService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.categories] }); message.success('Cập nhật danh mục thành công'); },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.categories] }); message.success('Xóa danh mục thành công'); },
  });
}

// ============================================================
// UNITS
// ============================================================
export function useUnits() {
  return useQuery({ queryKey: [QK.units], queryFn: unitsService.getAll, staleTime: 60_000 });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUnitDto) => unitsService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.units] }); message.success('Tạo đơn vị thành công'); },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitDto }) => unitsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.units] }); message.success('Cập nhật đơn vị thành công'); },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unitsService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.units] }); message.success('Xóa đơn vị thành công'); },
  });
}

// ============================================================
// SUPPLIERS
// ============================================================
export function useSuppliers() {
  return useQuery({ queryKey: [QK.suppliers], queryFn: suppliersService.getAll, staleTime: 30_000 });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierDto) => suppliersService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.suppliers] }); message.success('Tạo nhà cung cấp thành công'); },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) => suppliersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.suppliers] }); message.success('Cập nhật nhà cung cấp thành công'); },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.suppliers] }); message.success('Xóa nhà cung cấp thành công'); },
  });
}

// ============================================================
// CUSTOMERS
// ============================================================
export function useCustomers() {
  return useQuery({ queryKey: [QK.customers], queryFn: customersService.getAll, staleTime: 30_000 });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.customers] }); message.success('Tạo khách hàng thành công'); },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerDto }) => customersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.customers] }); message.success('Cập nhật khách hàng thành công'); },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.customers] }); message.success('Xóa khách hàng thành công'); },
  });
}

// ============================================================
// WAREHOUSES
// ============================================================
export function useWarehouses() {
  return useQuery({ queryKey: [QK.warehouses], queryFn: warehousesService.getAll, staleTime: 60_000 });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseDto) => warehousesService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.warehouses] }); message.success('Tạo kho thành công'); },
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseDto }) => warehousesService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.warehouses] }); message.success('Cập nhật kho thành công'); },
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => warehousesService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.warehouses] }); message.success('Xóa kho thành công'); },
  });
}

// ============================================================
// LOCATIONS
// ============================================================
export function useLocations(warehouseId?: number) {
  return useQuery({
    queryKey: [QK.locations, warehouseId],
    queryFn: () => locationsService.getAll(warehouseId),
    staleTime: 30_000,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationDto) => locationsService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.locations] }); message.success('Tạo vị trí thành công'); },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationDto }) => locationsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.locations] }); message.success('Cập nhật vị trí thành công'); },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => locationsService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.locations] }); message.success('Xóa vị trí thành công'); },
  });
}

// ============================================================
// PURCHASE ORDERS
// ============================================================
export function usePurchaseOrders(q?: PaginationQuery & { status?: string }) {
  return useQuery({
    queryKey: [QK.purchaseOrders, q],
    queryFn: () => purchaseOrdersService.getAll(q),
    staleTime: 15_000,
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: [QK.purchaseOrders, id],
    queryFn: () => purchaseOrdersService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) => purchaseOrdersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] });
      message.success('Tạo đơn nhập hàng thành công');
    },
  });
}

export function useCreateGoodsReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoodsReceiptDto) => goodsReceiptsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.purchaseOrders] });
      qc.invalidateQueries({ queryKey: [QK.inventory] });
      qc.invalidateQueries({ queryKey: [QK.transactions] });
      message.success('Nhập kho thành công – Tồn kho đã cập nhật');
    },
  });
}

// ============================================================
// SALES ORDERS
// ============================================================
export function useSalesOrders(q?: PaginationQuery & { status?: string }) {
  return useQuery({
    queryKey: [QK.salesOrders, q],
    queryFn: () => salesOrdersService.getAll(q),
    staleTime: 15_000,
  });
}

export function useSalesOrder(id: number) {
  return useQuery({
    queryKey: [QK.salesOrders, id],
    queryFn: () => salesOrdersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalesOrderDto) => salesOrdersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.salesOrders] });
      qc.invalidateQueries({ queryKey: [QK.inventory] });
      message.success('Tạo đơn xuất hàng thành công – Hàng đã được giữ');
    },
  });
}

export function useCreateDeliveryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliveryNoteDto) => deliveryNotesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.salesOrders] });
      qc.invalidateQueries({ queryKey: [QK.inventory] });
      qc.invalidateQueries({ queryKey: [QK.transactions] });
      message.success('Xuất kho thành công – Tồn kho đã cập nhật');
    },
  });
}

// ============================================================
// INVENTORY (with polling for real-time)
// ============================================================
export function useInventory(q?: InventoryQuery, polling = false) {
  return useQuery({
    queryKey: [QK.inventory, q],
    queryFn: () => inventoryService.getAll(q),
    staleTime: 10_000,
    refetchInterval: polling ? 15_000 : false,
  });
}

export function useInventoryByProduct(productId: number) {
  return useQuery({
    queryKey: [QK.inventoryProduct, productId],
    queryFn: () => inventoryService.getByProduct(productId),
    enabled: !!productId,
    staleTime: 5_000,
  });
}

export function useTransactions(q?: TransactionQuery) {
  return useQuery({
    queryKey: [QK.transactions, q],
    queryFn: () => inventoryService.getTransactions(q),
    staleTime: 10_000,
  });
}

// ============================================================
// USERS
// ============================================================
export function useUsers() {
  return useQuery({ queryKey: [QK.users], queryFn: usersService.getAll });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.users] }); message.success('Tạo người dùng thành công'); },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => usersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QK.users] }); message.success('Cập nhật người dùng thành công'); },
  });
}
