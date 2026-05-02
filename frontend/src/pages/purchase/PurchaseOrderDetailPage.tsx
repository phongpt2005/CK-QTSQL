import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Table, Tag, Button, Modal, Form, DatePicker, Input, InputNumber, Select, Space, Typography, Spin, Divider, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ImportOutlined } from '@ant-design/icons';
import { usePurchaseOrder, useCreateGoodsReceipt, useLocations } from '@/hooks/queries';
import type { GoodsReceiptItemDto } from '@/types';
import dayjs from 'dayjs';
import numeral from 'numeral';

const { Title, Text } = Typography;

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePurchaseOrder(Number(id));
  const { data: locations } = useLocations();
  const createGR = useCreateGoodsReceipt();

  const [grModalOpen, setGrModalOpen] = useState(false);
  const [grForm] = Form.useForm();
  const [grItems, setGrItems] = useState<{ key: number; productId: number; productName: string; locationId: number; quantity: number }[]>([]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!po) return <div>Không tìm thấy đơn nhập #{id}</div>;

  const openGrModal = () => {
    // Pre-fill from PO details
    const items = (po.details ?? []).map((d, i) => ({
      key: i,
      productId: d.productId ?? 0,
      productName: d.product?.productName ?? '',
      locationId: 0,
      quantity: d.quantity,
    }));
    setGrItems(items);
    grForm.setFieldsValue({ receiptDate: dayjs() });
    setGrModalOpen(true);
  };

  const submitGR = async () => {
    const vals = await grForm.validateFields();
    if (grItems.some((i) => !i.locationId)) { message.error('Chọn vị trí kho cho tất cả sản phẩm'); return; }
    await createGR.mutateAsync({
      poId: po.id,
      receiptDate: vals.receiptDate.format('YYYY-MM-DD'),
      note: vals.note,
      items: grItems.map((i) => ({ productId: i.productId, locationId: i.locationId, quantity: i.quantity })),
    });
    setGrModalOpen(false);
  };

  const statusColors: Record<string, string> = { Pending: 'warning', Received: 'success', Cancelled: 'error' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase-orders')} />
            <ImportOutlined style={{ color: 'var(--color-primary)' }} /> {po.poCode}
          </div>
          <div className="page-subtitle">Chi tiết đơn nhập hàng</div>
        </div>
        {po.status === 'Pending' && (
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={openGrModal} style={{ background: 'linear-gradient(145deg, #3ddb8e, #34c77b)', border: 'none' }}>
            Nhập kho (Goods Receipt)
          </Button>
        )}
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} labelStyle={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Descriptions.Item label="Mã đơn">{po.poCode}</Descriptions.Item>
          <Descriptions.Item label="NCC">{po.supplier?.name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">{dayjs(po.orderDate).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={statusColors[po.status] ?? 'default'} style={{ borderRadius: 8 }}>{po.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Tổng tiền"><span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{numeral(po.totalAmount).format('0,0')} ₫</span></Descriptions.Item>
          <Descriptions.Item label="Người tạo">{po.createdByUser?.username ?? '—'}</Descriptions.Item>
          {po.note && <Descriptions.Item label="Ghi chú" span={3}>{po.note}</Descriptions.Item>}
        </Descriptions>
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Title level={5}>Chi tiết sản phẩm</Title>
        <Table dataSource={po.details ?? []} rowKey="id" pagination={false} size="middle" columns={[
          { title: 'Mã SP', key: 'code', render: (_: unknown, r: (typeof po.details extends (infer U)[] | undefined ? U : never)) => r.product?.productCode ?? '—' },
          { title: 'Tên SP', key: 'name', render: (_: unknown, r: any) => r.product?.productName ?? '—' },
          { title: 'SL', dataIndex: 'quantity', key: 'qty', align: 'right' as const },
          { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'price', align: 'right' as const, render: (v: number) => numeral(v).format('0,0') },
          { title: 'Thành tiền', dataIndex: 'totalPrice', key: 'total', align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 600 }}>{numeral(v).format('0,0')}</span> },
        ]} />
      </div>

      {/* Goods Receipts History */}
      {po.goodsReceipts && po.goodsReceipts.length > 0 && (
        <div className="content-card">
          <Title level={5}>Lịch sử nhập kho</Title>
          {po.goodsReceipts.map((gr) => (
            <div key={gr.id} style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid rgba(163,177,198,0.12)' }}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color="green" style={{ borderRadius: 8 }}>{gr.receiptCode}</Tag>
                <Text type="secondary">{dayjs(gr.receiptDate).format('DD/MM/YYYY')}</Text>
                <Tag>{gr.status}</Tag>
              </Space>
              <Table dataSource={gr.details ?? []} rowKey="id" pagination={false} size="small" columns={[
                { title: 'SP', key: 'p', render: (_: unknown, r: any) => r.product?.productName ?? '—' },
                { title: 'Vị trí', key: 'loc', render: (_: unknown, r: any) => r.location?.locationCode ?? '—' },
                { title: 'SL', dataIndex: 'quantity', key: 'qty', align: 'right' as const },
              ]} />
            </div>
          ))}
        </div>
      )}

      {/* GR Modal */}
      <Modal title="Nhập kho – Goods Receipt" open={grModalOpen} onOk={submitGR} onCancel={() => setGrModalOpen(false)} width={700} okText="Xác nhận nhập kho" cancelText="Hủy" confirmLoading={createGR.isPending}>
        <Form form={grForm} layout="vertical">
          <Space size={16}>
            <Form.Item name="receiptDate" label="Ngày nhập" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="note" label="Ghi chú"><Input placeholder="Ghi chú" /></Form.Item>
          </Space>
        </Form>
        <Divider>Chọn vị trí kho cho từng sản phẩm</Divider>
        <Table dataSource={grItems} rowKey="key" pagination={false} size="small" columns={[
          { title: 'Sản phẩm', dataIndex: 'productName', key: 'name' },
          { title: 'SL', dataIndex: 'quantity', key: 'qty', width: 80, render: (v: number, r: any) => <InputNumber min={1} max={v} value={v} onChange={(val) => setGrItems(grItems.map((i) => i.key === r.key ? { ...i, quantity: val ?? 1 } : i))} style={{ width: '100%' }} /> },
          { title: 'Vị trí kho', key: 'loc', width: 250, render: (_: unknown, r: any) => (
            <Select placeholder="Chọn vị trí" value={r.locationId || undefined} onChange={(v) => setGrItems(grItems.map((i) => i.key === r.key ? { ...i, locationId: v } : i))} style={{ width: '100%' }}
              showSearch optionFilterProp="label" options={locations?.map((l) => ({ label: `${l.locationCode} (${l.warehouse?.warehouseName ?? ''})`, value: l.id })) ?? []} />
          )},
        ]} />
      </Modal>
    </div>
  );
}
