import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/queries';
import type { Customer, CreateCustomerDto } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function CustomersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useCustomers();
  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();
  const deleteMut = useDeleteCustomer();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';
  const items = (data ?? []).filter((c) => !c.isDeleted);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Customer) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateCustomerDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><UserOutlined style={{ color: 'var(--color-primary)' }} /> Khách hàng</div>
          <div className="page-subtitle">Quản lý khách hàng</div>
        </div>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm KH</Button>}
      </div>
      <div className="content-card">
        <Table dataSource={items} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Mã KH', dataIndex: 'customerCode', key: 'code', width: 120, render: (v: string) => <Tag style={{ borderRadius: 8 }}>{v}</Tag> },
          { title: 'Tên', dataIndex: 'name', key: 'name' },
          { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
          { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
          { title: 'Địa chỉ', dataIndex: 'address', key: 'address', ellipsis: true },
          ...(isAdmin ? [{ title: '', key: 'act', width: 100, render: (_: unknown, r: Customer) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}] : []),
        ]} />
      </div>
      <Modal title={editing ? 'Sửa KH' : 'Thêm KH'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy" width={540}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editing && <Form.Item name="customerCode" label="Mã KH" rules={[{ required: true, message: 'Vui lòng nhập mã KH' }, { pattern: /^CUS/, message: 'Mã khách hàng phải bắt đầu bằng CUS' }]}><Input /></Form.Item>}
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ pattern: /^0\d{9}$/, message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' }]}><Input maxLength={10} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không đúng định dạng' }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
