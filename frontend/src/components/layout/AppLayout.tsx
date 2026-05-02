import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DashboardOutlined, ShoppingCartOutlined, ShopOutlined,
  InboxOutlined, ExportOutlined, ImportOutlined,
  AppstoreOutlined, TeamOutlined, UserOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'products-group',
    icon: <AppstoreOutlined />,
    label: 'Sản phẩm',
    children: [
      { key: '/products', label: 'Danh sách SP' },
      { key: '/categories', label: 'Danh mục' },
      { key: '/units', label: 'Đơn vị tính' },
    ],
  },
  {
    key: 'partners-group',
    icon: <TeamOutlined />,
    label: 'Đối tác',
    children: [
      { key: '/suppliers', label: 'Nhà cung cấp' },
      { key: '/customers', label: 'Khách hàng' },
    ],
  },
  {
    key: 'warehouse-group',
    icon: <ShopOutlined />,
    label: 'Kho bãi',
    children: [
      { key: '/warehouses', label: 'Danh sách kho' },
      { key: '/locations', label: 'Vị trí kho' },
    ],
  },
  { key: '/inventory', icon: <InboxOutlined />, label: 'Tồn kho' },
  {
    key: 'purchase-group',
    icon: <ImportOutlined />,
    label: 'Nhập hàng',
    children: [
      { key: '/purchase-orders', label: 'Đơn nhập' },
      { key: '/purchase-orders/new', label: 'Tạo đơn nhập' },
    ],
  },
  {
    key: 'sales-group',
    icon: <ExportOutlined />,
    label: 'Xuất hàng',
    children: [
      { key: '/sales-orders', label: 'Đơn xuất' },
      { key: '/sales-orders/new', label: 'Tạo đơn xuất' },
    ],
  },
  { key: '/transactions', icon: <ShoppingCartOutlined />, label: 'Giao dịch' },
];

const adminItems = [
  { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const allMenuItems = user?.role === 'Admin' ? [...menuItems, ...adminItems] : menuItems;

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean).slice(0, 1).join('/') || '/';

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
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── SIDEBAR ── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={260}
        collapsedWidth={80}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid rgba(163, 177, 198, 0.15)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderBottom: '1px solid rgba(163, 177, 198, 0.15)',
            padding: '0 16px',
          }}
        >
          <EnvironmentOutlined
            style={{ fontSize: 24, color: 'var(--color-primary)' }}
          />
          {!sidebarCollapsed && (
            <Text
              strong
              style={{
                fontSize: 18,
                color: 'var(--color-primary)',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              WMS Pro
            </Text>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['products-group', 'warehouse-group', 'purchase-group', 'sales-group', 'partners-group']}
          items={allMenuItems}
          onClick={({ key }) => {
            if (!key.includes('-group')) navigate(key);
          }}
          style={{
            marginTop: 8,
            borderRight: 'none',
          }}
        />
      </Sider>

      {/* ── MAIN ── */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 80 : 260,
          transition: 'margin-left 0.25s ease',
          background: 'var(--bg-primary)',
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-out-sm)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 90,
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            onClick={toggleSidebar}
            style={{
              fontSize: 18,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: 12,
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-out-sm)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <Avatar
                style={{
                  background: 'linear-gradient(145deg, var(--color-primary-light), var(--color-primary))',
                }}
                icon={<UserOutlined />}
                size={32}
              />
              {!sidebarCollapsed && (
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                    {user?.username}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="animate-fadeInUp">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
