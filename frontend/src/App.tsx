import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, App as AntApp, Result, Button } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import AppLayout from '@/components/layout/AppLayout';
import { theme as antdTheme } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';

// ── Lazy-loaded pages ──
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
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
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const AdminSupportTicketsPage = lazy(() => import('@/pages/admin/AdminSupportTicketsPage'));
const AdminArchitecturePage = lazy(() => import('@/pages/admin/AdminArchitecturePage'));

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
    <Spin size="large" />
  </div>
);

// ── Error Fallback ──
function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Result
        status="error"
        title="Đã xảy ra lỗi"
        subTitle={error.message}
        extra={[
          <Button type="primary" key="retry" onClick={resetErrorBoundary}>Thử lại</Button>,
          <Button key="home" onClick={() => window.location.href = '/login'}>Về trang đăng nhập</Button>,
        ]}
      />
    </div>
  );
}

// ── Protected Route ──
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// ── Admin Guard ──
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { theme: currentTheme, language } = useUIStore();

  const themeConfig = {
    algorithm: currentTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      colorPrimary: '#1e3a8a',
      borderRadius: 12,
      controlHeight: 38,
    },
  };

  const locale = language === 'vi' ? viVN : enUS;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig} locale={locale}>
        <AntApp>
          <BrowserRouter>
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
                    <Route path="admin/support" element={<AdminRoute><AdminSupportTicketsPage /></AdminRoute>} />
                    <Route path="admin/architecture" element={<AdminRoute><AdminArchitecturePage /></AdminRoute>} />

                    {/* Support */}
                    <Route path="support" element={<SupportPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
