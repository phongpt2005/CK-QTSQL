import React from 'react';
import { Row, Col, Typography, Table, Tag, Button } from 'antd';
import {
  InboxOutlined, WarningOutlined, ShopOutlined,
  CalendarOutlined, FilterOutlined, ExclamationCircleOutlined,
  EllipsisOutlined, RiseOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useInventory, useTransactions, useWarehouses } from '@/hooks/queries';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { PageHeader } from '@/components/common/PageHeader';

const { Title, Text } = Typography;

const PIE_COLORS = ['#1e3a8a', '#06b6d4', '#e5e7eb', '#9ca3af'];

export default function DashboardPage() {
  const { data: invData } = useInventory({ limit: 200 }, true);
  const { data: txData } = useTransactions({ limit: 8 });
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
  
  const pieDataRaw = Array.from(warehouseMap.entries()).map(([name, value]) => ({ name, value }));
  const pieData = pieDataRaw.sort((a, b) => b.value - a.value).slice(0, 4); // Top 4
  const totalPieValue = pieData.reduce((acc, curr) => acc + curr.value, 0);

  // Fake bar data to match screenshot's blue/cyan alternating bars
  const barData = [
    { name: 'T2', val1: 400, val2: 240 },
    { name: 'T3', val1: 300, val2: 139 },
    { name: 'T4', val1: 200, val2: 980 },
    { name: 'T5', val1: 278, val2: 390 },
    { name: 'T6', val1: 189, val2: 480 },
    { name: 'T7', val1: 239, val2: 380 },
    { name: 'CN', val1: 349, val2: 430 },
  ];

  const transactions = txData?.data ?? [];

  const txColumns = [
    {
      title: 'THỜI GIAN',
      dataIndex: 'transactionDate',
      key: 'date',
      render: (d: string) => dayjs(d).format('hh:mm A'),
      width: 100,
    },
    {
      title: 'LOẠI',
      dataIndex: 'transactionType',
      key: 'type',
      width: 100,
      render: (t: string) => (
        <span
          style={{
            background: t === 'IN' ? '#d1fae5' : '#dbeafe',
            color: t === 'IN' ? '#047857' : '#1d4ed8',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {t === 'IN' ? 'In (Nhập)' : 'Out (Xuất)'}
        </span>
      ),
    },
    {
      title: 'SẢN PHẨM',
      key: 'product',
      render: (_: unknown, r: typeof transactions[0]) => (
        <span style={{ fontWeight: 500, color: '#111827' }}>
          {r.product?.productName ?? '—'}
        </span>
      ),
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'quantity',
      key: 'qty',
      width: 100,
      align: 'right' as const,
      render: (q: number) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>
          {q > 0 ? `+${q}` : q}
        </span>
      ),
    },
    {
      title: 'MÃ THAM CHIẾU',
      key: 'ref',
      align: 'right' as const,
      render: (_: unknown, r: typeof transactions[0]) => (
        <span style={{ color: '#6b7280' }}>
          #{r.referenceType}-{r.referenceId}
        </span>
      ),
    },
  ];

  return (
    <div className="stagger-children">
      <PageHeader 
        title="Tổng quan" 
        subtitle="Trạng thái kho hàng và logistics thời gian thực" 
      />

      {/* ── Stat Cards ── */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="content-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tổng tồn kho
              </div>
              <div style={{ background: '#eff6ff', color: '#1e3a8a', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InboxOutlined />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1 }}>
              {numeral(totalStock).format('0,0')}
            </div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>
              Trên {warehouses?.length || 0} khu vực
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="content-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Kho hàng
              </div>
              <div style={{ background: '#eff6ff', color: '#1e3a8a', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShopOutlined />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1 }}>
              {warehouses?.length ?? 0}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Đang hoạt động
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="content-card" style={{ padding: 20, borderTop: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cảnh báo tồn kho thấp
              </div>
              <div style={{ background: '#fef3c7', color: '#d97706', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningOutlined />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#d97706', marginBottom: 4, lineHeight: 1 }}>
              {lowStockItems.length}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Cần chú ý
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="content-card" style={{ padding: 20, borderTop: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hết hàng
              </div>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExclamationCircleOutlined />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#dc2626', marginBottom: 4, lineHeight: 1 }}>
              {outOfStockItems.length}
            </div>
            <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
              <RiseOutlined /> +2 kể từ hôm qua
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Charts ── */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <div className="content-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Lưu lượng giao dịch
              </Title>
              <EllipsisOutlined style={{ fontSize: 24, color: '#9ca3af', cursor: 'pointer' }} />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={36} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="val1" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="val2" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div className="content-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Phân bổ kho hàng
              </Title>
            </div>
            
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'Trống', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner Text */}
              <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                  {warehouses?.length || 0}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '1px', marginTop: 4 }}>
                  KHU VỰC
                </div>
              </div>
            </div>

            {/* Custom Legend */}
            <div style={{ marginTop: 24 }}>
              {pieData.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{entry.name}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4b5563' }}>
                    {totalPieValue > 0 ? ((entry.value / totalPieValue) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </Col>
      </Row>

      {/* ── Bottom Row ── */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Giao dịch gần đây</Title>
              <a href="#" style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 500 }}>Xem tất cả</a>
            </div>
            <Table
              dataSource={transactions}
              columns={txColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              loading={!txData}
              style={{ border: 'none' }}
            />
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <div className="content-card" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 20 }}>
              <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Tồn kho thấp</Title>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: '#fef3c7', color: '#d97706', width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WarningOutlined />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.product?.productName}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {item.warehouse?.warehouseName} • {item.location?.locationCode}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#d97706', lineHeight: 1 }}>{item.quantity}</div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Còn lại</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Tất cả sản phẩm đủ hàng</div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
