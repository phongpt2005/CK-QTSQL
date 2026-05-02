import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/queries';
import type { ProductCategory, CreateCategoryDto } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'Admin';

  const items = (data ?? []).filter((c) => !c.isDeleted);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: ProductCategory) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: vals });
    else await createMut.mutateAsync(vals as CreateCategoryDto);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><FolderOutlined style={{ color: 'var(--color-primary)' }} /> Danh mục</div>
          <div className="page-subtitle">Quản lý danh mục sản phẩm</div>
        </div>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>}
      </div>
      <div className="content-card">
        <Table dataSource={items} rowKey="id" loading={isLoading} pagination={false} columns={[
          { title: 'Tên danh mục', dataIndex: 'categoryName', key: 'name' },
          { title: 'Mô tả', dataIndex: 'description', key: 'desc', ellipsis: true },
          { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 100, render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'} style={{ borderRadius: 8 }}>{v === 1 ? 'Hoạt động' : 'Ngưng'}</Tag> },
          ...(isAdmin ? [{ title: '', key: 'act', width: 100, render: (_: unknown, r: ProductCategory) => (
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              <Popconfirm title="Xóa danh mục?" onConfirm={() => deleteMut.mutate(r.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}] : []),
        ]} />
      </div>
      <Modal title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} open={modalOpen} onOk={onSubmit} onCancel={() => setModalOpen(false)} confirmLoading={createMut.isPending || updateMut.isPending} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
