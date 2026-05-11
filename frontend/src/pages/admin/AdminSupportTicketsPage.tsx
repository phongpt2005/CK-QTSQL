import React, { useState } from 'react';
import { Typography, Table, Tag, Button, Space, message, Modal } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleOutlined, QuestionCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { supportService } from '@/services';
import type { SupportTicket } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AdminSupportTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: supportService.getAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => supportService.updateStatus(id, status),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTicket(null);
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });

  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Người gửi',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text: string) => <Text style={{ color: '#1e3a8a', fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: 'Chủ đề',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'warning'} style={{ borderRadius: 4, fontWeight: 500 }}>
          {status === 'COMPLETED' ? 'Hoàn thành' : 'Đang chờ'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: SupportTicket) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => setSelectedTicket(record)}
          />
          {record.status !== 'COMPLETED' && (
            <Button 
              type="text" 
              icon={<CheckCircleOutlined style={{ color: '#10b981' }} />} 
              onClick={() => statusMutation.mutate({ id: record.id, status: 'COMPLETED' })}
              title="Đánh dấu đã hoàn thành"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="stagger-children">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Quản lý Hỗ trợ</Title>
          <Text style={{ color: '#6b7280' }}>Quản lý các yêu cầu hỗ trợ và báo lỗi từ người dùng</Text>
        </div>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
          size="middle"
        />
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuestionCircleOutlined style={{ color: '#1e3a8a' }} /> Chi tiết yêu cầu #{selectedTicket?.id}
          </div>
        }
        open={!!selectedTicket}
        onCancel={() => setSelectedTicket(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedTicket(null)}>
            Đóng
          </Button>,
          selectedTicket?.status !== 'COMPLETED' && (
            <Button 
              key="resolve" 
              type="primary" 
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => statusMutation.mutate({ id: selectedTicket!.id, status: 'COMPLETED' })}
              loading={statusMutation.isPending}
            >
              Đánh dấu Hoàn thành
            </Button>
          )
        ]}
        width={600}
      >
        {selectedTicket && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <div>
                <Text style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Người gửi yêu cầu</Text>
                <Text strong style={{ fontSize: 16, color: '#0f172a' }}>{selectedTicket.username}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Thời gian gửi</Text>
                <Text style={{ color: '#334155' }}>{dayjs(selectedTicket.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <Text style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Chủ đề hỗ trợ</Text>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a8a', lineHeight: 1.4 }}>
                {selectedTicket.subject}
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <Text style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Mô tả chi tiết vấn đề</Text>
              <div style={{ 
                background: '#ffffff', 
                padding: '20px', 
                borderRadius: 12, 
                border: '1px solid #e2e8f0', 
                whiteSpace: 'pre-wrap',
                color: '#334155',
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {selectedTicket.description}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: selectedTicket.status === 'COMPLETED' ? '#ecfdf5' : '#fffbeb', borderRadius: 8 }}>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: selectedTicket.status === 'COMPLETED' ? '#10b981' : '#f59e0b' 
              }} />
              <Text style={{ fontSize: 13, fontWeight: 600, color: selectedTicket.status === 'COMPLETED' ? '#065f46' : '#92400e' }}>
                Trạng thái hiện tại: {selectedTicket.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang chờ xử lý'}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
