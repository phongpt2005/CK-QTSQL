import React, { useState } from 'react';
import { Table, Select, Tag, Typography, Row, Col, Space, Tooltip } from 'antd';
import { InboxOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useInventory, useWarehouses } from '@/hooks/queries';
import type { InventoryItem } from '@/types';
import numeral from 'numeral';

const { Title, Text } = Typography;

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [whFilter, setWhFilter] = useState<number | undefined>();
  const { data, isLoading, dataUpdatedAt } = useInventory({ page, limit: 50, warehouseId: whFilter }, true);
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
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><InboxOutlined style={{ color: 'var(--color-primary)' }} /> Tồn kho</div>
          <div className="page-subtitle">
            Tổng tồn: <strong>{numeral(totalStock).format('0,0')}</strong>
            &nbsp;·&nbsp;
            <Text type="secondary" style={{ fontSize: 11 }}>
              Cập nhật: {new Date(dataUpdatedAt).toLocaleTimeString('vi-VN')}
            </Text>
            &nbsp;
            <Tag color="blue" style={{ borderRadius: 8, fontSize: 10, verticalAlign: 'middle' }}>LIVE</Tag>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <Select placeholder="Lọc theo kho" allowClear style={{ width: 240 }} onChange={(v) => { setWhFilter(v); setPage(1); }}
          options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
      </div>

      <div className="content-card">
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ current: page, pageSize: 50, total: data?.meta.total ?? 0, onChange: setPage, showTotal: (t) => `Tổng: ${t} dòng` }}
          size="middle"
        />
      </div>
    </div>
  );
}
