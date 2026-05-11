import React from 'react';
import { Typography, Button, Space } from 'antd';
import { CalendarOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra }) => {
  return (
    <div className="page-header" style={{ marginBottom: 32 }}>
      <div>
        <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{title}</Title>
        {subtitle && <Text style={{ color: '#6b7280', fontSize: 14 }}>{subtitle}</Text>}
      </div>
      <Space size="middle">
        {extra}
        <Button icon={<CalendarOutlined />} className="neu-btn">
          30 ngày qua
        </Button>
        <Button icon={<FilterOutlined />} className="neu-btn">
          Lọc
        </Button>
      </Space>
    </div>
  );
};
