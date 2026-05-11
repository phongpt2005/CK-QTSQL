import React, { useState } from 'react';
import { Table, Tag, Select, Typography, Space } from 'antd';
import { SwapOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { useTransactions, useWarehouses } from '@/hooks/queries';
import type { InventoryTransaction } from '@/types';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/common/PageHeader';

const { Text } = Typography;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [whFilter, setWhFilter] = useState<number | undefined>();
  const { data, isLoading } = useTransactions({ page, limit: 30, warehouseId: whFilter });
  const { data: warehouses } = useWarehouses();

  const columns = [
    {
      title: 'Thời gian', dataIndex: 'transactionDate', key: 'date', width: 160,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Loại', dataIndex: 'transactionType', key: 'type', width: 80,
      render: (t: string) => (
        <Tag color={t === 'IN' ? 'green' : 'red'} style={{ borderRadius: 8, minWidth: 50, textAlign: 'center' }}>
          {t === 'IN' ? <><ImportOutlined /> NHẬP</> : <><ExportOutlined /> XUẤT</>}
        </Tag>
      ),
    },
    {
      title: 'Sản phẩm', key: 'product',
      render: (_: unknown, r: InventoryTransaction) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.product?.productName ?? '—'}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.product?.productCode}</Text>
        </div>
      ),
    },
    { title: 'Kho', key: 'wh', render: (_: unknown, r: InventoryTransaction) => r.warehouse?.warehouseName ?? '—' },
    {
      title: 'Số lượng', dataIndex: 'quantity', key: 'qty', width: 100, align: 'right' as const,
      render: (q: number) => (
        <span style={{ color: q > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700, fontSize: 15 }}>
          {q > 0 ? '+' : ''}{q}
        </span>
      ),
    },
    {
      title: 'Tham chiếu', key: 'ref', width: 180,
      render: (_: unknown, r: InventoryTransaction) => (
        <Tag style={{ borderRadius: 8 }}>{r.referenceType} #{r.referenceId}</Tag>
      ),
    },
    {
      title: 'Ghi chú', dataIndex: 'note', key: 'note', ellipsis: true,
      render: (v: string | null) => <Text type="secondary" style={{ fontSize: 12 }}>{v ?? '—'}</Text>,
    },
  ];

  return (
    <div className="stagger-children">
      <PageHeader 
        title="Lịch sử giao dịch" 
        subtitle="Theo dõi tất cả biến động nhập/xuất tồn kho theo thời gian thực"
      />
      <div className="filter-bar">
        <Select placeholder="Lọc theo kho" allowClear style={{ width: 240 }} onChange={(v) => { setWhFilter(v); setPage(1); }}
          options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
      </div>
      <div className="content-card">
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ current: page, pageSize: 30, total: data?.meta.total ?? 0, onChange: setPage, showTotal: (t) => `Tổng: ${t} giao dịch` }}
        />
      </div>
    </div>
  );
}
