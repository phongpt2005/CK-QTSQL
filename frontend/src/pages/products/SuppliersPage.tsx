import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TruckOutlined } from '@ant-design/icons';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/queries';
import type { Supplier, CreateSupplierDto } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useSuppliers();
  const createMut = useCreateSupplier();
  const updateMut = useUpdateSupplier();
  const deleteMut = useDeleteSupplier();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';
  const items = (data ?? []).filter((s) => !s.isDeleted);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Supplier) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateSupplierDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><TruckOutlined style={{ color: 'var(--color-primary)' }} /> Nhà cung cấp</div>
          <div className="page-subtitle">Quản lý nhà cung cấp</div>
        </div>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm NCC</Button>}
      </div>
      <div className="content-card">
        <Table dataSource={items} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Mã NCC', dataIndex: 'supplierCode', key: 'code', width: 120, render: (v: string) => <Tag style={{ borderRadius: 8 }}>{v}</Tag> },
          { title: 'Tên', dataIndex: 'name', key: 'name' },
          { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
          { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
          { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
          ...(isAdmin ? [{ title: '', key: 'act', width: 100, render: (_: unknown, r: Supplier) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}] : []),
        ]} />
      </div>
      <Modal title={editing ? 'Sửa NCC' : 'Thêm NCC'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy" width={540}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editing && <Form.Item name="supplierCode" label="Mã NCC" rules={[{ required: true, message: 'Vui lòng nhập mã NCC' }, { pattern: /^SUP/, message: 'Mã nhà cung cấp phải bắt đầu bằng SUP' }]}><Input /></Form.Item>}
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ pattern: /^0\d{9}$/, message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' }]}><Input maxLength={10} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không đúng định dạng' }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
