import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories, useUnits } from '@/hooks/queries';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';
import numeral from 'numeral';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/common/PageHeader';

const { Title, Text } = Typography;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useProducts({ page, limit: 20, search: search || undefined });
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Product) => {
    setEditing(r);
    form.setFieldsValue({ productCode: r.productCode, productName: r.productName, categoryId: r.categoryId, unitId: r.unitId, price: Number(r.price), description: r.description });
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data: vals as UpdateProductDto });
    } else {
      await createMut.mutateAsync(vals as CreateProductDto);
    }
    setModalOpen(false);
  };

  const columns = [
    { title: 'Mã SP', dataIndex: 'productCode', key: 'code', width: 120, render: (v: string) => <Tag color="blue" style={{ borderRadius: 8 }}>{v}</Tag> },
    { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'name', ellipsis: true },
    { title: 'Danh mục', key: 'cat', render: (_: unknown, r: Product) => r.category?.categoryName ?? '—' },
    { title: 'Đơn vị', key: 'unit', render: (_: unknown, r: Product) => r.unit?.unitName ?? '—' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (v: number) => numeral(v).format('0,0'), align: 'right' as const },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100, render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'} style={{ borderRadius: 8 }}>{v === 1 ? 'Hoạt động' : 'Ngưng'}</Tag> },
    { 
      title: 'Vị trí lưu kho', 
      key: 'locations', 
      width: 250,
      render: (_: unknown, r: Product) => {
        if (!r.inventories || r.inventories.length === 0) return <Text type="secondary">Chưa có hàng</Text>;
        return (
          <Space size={[0, 8]} wrap>
            {r.inventories.map((inv, idx) => (
              <Tooltip key={idx} title={`Kho: ${inv.warehouse?.warehouseName}`}>
                <Tag color="purple" style={{ borderRadius: 8 }}>
                  {inv.location?.locationCode} ({inv.quantity})
                </Tag>
              </Tooltip>
            ))}
          </Space>
        );
      }
    },
    ...(isAdmin ? [{
      title: '', key: 'actions', width: 100,
      render: (_: unknown, r: Product) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="stagger-children">
      <PageHeader 
        title="Sản phẩm" 
        subtitle="Quản lý danh sách sản phẩm và thông tin chi tiết"
        extra={isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="neu-btn" style={{ background: '#1e3a8a', color: '#fff' }}>Thêm sản phẩm</Button>}
      />

      <div className="filter-bar">
        <Input placeholder="Tìm kiếm sản phẩm..." prefix={<SearchOutlined />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: 300 }} allowClear />
      </div>

      <div className="content-card">
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ current: page, pageSize: 20, total: data?.meta.total ?? 0, onChange: setPage, showTotal: (t) => `Tổng: ${t} sản phẩm` }}
        />
      </div>

      <Modal title={editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} confirmLoading={createMut.isPending || updateMut.isPending} okText={editing ? 'Cập nhật' : 'Tạo mới'} cancelText="Hủy" width={560}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editing && <Form.Item name="productCode" label="Mã sản phẩm" rules={[{ required: true, message: 'Bắt buộc' }]}><Input placeholder="VD: SP-001" /></Form.Item>}
          <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true, message: 'Bắt buộc' }]}><Input placeholder="Nhập tên sản phẩm" /></Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="categoryId" label="Danh mục" style={{ flex: 1 }}>
              <Select placeholder="Chọn danh mục" allowClear options={categories?.map((c) => ({ label: c.categoryName, value: c.id })) ?? []} />
            </Form.Item>
            <Form.Item name="unitId" label="Đơn vị" style={{ flex: 1 }}>
              <Select placeholder="Chọn đơn vị" allowClear options={units?.map((u) => ({ label: `${u.unitName} (${u.symbol})`, value: u.id })) ?? []} />
            </Form.Item>
          </Space>
          <Form.Item name="price" label="Giá"><InputNumber min={0} style={{ width: '100%' }} placeholder="0" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} placeholder="Mô tả sản phẩm" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
