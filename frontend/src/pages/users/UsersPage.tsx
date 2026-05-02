import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/queries';
import type { User, CreateUserDto } from '@/types';

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: User) => { setEditing(r); form.setFieldsValue({ role: r.role, status: r.status }); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateUserDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><UserOutlined style={{ color: 'var(--color-primary)' }} /> Người dùng</div>
          <div className="page-subtitle">Quản lý tài khoản (Admin only)</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm user</Button>
      </div>
      <div className="content-card">
        <Table dataSource={data ?? []} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Username', dataIndex: 'username', key: 'user', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
          { title: 'Role', dataIndex: 'role', key: 'role', render: (v: string) => <Tag color={v === 'Admin' ? 'blue' : 'green'} style={{ borderRadius: 8 }}>{v}</Tag> },
          { title: 'Trạng thái', dataIndex: 'status', key: 'st', render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'} style={{ borderRadius: 8 }}>{v === 1 ? 'Active' : 'Inactive'}</Tag> },
          { title: '', key: 'act', width: 60, render: (_: unknown, r: User) => <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /> },
        ]} />
      </div>
      <Modal title={editing ? 'Sửa user' : 'Thêm user'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editing && <Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item>}
          {!editing && <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={[{ label: 'Admin', value: 'Admin' }, { label: 'Staff', value: 'Staff' }]} />
          </Form.Item>
          {editing && <Form.Item name="status" label="Status"><Select options={[{ label: 'Active', value: 1 }, { label: 'Inactive', value: 0 }]} /></Form.Item>}
        </Form>
      </Modal>
    </div>
  );
}
