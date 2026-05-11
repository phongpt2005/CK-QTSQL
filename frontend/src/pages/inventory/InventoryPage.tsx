import React, { useState } from 'react';
import { Table, Select, Tag, Typography, Tooltip, Space, Tabs, Alert, Spin } from 'antd';
import { InboxOutlined, WarningOutlined, InfoCircleOutlined, EyeOutlined, BarChartOutlined } from '@ant-design/icons';
import { useInventory, useWarehouses } from '@/hooks/queries';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { InventoryItem } from '@/types';
import numeral from 'numeral';
import { PageHeader } from '@/components/common/PageHeader';

const { Text } = Typography;

// ── Tab 1: Tồn kho chi tiết (giữ nguyên logic gốc) ──
function InventoryDetailTab() {
  const [page, setPage] = useState(1);
  const [whFilter, setWhFilter] = useState<number | undefined>();
  const { data, isLoading } = useInventory({ page, limit: 50, warehouseId: whFilter }, true);
  const { data: warehouses } = useWarehouses();

  const items = data?.data ?? [];
  const totalStock = items.reduce((s, i) => s + i.quantity, 0);

  const columns = [
    {
      title: 'Sản phẩm', key: 'product', width: 220,
      render: (_: unknown, r: InventoryItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.product?.productName}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.product?.productCode}</Text>
        </div>
      ),
    },
    { title: 'Kho', key: 'wh', render: (_: unknown, r: InventoryItem) => r.warehouse?.warehouseName ?? '—' },
    {
      title: 'Vị trí', key: 'loc',
      render: (_: unknown, r: InventoryItem) => <Tag color="purple" style={{ borderRadius: 8 }}>{r.location?.locationCode ?? '—'}</Tag>,
    },
    {
      title: (
        <Tooltip title="Tổng số lượng trong kho">
          <Space size={4}>Tổng tồn <InfoCircleOutlined /></Space>
        </Tooltip>
      ),
      dataIndex: 'quantity', key: 'qty', align: 'right' as const, width: 100,
      render: (v: number) => <span style={{ fontWeight: 700, fontSize: 15 }}>{numeral(v).format('0,0')}</span>,
    },
    {
      title: (
        <Tooltip title="Số lượng đã giữ cho đơn xuất">
          <Space size={4}>Đã giữ <InfoCircleOutlined /></Space>
        </Tooltip>
      ),
      dataIndex: 'reservedQty', key: 'reserved', align: 'right' as const, width: 100,
      render: (v: number | undefined) => (
        <span className="qty-reserved">{v ? numeral(v).format('0,0') : '0'}</span>
      ),
    },
    {
      title: (
        <Tooltip title="Khả dụng = Tổng tồn - Đã giữ">
          <Space size={4}>Khả dụng <InfoCircleOutlined /></Space>
        </Tooltip>
      ),
      dataIndex: 'availableQty', key: 'available', align: 'right' as const, width: 110,
      render: (v: number | undefined, r: InventoryItem) => {
        const avail = v ?? r.quantity;
        let cls = 'qty-available';
        if (avail === 0) cls = 'qty-zero';
        else if (avail <= 10) cls = 'qty-danger';
        return <span className={cls}>{numeral(avail).format('0,0')}</span>;
      },
    },
    {
      title: 'Trạng thái', key: 'status', width: 120,
      render: (_: unknown, r: InventoryItem) => {
        const avail = r.availableQty ?? r.quantity;
        if (avail === 0) return <Tag color="red" style={{ borderRadius: 8 }}><WarningOutlined /> Hết hàng</Tag>;
        if (avail <= 10) return <Tag color="orange" style={{ borderRadius: 8 }}><WarningOutlined /> Sắp hết</Tag>;
        return <Tag color="green" style={{ borderRadius: 8 }}>Đủ hàng</Tag>;
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select placeholder="Lọc theo kho" allowClear style={{ width: 240 }} onChange={(v) => { setWhFilter(v); setPage(1); }}
          options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
        <Text type="secondary">Tổng: {numeral(totalStock).format('0,0')} sản phẩm</Text>
      </div>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ current: page, pageSize: 50, total: data?.meta.total ?? 0, onChange: setPage, showTotal: (t) => `Tổng: ${t} dòng` }}
        size="middle"
      />
    </>
  );
}

// ── Tab 2: Báo cáo từ Database View ──
function ViewReportTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory_report_view'],
    queryFn: async () => {
      const res = await api.get('/inventory/report/view');
      // Handle both wrapped {data: [...]} and raw array responses
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30_000,
  });

  const columns = [
    { title: 'Mã SP', dataIndex: 'ProductCode', key: 'code', width: 140,
      render: (v: string) => <Tag color="blue" style={{ borderRadius: 6 }}>{v}</Tag> },
    { title: 'Tên sản phẩm', dataIndex: 'ProductName', key: 'name' },
    { title: 'Kho', dataIndex: 'WarehouseName', key: 'wh' },
    { title: 'Vị trí', dataIndex: 'LocationCode', key: 'loc',
      render: (v: string) => <Tag color="purple" style={{ borderRadius: 6 }}>{v}</Tag> },
    { title: 'Số lượng', dataIndex: 'Quantity', key: 'qty', align: 'right' as const, width: 120,
      render: (v: number) => <span style={{ fontWeight: 700, fontSize: 15 }}>{numeral(Number(v)).format('0,0')}</span> },
  ];

  return (
    <>
      <Alert
        message="Báo cáo từ Database View (InventoryReportView)"
        description="Dữ liệu được truy vấn trực tiếp từ View đã tạo sẵn trong MySQL. View này JOIN 4 bảng (Inventory, Products, Warehouses, Locations) ở tầng Database Engine, giúp phản hồi nhanh hơn so với ORM truyền thống."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      {isError ? (
        <Alert
          message="Chưa tạo View trong MySQL"
          description="Bạn cần chạy file sql/02_create_views.sql trong MySQL Workbench trước khi sử dụng báo cáo này."
          type="warning"
          showIcon
        />
      ) : (
        <Table
          dataSource={data ?? []}
          columns={columns}
          rowKey={(_, idx) => `view-${idx}`}
          loading={isLoading}
          pagination={{ pageSize: 50, showTotal: (t) => `Tổng: ${t} dòng` }}
          size="middle"
        />
      )}
    </>
  );
}

// ── Tab 3: Báo cáo tổng hợp CTE ──
function CTEReportTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory_report_cte'],
    queryFn: async () => {
      const res = await api.get('/inventory/report/cte');
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 30_000,
  });

  // Calculate grand total for footer
  const grandTotal = (data ?? []).reduce((sum: number, row: any) => sum + Number(row.TotalQuantity || 0), 0);

  const columns = [
    { title: 'Mã SP', dataIndex: 'ProductCode', key: 'code', width: 160,
      render: (v: string) => <Tag color="geekblue" style={{ borderRadius: 6 }}>{v}</Tag> },
    { title: 'Tên sản phẩm', dataIndex: 'ProductName', key: 'name' },
    { title: 'Tổng tồn (Toàn hệ thống)', dataIndex: 'TotalQuantity', key: 'total', align: 'right' as const, width: 200,
      render: (v: number) => {
        const qty = Number(v);
        return (
          <span style={{ fontWeight: 700, fontSize: 15, color: qty === 0 ? '#ef4444' : qty <= 10 ? '#f59e0b' : '#10b981' }}>
            {numeral(qty).format('0,0')}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Alert
        message="Báo cáo tổng hợp bằng CTE (Common Table Expression)"
        description="Sử dụng kỹ thuật SQL nâng cao WITH clause để tổng hợp tồn kho theo từng sản phẩm trên toàn bộ các kho và vị trí. Phù hợp cho Kế toán kho và Quản lý tổng quan."
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      {isError ? (
        <Alert message="Không thể tải báo cáo CTE" type="error" showIcon />
      ) : (
        <>
          <Table
            dataSource={data ?? []}
            columns={columns}
            rowKey={(_, idx) => `cte-${idx}`}
            loading={isLoading}
            pagination={{ pageSize: 50, showTotal: (t) => `Tổng: ${t} sản phẩm` }}
            size="middle"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Tổng cộng toàn hệ thống</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text strong style={{ fontSize: 16, color: '#1e3a8a' }}>
                      {numeral(grandTotal).format('0,0')}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </>
      )}
    </>
  );
}

// ── Main Page ──
export default function InventoryPage() {
  return (
    <div className="stagger-children">
      <PageHeader
        title="Quản lý Tồn kho"
        subtitle="Theo dõi tồn kho chi tiết và báo cáo nâng cao từ Database"
      />

      <div className="content-card">
        <Tabs
          defaultActiveKey="detail"
          type="card"
          size="large"
          items={[
            {
              key: 'detail',
              label: <span><InboxOutlined style={{ marginRight: 6 }} />Tồn kho chi tiết</span>,
              children: <InventoryDetailTab />,
            },
            {
              key: 'view',
              label: <span><EyeOutlined style={{ marginRight: 6 }} />Báo cáo SQL View</span>,
              children: <ViewReportTab />,
            },
            {
              key: 'cte',
              label: <span><BarChartOutlined style={{ marginRight: 6 }} />Báo cáo Tổng hợp (CTE)</span>,
              children: <CTEReportTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}
