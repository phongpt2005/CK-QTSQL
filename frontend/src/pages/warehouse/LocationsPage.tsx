import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useLocations, useWarehouses, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/queries';
import type { Location, CreateLocationDto } from '@/types';

export default function LocationsPage() {
  const [whFilter, setWhFilter] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useLocations(whFilter);
  const { data: warehouses } = useWarehouses();
  const createMut = useCreateLocation();
  const updateMut = useUpdateLocation();
  const deleteMut = useDeleteLocation();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Location) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateLocationDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><EnvironmentOutlined style={{ color: 'var(--color-primary)' }} /> Vị trí kho</div>
          <div className="page-subtitle">Quản lý vị trí lưu trữ trong kho</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm vị trí</Button>
      </div>
      <div className="filter-bar">
        <Select placeholder="Lọc theo kho" allowClear style={{ width: 240 }} onChange={setWhFilter} options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
      </div>
      <div className="content-card">
        <Table dataSource={data ?? []} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Mã vị trí', dataIndex: 'locationCode', key: 'code', render: (v: string) => <Tag color="purple" style={{ borderRadius: 8 }}>{v}</Tag> },
          { title: 'Kho', key: 'wh', render: (_: unknown, r: Location) => r.warehouse?.warehouseName ?? '—' },
          { title: 'Mô tả', dataIndex: 'description', key: 'desc', ellipsis: true },
          { title: 'Sức chứa', dataIndex: 'capacity', key: 'cap', width: 100, align: 'right' as const },
          { title: 'TT', dataIndex: 'status', key: 'status', width: 90, render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'} style={{ borderRadius: 8 }}>{v === 1 ? 'HĐ' : 'Ngưng'}</Tag> },
          { title: '', key: 'act', width: 100, render: (_: unknown, r: Location) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]} />
      </div>
      <Modal title={editing ? 'Sửa vị trí' : 'Thêm vị trí'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}>
            <Select options={warehouses?.map((w) => ({ label: w.warehouseName, value: w.id })) ?? []} />
          </Form.Item>
          <Form.Item name="locationCode" label="Mã vị trí" rules={[{ required: true }]}><Input placeholder="VD: A-01-01" /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="capacity" label="Sức chứa"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
