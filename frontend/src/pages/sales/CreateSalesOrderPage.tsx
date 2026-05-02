import React, { useState, useCallback } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Typography, Space, Divider, Table, Tag, Alert, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCreateSalesOrder, useCustomers, useProducts, useWarehouses, useLocations } from '@/hooks/queries';
import { inventoryService } from '@/services';
import numeral from 'numeral';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LineItem {
  key: number;
  productId: number;
  productName: string;
  warehouseId: number;
  locationId: number;
  quantity: number;
  unitPrice: number;
  availableStock: number | null; // null = not checked yet
  stockChecking: boolean;
}

export default function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<LineItem[]>([]);
  const [nextKey, setNextKey] = useState(1);

  const { data: customers } = useCustomers();
  const { data: productsData } = useProducts({ limit: 200 });
  const { data: warehouses } = useWarehouses();
  const { data: locations } = useLocations();
  const createMut = useCreateSalesOrder();

  const products = productsData?.data ?? [];

  const addItem = () => {
    setItems([...items, { key: nextKey, productId: 0, productName: '', warehouseId: 0, locationId: 0, quantity: 1, unitPrice: 0, availableStock: null, stockChecking: false }]);
    setNextKey(nextKey + 1);
  };

  const checkStock = useCallback(async (key: number, productId: number, warehouseId: number, locationId: number) => {
    if (!productId || !warehouseId || !locationId) return;
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, stockChecking: true } : i));
    try {
      const summary = await inventoryService.getByProduct(productId);
      const detail = summary.details.find((d) =>
        d.warehouseId === warehouseId && d.locationId === locationId
      );
      const available = detail ? (detail.availableQty ?? detail.quantity) : 0;
      setItems((prev) => prev.map((i) => i.key === key ? { ...i, availableStock: available, stockChecking: false } : i));
    } catch {
      setItems((prev) => prev.map((i) => i.key === key ? { ...i, availableStock: 0, stockChecking: false } : i));
    }
  }, []);

  const updateItem = (key: number, field: string, value: number | string) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.key !== key) return i;
        const item = { ...i, [field]: value };
        if (field === 'productId') {
          const p = products.find((pp) => pp.id === value);
          item.productName = p?.productName ?? '';
          item.unitPrice = Number(p?.price ?? 0);
          item.availableStock = null;
        }
        if (field === 'warehouseId' || field === 'locationId' || field === 'productId') {
          item.availableStock = null;
        }
        return item;
      });
      const item = updated.find((i) => i.key === key);
      if (item && item.productId && item.warehouseId && item.locationId) {
        checkStock(key, item.productId, item.warehouseId, item.locationId);
      }
      return updated;
    });
  };

  const removeItem = (key: number) => setItems(items.filter((i) => i.key !== key));
  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const hasInsufficientStock = items.some((i) => i.availableStock !== null && (i.quantity > i.availableStock || i.availableStock === 0));
  const hasInvalidQuantity = items.some((i) => i.quantity <= 0);
  const allStockChecked = items.length > 0 && items.every((i) => i.availableStock !== null && !i.stockChecking);
  const canSubmit = items.length > 0 && allStockChecked && !hasInsufficientStock && !hasInvalidQuantity && items.every((i) => i.productId && i.warehouseId && i.locationId);

  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (!canSubmit) {
      message.error('Vui lòng kiểm tra lại tồn kho và điền đầy đủ thông tin');
      return;
    }

    for (const item of items) {
      try {
        const summary = await inventoryService.getByProduct(item.productId);
        const detail = summary.details.find((d) =>
          d.warehouseId === item.warehouseId && d.locationId === item.locationId
        );
        const available = detail ? (detail.availableQty ?? detail.quantity) : 0;
        if (item.quantity > available) {
          message.error(`Tồn kho đã thay đổi! SP "${item.productName}" chỉ còn ${available}. Vui lòng tải lại.`);
          setItems((prev) => prev.map((i) => i.key === item.key ? { ...i, availableStock: available } : i));
          return;
        }
      } catch {
        message.error('Không thể kiểm tra tồn kho. Vui lòng thử lại.');
        return;
      }
    }

    await createMut.mutateAsync({
      customerId: vals.customerId,
      orderDate: vals.orderDate.format('YYYY-MM-DD'),
      note: vals.note,
      items: items.map((i) => ({
        productId: i.productId,
        warehouseId: i.warehouseId,
        locationId: i.locationId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });
    navigate('/sales-orders');
  };

  const getLocationsForWarehouse = (warehouseId: number) =>
    (locations ?? []).filter((l) => l.warehouseId === warehouseId);

  const itemColumns = [
    {
      title: 'Sản phẩm', key: 'product', width: 240,
      render: (_: unknown, r: LineItem) => (
        <Select placeholder="Chọn SP" value={r.productId || undefined} onChange={(v) => updateItem(r.key, 'productId', v)} style={{ width: '100%' }}
          showSearch optionFilterProp="label" options={products.map((p) => ({ label: `${p.productCode} - ${p.productName}`, value: p.id }))} />
      ),
    },
    {
      title: 'Kho', key: 'wh', width: 160,
      render: (_: unknown, r: LineItem) => (
        <Select placeholder="Chọn kho" value={r.warehouseId || undefined} onChange={(v) => updateItem(r.key, 'warehouseId', v)} style={{ width: '100%' }}
          options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
      ),
    },
    {
      title: 'Vị trí', key: 'loc', width: 160,
      render: (_: unknown, r: LineItem) => (
        <Select placeholder="Chọn vị trí" value={r.locationId || undefined} onChange={(v) => updateItem(r.key, 'locationId', v)} style={{ width: '100%' }}
          disabled={!r.warehouseId}
          options={getLocationsForWarehouse(r.warehouseId).map((l) => ({ label: l.locationCode, value: l.id }))} />
      ),
    },
    {
      title: 'Tồn khả dụng', key: 'avail', width: 120, align: 'center' as const,
      render: (_: unknown, r: LineItem) => {
        if (r.stockChecking) return <Tag style={{ borderRadius: 8 }}>Đang kiểm...</Tag>;
        if (r.availableStock === null) return <Tag color="default" style={{ borderRadius: 8 }}>—</Tag>;
        if (r.availableStock === 0) return <Tag color="red" style={{ borderRadius: 8 }}>Hết hàng</Tag>;
        if (r.availableStock < r.quantity) return <Tag color="red" style={{ borderRadius: 8 }}><WarningOutlined /> {r.availableStock}</Tag>;
        return <Tag color="green" style={{ borderRadius: 8 }}>{r.availableStock}</Tag>;
      },
    },
    {
      title: 'SL', key: 'qty', width: 90,
      render: (_: unknown, r: LineItem) => (
        <InputNumber min={1} max={r.availableStock || undefined} value={r.quantity} onChange={(v) => updateItem(r.key, 'quantity', v ?? 1)} style={{ width: '100%' }} status={r.availableStock !== null && (r.quantity > r.availableStock || r.availableStock === 0) ? 'error' : undefined} />
      ),
    },
    {
      title: 'Đơn giá', key: 'price', width: 130,
      render: (_: unknown, r: LineItem) => <InputNumber min={0} value={r.unitPrice} onChange={(v) => updateItem(r.key, 'unitPrice', v ?? 0)} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />,
    },
    {
      title: 'Thành tiền', key: 'total', width: 120, align: 'right' as const,
      render: (_: unknown, r: LineItem) => <span style={{ fontWeight: 600 }}>{numeral(r.quantity * r.unitPrice).format('0,0')}</span>,
    },
    {
      title: '', key: 'act', width: 40,
      render: (_: unknown, r: LineItem) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(r.key)} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')} />
            <ExportOutlined style={{ color: 'var(--color-primary)' }} /> Tạo đơn xuất hàng
          </div>
          <div className="page-subtitle">Sales Order → Giữ hàng → Sau đó tạo Delivery Note để xuất kho</div>
        </div>
      </div>

      {hasInsufficientStock && (
        <Alert type="error" showIcon icon={<WarningOutlined />} message="Không đủ tồn kho" description="Một hoặc nhiều sản phẩm có số lượng yêu cầu vượt quá tồn khả dụng. Vui lòng điều chỉnh." style={{ marginBottom: 20, borderRadius: 12 }} />
      )}

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Form form={form} layout="vertical" initialValues={{ orderDate: dayjs() }}>
          <Space size={24} style={{ width: '100%' }} wrap>
            <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn KH' }]} style={{ minWidth: 280 }}>
              <Select placeholder="Chọn khách hàng" showSearch optionFilterProp="label" options={customers?.filter((c) => !c.isDeleted).map((c) => ({ label: `${c.customerCode} - ${c.name}`, value: c.id })) ?? []} />
            </Form.Item>
            <Form.Item name="orderDate" label="Ngày đặt" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="note" label="Ghi chú" style={{ minWidth: 300 }}><Input placeholder="Ghi chú" /></Form.Item>
          </Space>
        </Form>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Chi tiết sản phẩm</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Hệ thống tự kiểm tra tồn kho khi chọn vị trí. Công thức: Khả dụng = Tổng tồn - Đã giữ</Text>
          </div>
          <Button icon={<PlusOutlined />} onClick={addItem}>Thêm dòng</Button>
        </div>
        <Table dataSource={items} columns={itemColumns} rowKey="key" pagination={false} size="middle" scroll={{ x: 1200 }} />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary">Tổng tiền: </Text>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{numeral(totalAmount).format('0,0')} ₫</span>
        </div>
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <Space>
            <Button onClick={() => navigate('/sales-orders')}>Hủy</Button>
            <Button type="primary" onClick={onSubmit} loading={createMut.isPending} disabled={!canSubmit} style={{ minWidth: 180 }}>
              {!allStockChecked && items.length > 0 ? 'Đang kiểm tra tồn kho...' : 'Tạo đơn xuất & Giữ hàng'}
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
