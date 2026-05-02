import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useAuthStore } from '@/store/auth.store';
import AppLayout from '@/components/layout/AppLayout';

// ── Lazy-loaded pages ──
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const CategoriesPage = lazy(() => import('@/pages/products/CategoriesPage'));
const UnitsPage = lazy(() => import('@/pages/products/UnitsPage'));
const SuppliersPage = lazy(() => import('@/pages/products/SuppliersPage'));
const CustomersPage = lazy(() => import('@/pages/products/CustomersPage'));
const WarehousesPage = lazy(() => import('@/pages/warehouse/WarehousesPage'));
const LocationsPage = lazy(() => import('@/pages/warehouse/LocationsPage'));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));
const TransactionsPage = lazy(() => import('@/pages/inventory/TransactionsPage'));
const PurchaseOrdersPage = lazy(() => import('@/pages/purchase/PurchaseOrdersPage'));
const CreatePurchaseOrderPage = lazy(() => import('@/pages/purchase/CreatePurchaseOrderPage'));
const PurchaseOrderDetailPage = lazy(() => import('@/pages/purchase/PurchaseOrderDetailPage'));
const SalesOrdersPage = lazy(() => import('@/pages/sales/SalesOrdersPage'));
const CreateSalesOrderPage = lazy(() => import('@/pages/sales/CreateSalesOrderPage'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales/SalesOrderDetailPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));

const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// ── Query Client with retry ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: true,
      staleTime: 15_000,
    },
    mutations: { retry: 1 },
  },
});

// ── Loading Fallback ──
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// ── Protected Route ──
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Admin Guard ──
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ── Ant Design Theme ──
const theme = {
  token: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorPrimary: '#4f6ef7',
    borderRadius: 12,
    colorBgContainer: '#e8edf2',
    colorBgLayout: '#e8edf2',
    colorBgElevated: '#e8edf2',
    controlHeight: 38,
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme} locale={viVN}>
        <AntApp>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected */}
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardPage />} />

                  {/* Products */}
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="units" element={<UnitsPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
                  <Route path="customers" element={<CustomersPage />} />

                  {/* Warehouse */}
                  <Route path="warehouses" element={<WarehousesPage />} />
                  <Route path="locations" element={<LocationsPage />} />

                  {/* Inventory */}
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />

                  {/* Purchase */}
                  <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="purchase-orders/new" element={<CreatePurchaseOrderPage />} />
                  <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />

                  {/* Sales */}
                  <Route path="sales-orders" element={<SalesOrdersPage />} />
                  <Route path="sales-orders/new" element={<CreateSalesOrderPage />} />
                  <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />

                  {/* Admin */}
                  <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
