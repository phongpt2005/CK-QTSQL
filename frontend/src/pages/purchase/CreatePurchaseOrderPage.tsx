import React, { useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Typography, Space, Card, Divider, Table, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ImportOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCreatePurchaseOrder, useSuppliers, useProducts } from '@/hooks/queries';
import numeral from 'numeral';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LineItem { key: number; productId: number; productName: string; quantity: number; unitPrice: number; }

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<LineItem[]>([]);
  const [nextKey, setNextKey] = useState(1);
  const { data: suppliers } = useSuppliers();
  const { data: productsData } = useProducts({ limit: 200 });
  const createMut = useCreatePurchaseOrder();
  const products = productsData?.data ?? [];

  const addItem = () => {
    setItems([...items, { key: nextKey, productId: 0, productName: '', quantity: 1, unitPrice: 0 }]);
    setNextKey(nextKey + 1);
  };

  const updateItem = (key: number, field: string, value: number | string) => {
    setItems(items.map((i) => {
      if (i.key !== key) return i;
      const updated = { ...i, [field]: value };
      if (field === 'productId') {
        const p = products.find((pp) => pp.id === value);
        updated.productName = p?.productName ?? '';
        updated.unitPrice = Number(p?.price ?? 0);
      }
      return updated;
    }));
  };

  const removeItem = (key: number) => setItems(items.filter((i) => i.key !== key));
  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (items.length === 0) { message.error('Vui lòng thêm ít nhất 1 sản phẩm'); return; }
    if (items.some((i) => !i.productId || i.quantity <= 0)) { message.error('Vui lòng điền đầy đủ thông tin sản phẩm'); return; }
    await createMut.mutateAsync({
      supplierId: vals.supplierId,
      orderDate: vals.orderDate.format('YYYY-MM-DD'),
      note: vals.note,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
    });
    navigate('/purchase-orders');
  };

  const itemColumns = [
    {
      title: 'Sản phẩm', key: 'product', width: 300,
      render: (_: unknown, r: LineItem) => (
        <Select placeholder="Chọn sản phẩm" value={r.productId || undefined} onChange={(v) => updateItem(r.key, 'productId', v)} style={{ width: '100%' }}
          showSearch optionFilterProp="label" options={products.map((p) => ({ label: `${p.productCode} - ${p.productName}`, value: p.id }))} />
      ),
    },
    {
      title: 'Số lượng', key: 'qty', width: 120,
      render: (_: unknown, r: LineItem) => <InputNumber min={1} value={r.quantity} onChange={(v) => updateItem(r.key, 'quantity', v ?? 1)} style={{ width: '100%' }} />,
    },
    {
      title: 'Đơn giá', key: 'price', width: 160,
      render: (_: unknown, r: LineItem) => <InputNumber min={0} value={r.unitPrice} onChange={(v) => updateItem(r.key, 'unitPrice', v ?? 0)} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />,
    },
    {
      title: 'Thành tiền', key: 'total', width: 140, align: 'right' as const,
      render: (_: unknown, r: LineItem) => <span style={{ fontWeight: 600 }}>{numeral(r.quantity * r.unitPrice).format('0,0')}</span>,
    },
    {
      title: '', key: 'act', width: 50,
      render: (_: unknown, r: LineItem) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(r.key)} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase-orders')} />
            <ImportOutlined style={{ color: 'var(--color-primary)' }} /> Tạo đơn nhập hàng
          </div>
          <div className="page-subtitle">Purchase Order mới → sau khi tạo sẽ nhập kho qua Goods Receipt</div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Form form={form} layout="vertical" initialValues={{ orderDate: dayjs() }}>
          <Space size={24} style={{ width: '100%' }} wrap>
            <Form.Item name="supplierId" label="Nhà cung cấp" rules={[{ required: true, message: 'Chọn NCC' }]} style={{ minWidth: 280 }}>
              <Select placeholder="Chọn NCC" showSearch optionFilterProp="label"
                options={suppliers?.filter((s) => !s.isDeleted).map((s) => ({ label: `${s.supplierCode} - ${s.name}`, value: s.id })) ?? []} />
            </Form.Item>
            <Form.Item name="orderDate" label="Ngày đặt" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú" style={{ minWidth: 300 }}>
              <Input placeholder="Ghi chú cho đơn nhập" />
            </Form.Item>
          </Space>
        </Form>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>Chi tiết sản phẩm</Title>
          <Button icon={<PlusOutlined />} onClick={addItem}>Thêm dòng</Button>
        </div>
        <Table dataSource={items} columns={itemColumns} rowKey="key" pagination={false} size="middle" />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary">Tổng tiền: </Text>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{numeral(totalAmount).format('0,0')} ₫</span>
        </div>
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <Space>
            <Button onClick={() => navigate('/purchase-orders')}>Hủy</Button>
            <Button type="primary" onClick={onSubmit} loading={createMut.isPending} disabled={items.length === 0} style={{ minWidth: 160 }}>
              Tạo đơn nhập hàng
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
