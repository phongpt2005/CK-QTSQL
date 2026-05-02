import React, { useState } from 'react';
import { Table, Button, Tag, Select, Typography, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EyeOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { salesOrdersService } from '@/services';
import { useSalesOrders } from '@/hooks/queries';
import type { SalesOrder } from '@/types';
import dayjs from 'dayjs';
import numeral from 'numeral';

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  Pending: { color: 'warning', label: 'Chờ xuất' },
  Approved: { color: 'processing', label: 'Đã duyệt' },
  Delivered: { color: 'success', label: 'Đã xuất' },
  Cancelled: { color: 'error', label: 'Đã hủy' },
};

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data, isLoading } = useSalesOrders({ page, limit: 20, status: statusFilter });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => salesOrdersService.delete(id),
    onSuccess: (res) => {
      message.success(res.message || 'Đã xóa đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Lỗi khi xóa đơn hàng');
    },
  });

  const columns = [
    {
      title: 'Mã đơn', dataIndex: 'soCode', key: 'code', width: 200,
      render: (v: string) => <Tag color="geekblue" style={{ borderRadius: 8, fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Khách hàng', key: 'customer',
      render: (_: unknown, r: SalesOrder) => r.customer?.name ?? '—',
    },
    {
      title: 'Ngày đặt', dataIndex: 'orderDate', key: 'date', width: 120,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'amount', width: 140, align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{numeral(v).format('0,0')}</span>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => {
        const s = statusMap[v] ?? { color: 'default', label: v };
        return <Tag color={s.color} style={{ borderRadius: 8 }}>{s.label}</Tag>;
      },
    },
    {
      title: 'Phiếu xuất', key: 'dn', width: 90, align: 'center' as const,
      render: (_: unknown, r: SalesOrder) => (
        <Tag style={{ borderRadius: 8 }}>{r._count?.deliveryNotes ?? 0}</Tag>
      ),
    },
    {
      title: '', key: 'act', width: 90, align: 'right' as const,
      render: (_: unknown, r: SalesOrder) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/sales-orders/${r.id}`)} />
          {r.status === 'Pending' && (
            <Popconfirm
              title="Xóa vĩnh viễn đơn hàng này?"
              onConfirm={() => deleteMutation.mutate(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><ExportOutlined style={{ color: 'var(--color-primary)' }} /> Đơn xuất hàng</div>
          <div className="page-subtitle">Sales Orders – Quản lý đơn bán hàng</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales-orders/new')}>Tạo đơn xuất</Button>
      </div>
      <div className="filter-bar">
        <Select placeholder="Lọc trạng thái" allowClear style={{ width: 200 }} onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
      </div>
      <div className="content-card">
        <Table dataSource={data?.data ?? []} columns={columns} rowKey="id" loading={isLoading}
          pagination={{ current: page, pageSize: 20, total: data?.meta.total ?? 0, onChange: setPage, showTotal: (t) => `Tổng: ${t} đơn` }} />
      </div>
    </div>
  );
}
