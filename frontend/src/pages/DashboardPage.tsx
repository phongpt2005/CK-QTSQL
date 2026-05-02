import React from 'react';
import { Row, Col, Card, Typography, Table, Tag, Statistic, Space, Spin, Empty } from 'antd';
import {
  InboxOutlined, ImportOutlined, ExportOutlined, WarningOutlined,
  ShopOutlined, RiseOutlined, FallOutlined, SwapOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useInventory, useTransactions, usePurchaseOrders, useSalesOrders, useWarehouses } from '@/hooks/queries';
import dayjs from 'dayjs';
import numeral from 'numeral';

const { Title, Text } = Typography;

const CHART_COLORS = ['#4f6ef7', '#34c77b', '#f5a623', '#f25c5c', '#3db8ed', '#a855f7'];

export default function DashboardPage() {
  const { data: invData, isLoading: invLoading } = useInventory({ limit: 200 }, true);
  const { data: txData } = useTransactions({ limit: 10 });
  const { data: poData } = usePurchaseOrders({ limit: 5 });
  const { data: soData } = useSalesOrders({ limit: 5 });
  const { data: warehouses } = useWarehouses();

  const inventoryItems = invData?.data ?? [];
  const totalStock = inventoryItems.reduce((s, i) => s + i.quantity, 0);
  const lowStockItems = inventoryItems.filter((i) => i.quantity > 0 && i.quantity <= 10);
  const outOfStockItems = inventoryItems.filter((i) => i.quantity === 0);

  // Warehouse distribution for pie chart
  const warehouseMap = new Map<string, number>();
  inventoryItems.forEach((item) => {
    const name = item.warehouse?.warehouseName ?? 'Chưa xác định';
    warehouseMap.set(name, (warehouseMap.get(name) ?? 0) + item.quantity);
  });
  const pieData = Array.from(warehouseMap.entries()).map(([name, value]) => ({ name, value }));

  // Inbound vs Outbound (from recent transactions)
  const transactions = txData?.data ?? [];
  const inboundQty = transactions.filter((t) => t.transactionType === 'IN').reduce((s, t) => s + Math.abs(t.quantity), 0);
  const outboundQty = transactions.filter((t) => t.transactionType === 'OUT').reduce((s, t) => s + Math.abs(t.quantity), 0);
  const barData = [
    { name: 'Nhập', value: inboundQty, fill: '#34c77b' },
    { name: 'Xuất', value: outboundQty, fill: '#f25c5c' },
  ];

  const txColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'transactionDate',
      key: 'date',
      render: (d: string) => dayjs(d).format('DD/MM/YY HH:mm'),
      width: 130,
    },
    {
      title: 'Loại',
      dataIndex: 'transactionType',
      key: 'type',
      width: 70,
      render: (t: string) => (
        <Tag color={t === 'IN' ? 'green' : 'red'} style={{ borderRadius: 8 }}>
          {t === 'IN' ? <ImportOutlined /> : <ExportOutlined />} {t}
        </Tag>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, r: typeof transactions[0]) => r.product?.productName ?? '—',
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'qty',
      width: 80,
      render: (q: number) => (
        <span style={{ color: q > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
          {q > 0 ? '+' : ''}{q}
        </span>
      ),
    },
    {
      title: 'Tham chiếu',
      key: 'ref',
      render: (_: unknown, r: typeof transactions[0]) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {r.referenceType}#{r.referenceId}
        </Text>
      ),
    },
  ];

  return (
    <div className="stagger-children">
      {/* ── Title ── */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <RiseOutlined style={{ color: 'var(--color-primary)' }} /> Dashboard
          </div>
          <div className="page-subtitle">Tổng quan hệ thống quản lý kho</div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card--primary">
            <Space direction="vertical" size={12}>
              <div className="stat-card__icon" style={{ background: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                <InboxOutlined />
              </div>
              <div>
                <div className="stat-card__value">{numeral(totalStock).format('0,0')}</div>
                <div className="stat-card__label">Tổng tồn kho</div>
              </div>
            </Space>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card--success">
            <Space direction="vertical" size={12}>
              <div className="stat-card__icon" style={{ background: 'var(--color-success-ghost)', color: 'var(--color-success)' }}>
                <ShopOutlined />
              </div>
              <div>
                <div className="stat-card__value">{warehouses?.length ?? 0}</div>
                <div className="stat-card__label">Số kho</div>
              </div>
            </Space>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card--warning">
            <Space direction="vertical" size={12}>
              <div className="stat-card__icon" style={{ background: 'var(--color-warning-ghost)', color: 'var(--color-warning)' }}>
                <WarningOutlined />
              </div>
              <div>
                <div className="stat-card__value">{lowStockItems.length}</div>
                <div className="stat-card__label">Sắp hết hàng</div>
              </div>
            </Space>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card--danger">
            <Space direction="vertical" size={12}>
              <div className="stat-card__icon" style={{ background: 'var(--color-danger-ghost)', color: 'var(--color-danger)' }}>
                <FallOutlined />
              </div>
              <div>
                <div className="stat-card__value">{outOfStockItems.length}</div>
                <div className="stat-card__label">Hết hàng</div>
              </div>
            </Space>
          </div>
        </Col>
      </Row>

      {/* ── Charts ── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <div className="content-card">
            <Title level={5} style={{ marginBottom: 20 }}>
              <SwapOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
              Nhập / Xuất gần đây
            </Title>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-out)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="content-card">
            <Title level={5} style={{ marginBottom: 20 }}>
              <ShopOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
              Phân bố theo kho
            </Title>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    strokeWidth={2}
                    stroke="var(--bg-card)"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <Empty description="Chưa có dữ liệu" />
            )}
          </div>
        </Col>
      </Row>

      {/* ── Recent Transactions + Low Stock ── */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <div className="content-card">
            <Title level={5} style={{ marginBottom: 16 }}>
              <SwapOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
              Giao dịch gần đây
            </Title>
            <Table
              dataSource={transactions}
              columns={txColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={!txData}
            />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="content-card">
            <Title level={5} style={{ marginBottom: 16 }}>
              <WarningOutlined style={{ marginRight: 8, color: 'var(--color-warning)' }} />
              Cảnh báo sắp hết hàng
            </Title>
            {lowStockItems.length > 0 ? (
              <div style={{ maxHeight: 320, overflow: 'auto' }}>
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      marginBottom: 8,
                      borderRadius: 10,
                      background: 'var(--bg-card)',
                      boxShadow: 'var(--shadow-out-sm)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {item.product?.productName}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.warehouse?.warehouseName} / {item.location?.locationCode}
                      </Text>
                    </div>
                    <Tag
                      color={item.quantity <= 5 ? 'red' : 'orange'}
                      style={{ borderRadius: 8, fontWeight: 600 }}
                    >
                      {item.quantity} còn lại
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Tất cả sản phẩm đủ hàng" />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
