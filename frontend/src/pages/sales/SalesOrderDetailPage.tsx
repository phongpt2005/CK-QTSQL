import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Table, Tag, Button, Modal, Form, DatePicker, Input, InputNumber, Select, Space, Typography, Spin, Divider, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useSalesOrder, useCreateDeliveryNote, useLocations } from '@/hooks/queries';
import dayjs from 'dayjs';
import numeral from 'numeral';

const { Title, Text } = Typography;

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: so, isLoading } = useSalesOrder(Number(id));
  const { data: locations } = useLocations();
  const createDN = useCreateDeliveryNote();
  const [dnModalOpen, setDnModalOpen] = useState(false);
  const [dnForm] = Form.useForm();
  const [dnItems, setDnItems] = useState<{ key: number; productId: number; productName: string; locationId: number; quantity: number }[]>([]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!so) return <div>Không tìm thấy đơn xuất #{id}</div>;

  const openDnModal = () => {
    const items = (so.details ?? []).map((d, i) => ({
      key: i, productId: d.productId ?? 0, productName: d.product?.productName ?? '', locationId: 0, quantity: d.quantity,
    }));
    setDnItems(items);
    dnForm.setFieldsValue({ deliveryDate: dayjs() });
    setDnModalOpen(true);
  };

  const submitDN = async () => {
    const vals = await dnForm.validateFields();
    if (dnItems.some((i) => !i.locationId)) { message.error('Chọn vị trí xuất cho tất cả SP'); return; }
    await createDN.mutateAsync({
      soId: so.id,
      deliveryDate: vals.deliveryDate.format('YYYY-MM-DD'),
      note: vals.note,
      items: dnItems.map((i) => ({ productId: i.productId, locationId: i.locationId, quantity: i.quantity })),
    });
    setDnModalOpen(false);
  };

  const statusColors: Record<string, string> = { Pending: 'warning', Delivered: 'success', Cancelled: 'error' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')} />
            <ExportOutlined style={{ color: 'var(--color-primary)' }} /> {so.soCode}
          </div>
        </div>
        {so.status === 'Pending' && (
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={openDnModal}
            style={{ background: 'linear-gradient(145deg, #f77, var(--color-danger))', border: 'none' }}>
            Xuất kho (Delivery Note)
          </Button>
        )}
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} labelStyle={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Descriptions.Item label="Mã đơn">{so.soCode}</Descriptions.Item>
          <Descriptions.Item label="Khách hàng">{so.customer?.name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">{dayjs(so.orderDate).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={statusColors[so.status] ?? 'default'} style={{ borderRadius: 8 }}>{so.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Tổng tiền"><span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{numeral(so.totalAmount).format('0,0')} ₫</span></Descriptions.Item>
          <Descriptions.Item label="Người tạo">{so.createdByUser?.username ?? '—'}</Descriptions.Item>
        </Descriptions>
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Title level={5}>Chi tiết sản phẩm</Title>
        <Table dataSource={so.details ?? []} rowKey="id" pagination={false} size="middle" columns={[
          { title: 'Mã SP', key: 'code', render: (_: unknown, r: any) => r.product?.productCode ?? '—' },
          { title: 'Tên SP', key: 'name', render: (_: unknown, r: any) => r.product?.productName ?? '—' },
          { title: 'SL', dataIndex: 'quantity', key: 'qty', align: 'right' as const },
          { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'price', align: 'right' as const, render: (v: number) => numeral(v).format('0,0') },
          { title: 'Thành tiền', dataIndex: 'totalPrice', key: 'total', align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 600 }}>{numeral(v).format('0,0')}</span> },
        ]} />
      </div>

      {so.deliveryNotes && so.deliveryNotes.length > 0 && (
        <div className="content-card">
          <Title level={5}>Lịch sử xuất kho</Title>
          {so.deliveryNotes.map((dn) => (
            <div key={dn.id} style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'var(--bg-secondary)' }}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color="red" style={{ borderRadius: 8 }}>{dn.deliveryCode}</Tag>
                <Text type="secondary">{dayjs(dn.deliveryDate).format('DD/MM/YYYY')}</Text>
              </Space>
              <Table dataSource={dn.details ?? []} rowKey="id" pagination={false} size="small" columns={[
                { title: 'SP', key: 'p', render: (_: unknown, r: any) => r.product?.productName ?? '—' },
                { title: 'Vị trí', key: 'loc', render: (_: unknown, r: any) => r.location?.locationCode ?? '—' },
                { title: 'SL', dataIndex: 'quantity', key: 'qty', align: 'right' as const },
              ]} />
            </div>
          ))}
        </div>
      )}

      <Modal title="Xuất kho – Delivery Note" open={dnModalOpen} onOk={submitDN} onCancel={() => setDnModalOpen(false)}
        width={700} okText="Xác nhận xuất kho" cancelText="Hủy" confirmLoading={createDN.isPending}
        okButtonProps={{ danger: true }}>
        <Form form={dnForm} layout="vertical">
          <Space size={16}>
            <Form.Item name="deliveryDate" label="Ngày xuất" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="note" label="Ghi chú"><Input /></Form.Item>
          </Space>
        </Form>
        <Divider>Chọn vị trí xuất kho</Divider>
        <Table dataSource={dnItems} rowKey="key" pagination={false} size="small" columns={[
          { title: 'Sản phẩm', dataIndex: 'productName', key: 'name' },
          { title: 'SL', dataIndex: 'quantity', key: 'qty', width: 80, render: (v: number, r: any) => <InputNumber min={1} max={v} value={v} onChange={(val) => setDnItems(dnItems.map((i) => i.key === r.key ? { ...i, quantity: val ?? 1 } : i))} style={{ width: '100%' }} /> },
          { title: 'Vị trí xuất', key: 'loc', width: 250, render: (_: unknown, r: any) => (
            <Select placeholder="Chọn vị trí" value={r.locationId || undefined} onChange={(v) => setDnItems(dnItems.map((i) => i.key === r.key ? { ...i, locationId: v } : i))} style={{ width: '100%' }}
              showSearch optionFilterProp="label" options={locations?.map((l) => ({ label: `${l.locationCode} (${l.warehouse?.warehouseName ?? ''})`, value: l.id })) ?? []} />
          )},
        ]} />
      </Modal>
    </div>
  );
}
