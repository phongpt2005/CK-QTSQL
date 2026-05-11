import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Input, Button, Badge, Drawer, Select, List, Tag } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DashboardOutlined, ShoppingCartOutlined, ShopOutlined,
  InboxOutlined, ExportOutlined, ImportOutlined,
  AppstoreOutlined, TeamOutlined, UserOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  EnvironmentOutlined, SearchOutlined, BellOutlined,
  QuestionCircleOutlined, SettingOutlined, PlusOutlined,
  WarningOutlined, CheckCircleOutlined, InfoCircleOutlined, SyncOutlined, DatabaseOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import api from '@/services/api';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

interface Notification {
  id: string;
  type: 'import' | 'export' | 'transaction' | 'warning';
  title: string;
  description: string;
  time: string;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, language, setLanguage } = useUIStore();

  const [notifVisible, setNotifVisible] = React.useState(false);
  const [helpVisible, setHelpVisible] = React.useState(false);
  const [settingsVisible, setSettingsVisible] = React.useState(false);

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = React.useState<number>(() => {
    return parseInt(localStorage.getItem('wms_last_read_notif') || '0');
  });

  const isVi = language === 'vi';

  // ── FETCH NOTIFICATIONS ──
  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const items = response.data?.data ?? response.data;
      setNotifications(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    // Refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => new Date(n.time).getTime() > lastReadTimestamp).length;

  const markAllAsRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    localStorage.setItem('wms_last_read_notif', now.toString());
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return isVi ? 'Vừa xong' : 'Just now';
    if (diffMins < 60) return isVi ? `${diffMins} phút trước` : `${diffMins}m ago`;
    if (diffHours < 24) return isVi ? `${diffHours} giờ trước` : `${diffHours}h ago`;
    return isVi ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: isVi ? 'Bảng điều khiển' : 'Dashboard' },
    {
      key: 'products-group',
      icon: <AppstoreOutlined />,
      label: isVi ? 'Sản phẩm' : 'Products',
      children: [
        { key: '/products', label: isVi ? 'Danh sách SP' : 'Product List' },
        { key: '/categories', label: isVi ? 'Danh mục' : 'Categories' },
        { key: '/units', label: isVi ? 'Đơn vị tính' : 'Units' },
      ],
    },
    {
      key: 'partners-group',
      icon: <TeamOutlined />,
      label: isVi ? 'Đối tác' : 'Partners',
      children: [
        { key: '/suppliers', label: isVi ? 'Nhà cung cấp' : 'Suppliers' },
        { key: '/customers', label: isVi ? 'Khách hàng' : 'Customers' },
      ],
    },
    {
      key: 'warehouse-group',
      icon: <ShopOutlined />,
      label: isVi ? 'Kho bãi' : 'Warehouse',
      children: [
        { key: '/warehouses', label: isVi ? 'Danh sách kho' : 'Warehouses' },
        { key: '/locations', label: isVi ? 'Vị trí kho' : 'Locations' },
      ],
    },
    { key: '/inventory', icon: <InboxOutlined />, label: isVi ? 'Tồn kho' : 'Inventory' },
    {
      key: 'purchase-group',
      icon: <ImportOutlined />,
      label: isVi ? 'Nhập hàng' : 'Purchase',
      children: [
        { key: '/purchase-orders', label: isVi ? 'Đơn nhập' : 'Purchase Orders' },
        { key: '/purchase-orders/new', label: isVi ? 'Tạo đơn nhập' : 'Create PO' },
      ],
    },
    {
      key: 'sales-group',
      icon: <ExportOutlined />,
      label: isVi ? 'Xuất hàng' : 'Sales',
      children: [
        { key: '/sales-orders', label: isVi ? 'Đơn xuất' : 'Sales Orders' },
        { key: '/sales-orders/new', label: isVi ? 'Tạo đơn xuất' : 'Create SO' },
      ],
    },
    { key: '/transactions', icon: <ShoppingCartOutlined />, label: isVi ? 'Giao dịch' : 'Transactions' },
  ];

  const adminItems = [
    { key: '/users', icon: <UserOutlined />, label: isVi ? 'Người dùng' : 'Users' },
    { key: '/admin/support', icon: <QuestionCircleOutlined />, label: isVi ? 'Quản lý Hỗ trợ' : 'Support Admin' },
    { key: '/admin/architecture', icon: <DatabaseOutlined />, label: isVi ? 'Kiến trúc hệ thống' : 'System Architecture' },
  ];

  const allMenuItems = user?.role === 'Admin' ? [...menuItems, ...adminItems] : menuItems;

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: `${user?.username} (${user?.role})` },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
      {/* ── SIDEBAR ── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={260}
        collapsedWidth={80}
        style={{
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          borderRight: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme === 'dark' ? '#1e293b' : '#ffffff' }}>
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
              padding: '0 16px',
              flexShrink: 0,
            }}
          >
            <EnvironmentOutlined
              style={{ fontSize: 24, color: theme === 'dark' ? '#38bdf8' : '#1e3a8a' }}
            />
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: theme === 'dark' ? '#f8fafc' : '#1e3a8a',
                  letterSpacing: '-0.5px',
                  whiteSpace: 'nowrap',
                }}
              >
                WMS Pro
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Menu
              mode="inline"
              theme={theme}
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['products-group', 'warehouse-group', 'purchase-group', 'sales-group', 'partners-group']}
              items={allMenuItems}
              onClick={({ key }) => {
                if (!key.includes('-group')) navigate(key);
              }}
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                borderRight: 'none',
                background: 'transparent',
              }}
            />
          </div>

          {/* Footer actions on sidebar */}
          <div style={{ borderTop: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`, padding: '12px 0' }}>
            <Menu
              mode="inline"
              theme={theme}
              selectable={false}
              style={{ borderRight: 'none', background: 'transparent' }}
              items={[
                ...(user?.role?.toLowerCase() !== 'admin' ? [{ key: 'support', icon: <QuestionCircleOutlined />, label: language === 'vi' ? 'Hỗ trợ' : 'Support', onClick: () => navigate('/support') }] : []),
                { key: 'logout', icon: <LogoutOutlined />, label: language === 'vi' ? 'Đăng xuất' : 'Logout', onClick: logout },
              ]}
            />
          </div>
        </div>
      </Sider>

      {/* ── MAIN ── */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 260,
          transition: 'margin-left 0.25s ease',
          background: theme === 'dark' ? '#0f172a' : '#f8fafc',
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 90,
            borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div
              onClick={toggleSidebar}
              style={{ fontSize: 18, cursor: 'pointer', color: theme === 'dark' ? '#f8fafc' : '#4b5563' }}
            >
              {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={unreadCount} size="small">
              <BellOutlined
                style={{ fontSize: 18, color: theme === 'dark' ? '#f8fafc' : '#111827', cursor: 'pointer' }}
                onClick={() => setNotifVisible(true)}
              />
            </Badge>
            <QuestionCircleOutlined
              style={{ fontSize: 18, color: theme === 'dark' ? '#f8fafc' : '#111827', cursor: 'pointer' }}
              onClick={() => setHelpVisible(true)}
            />
            <SettingOutlined
              style={{ fontSize: 18, color: theme === 'dark' ? '#f8fafc' : '#111827', cursor: 'pointer' }}
              onClick={() => setSettingsVisible(true)}
            />

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} trigger={['click']}>
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', border: '2px solid #e5e7eb', background: '#38bdf8', color: '#fff' }}
              />
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="animate-fadeInUp" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
            <span>{isVi ? 'Thông báo hệ thống' : 'System Notifications'}</span>
            <Button
              type="link"
              size="small"
              style={{ fontSize: 12 }}
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              {isVi ? 'Đánh dấu đã đọc' : 'Mark all as read'}
            </Button>
          </div>
        }
        placement="right"
        onClose={() => setNotifVisible(false)}
        open={notifVisible}
        width={380}
        styles={{ body: { padding: 0 } }}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          loading={loading}
          renderItem={(item) => {
            const isUnread = new Date(item.time).getTime() > lastReadTimestamp;
            let icon = <InfoCircleOutlined style={{ color: '#38bdf8' }} />;
            let color = 'blue';
            if (item.type === 'import') { icon = <ImportOutlined style={{ color: '#10b981' }} />; color = 'green'; }
            if (item.type === 'export') { icon = <ExportOutlined style={{ color: '#3b82f6' }} />; color = 'blue'; }
            if (item.type === 'transaction') { icon = <SyncOutlined style={{ color: '#8b5cf6' }} />; color = 'purple'; }
            if (item.type === 'warning') { icon = <WarningOutlined style={{ color: '#f59e0b' }} />; color = 'warning'; }

            return (
              <List.Item
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  background: isUnread ? (theme === 'dark' ? '#1e293b' : '#f0f9ff') : 'transparent',
                  borderLeft: isUnread ? '4px solid #38bdf8' : '4px solid transparent',
                  transition: 'all 0.3s'
                }}
                onClick={() => {
                  if (item.type === 'import') navigate('/purchase-orders');
                  if (item.type === 'export') navigate('/sales-orders');
                  if (item.type === 'transaction') navigate('/transactions');
                  setNotifVisible(false);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={icon}
                      style={{
                        backgroundColor: theme === 'dark' ? '#334155' : '#f3f4f6',
                        color: 'inherit'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong={isUnread}>{item.title}</Text>
                      <Tag color={color} style={{ fontSize: 10, margin: 0 }}>{item.type.toUpperCase()}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 13, color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                        {item.description}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(item.time)}</Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
        {notifications.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: 80, color: '#9ca3af' }}>
            <BellOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
            <p>{isVi ? 'Chưa có dữ liệu thông báo nào.' : 'No notification data available.'}</p>
          </div>
        )}
      </Drawer>

      <Drawer
        title="Trợ giúp & Tài liệu"
        placement="right"
        onClose={() => setHelpVisible(false)}
        open={helpVisible}
        width={350}
      >
        <div style={{ padding: '0 8px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Liên hệ hỗ trợ</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Nếu gặp trục trặc kỹ thuật, vui lòng gửi ticket qua mục "Hỗ trợ" hoặc liên hệ Hotline: 1900 xxxx.</p>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Tài liệu nhanh</h3>
          <ul style={{ paddingLeft: 20, color: '#1e3a8a' }}>
            <li style={{ marginBottom: 8 }}><a href="#">Hướng dẫn nhập kho</a></li>
            <li style={{ marginBottom: 8 }}><a href="#">Quy trình xuất hàng</a></li>
            <li style={{ marginBottom: 8 }}><a href="#">Quản lý sơ đồ kho</a></li>
          </ul>
        </div>
      </Drawer>

      <Drawer
        title="Cài đặt hệ thống"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={350}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ngôn ngữ</div>
            <Select
              value={language}
              style={{ width: '100%' }}
              onChange={(v) => setLanguage(v as 'vi' | 'en')}
            >
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Chế độ hiển thị</div>
            <Select
              value={theme}
              style={{ width: '100%' }}
              onChange={(v) => setTheme(v as 'light' | 'dark')}
            >
              <Select.Option value="light">Sáng (Mặc định)</Select.Option>
              <Select.Option value="dark">Tối (Dark Mode)</Select.Option>
            </Select>
          </div>
        </div>
      </Drawer>
      </Layout>
    </>
  );
}
