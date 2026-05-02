import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/queries';
import type { Unit, CreateUnitDto } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function UnitsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useUnits();
  const createMut = useCreateUnit();
  const updateMut = useUpdateUnit();
  const deleteMut = useDeleteUnit();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Unit) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateUnitDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><CalculatorOutlined style={{ color: 'var(--color-primary)' }} /> Đơn vị tính</div>
          <div className="page-subtitle">Quản lý đơn vị tính sản phẩm</div>
        </div>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm đơn vị</Button>}
      </div>
      <div className="content-card">
        <Table dataSource={data ?? []} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Tên đơn vị', dataIndex: 'unitName', key: 'name' },
          { title: 'Ký hiệu', dataIndex: 'symbol', key: 'symbol', width: 100 },
          ...(isAdmin ? [{ title: '', key: 'act', width: 100, render: (_: unknown, r: Unit) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}] : []),
        ]} />
      </div>
      <Modal title={editing ? 'Sửa đơn vị' : 'Thêm đơn vị'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="unitName" label="Tên đơn vị" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="symbol" label="Ký hiệu"><Input placeholder="VD: kg, pcs, m" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
