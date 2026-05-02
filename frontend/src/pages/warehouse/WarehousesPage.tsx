import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/queries';
import type { Warehouse, CreateWarehouseDto } from '@/types';

export default function WarehousesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useWarehouses();
  const createMut = useCreateWarehouse();
  const updateMut = useUpdateWarehouse();
  const deleteMut = useDeleteWarehouse();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Warehouse) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateWarehouseDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><ShopOutlined style={{ color: 'var(--color-primary)' }} /> Kho hàng</div>
          <div className="page-subtitle">Quản lý danh sách kho</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm kho</Button>
      </div>
      <div className="content-card">
        <Table dataSource={data ?? []} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Tên kho', dataIndex: 'warehouseName', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
          { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
          { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
          { title: 'Quản lý', dataIndex: 'managerName', key: 'manager' },
          { title: 'TT', dataIndex: 'status', key: 'status', width: 90, render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'} style={{ borderRadius: 8 }}>{v === 1 ? 'Hoạt động' : 'Ngưng'}</Tag> },
          { title: '', key: 'act', width: 100, render: (_: unknown, r: Warehouse) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa kho?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]} />
      </div>
      <Modal title={editing ? 'Sửa kho' : 'Thêm kho'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy" width={540}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="warehouseName" label="Tên kho" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ pattern: /^0\d{9}$/, message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' }]}><Input maxLength={10} /></Form.Item>
          <Form.Item name="managerName" label="Người quản lý"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
