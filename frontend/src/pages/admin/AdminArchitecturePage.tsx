import React, { useState } from 'react';
import { Card, Row, Col, Typography, Input, Button, Table, Alert, Statistic, Divider, Space, Spin } from 'antd';
import { DatabaseOutlined, ClusterOutlined, HddOutlined, CloudServerOutlined, PartitionOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useUIStore } from '@/store/ui.store';

const { Title, Text, Paragraph } = Typography;

export default function AdminArchitecturePage() {
  const { theme, language } = useUIStore();
  const isVi = language === 'vi';

  const [warehouseIdInput, setWarehouseIdInput] = useState<string>('5');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [readResult, setReadResult] = useState<any>(null);
  const [writeResult, setWriteResult] = useState<any>(null);
  const [explainResult, setExplainResult] = useState<any>(null);

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['architecture_overview'],
    queryFn: async () => {
      const res = await api.get('/admin/architecture');
      return res.data;
    }
  });

  const { data: partitions, isLoading: loadingPartitions } = useQuery({
    queryKey: ['architecture_partitions'],
    queryFn: async () => {
      const res = await api.get('/admin/architecture/partitions');
      return res.data;
    }
  });

  // Handlers
  const handleCheckRouting = async () => {
    try {
      const res = await api.get(`/admin/architecture/sharding/routing?warehouseId=${warehouseIdInput}`);
      setRouteResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDemoRead = async () => {
    try {
      const res = await api.get(`/admin/architecture/sharding/read-demo?warehouseId=${warehouseIdInput}`);
      setReadResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDemoWrite = async () => {
    try {
      const res = await api.get(`/admin/architecture/sharding/write-demo?warehouseId=${warehouseIdInput}`);
      setWriteResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExplainPruning = async () => {
    try {
      const res = await api.get(`/admin/architecture/partitions/explain?startDate=2026-04-01&endDate=2026-07-01`);
      setExplainResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const cardStyle = {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  if (loadingOverview) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: theme === 'dark' ? '#f8fafc' : '#1e3a8a', marginBottom: 8 }}>
          <DatabaseOutlined style={{ marginRight: 12 }} />
          {isVi ? 'Quản trị Kiến trúc Hệ thống' : 'System Architecture Admin'}
        </Title>
        <Text type="secondary">
          {isVi 
            ? 'Bảng điều khiển mô phỏng và quản lý các công nghệ Database như Sharding, Replication, và Partitioning.' 
            : 'Dashboard for simulating and managing Database technologies like Sharding, Replication, and Partitioning.'}
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={12}>
          <Card title={<><ClusterOutlined /> Sharding & Replication Routing</>} style={cardStyle}>
            <Alert 
              message={isVi ? "Mô phỏng Phân mảnh (Sharding)" : "Sharding Simulation"}
              description={isVi 
                ? "Theo thiết kế, Kho ID <= 10 thuộc Miền Bắc, Kho ID > 10 thuộc Miền Nam. Các lệnh Read sẽ vào Slave, Write sẽ vào Master."
                : "By design, Warehouse ID <= 10 belongs to North Server, Warehouse ID > 10 belongs to South Server. Read commands go to Slave, Write to Master."}
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Input 
                value={warehouseIdInput} 
                onChange={(e) => setWarehouseIdInput(e.target.value)} 
                addonBefore="WarehouseID:" 
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={handleCheckRouting} icon={<SearchOutlined />}>Check Routing</Button>
            </div>
            
            <Space style={{ marginBottom: 16 }}>
              <Button onClick={handleDemoRead} icon={<CloudServerOutlined />}>Demo Read (Slave)</Button>
              <Button onClick={handleDemoWrite} icon={<HddOutlined />}>Demo Write (Master)</Button>
            </Space>

            {routeResult && (
              <div style={{ padding: 12, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                <Text strong>Routing Result:</Text>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', fontSize: 13, color: theme === 'dark' ? '#38bdf8' : '#0ea5e9' }}>
                  {JSON.stringify(routeResult, null, 2)}
                </pre>
              </div>
            )}
            
            {readResult && (
              <div style={{ padding: 12, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                <Text strong>Read Demo Result:</Text>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', fontSize: 13, color: theme === 'dark' ? '#10b981' : '#059669' }}>
                  {JSON.stringify(readResult, null, 2)}
                </pre>
              </div>
            )}
            
            {writeResult && (
              <div style={{ padding: 12, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                <Text strong>Write Demo Result:</Text>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', fontSize: 13, color: theme === 'dark' ? '#f59e0b' : '#d97706' }}>
                  {JSON.stringify(writeResult, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card title={<><PartitionOutlined /> Database Partitions</>} style={cardStyle}>
            <Alert 
              message="Partition Pruning"
              description="Bảng InventoryTransactions được chia nhỏ theo từng quý (Range Partitioning). MySQL sẽ chỉ đọc đúng phân vùng cần thiết khi truy vấn theo ngày."
              type="success" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
            
            <Button onClick={handleExplainPruning} type="dashed" style={{ marginBottom: 16 }}>
              Run EXPLAIN (Q2-2026)
            </Button>

            {explainResult && (
              <div style={{ padding: 12, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                <Text strong>EXPLAIN Analysis:</Text>
                <Paragraph style={{ margin: '8px 0', fontSize: 13 }}>
                  Lưu ý cột <b>partitions</b> chỉ chứa đúng phân vùng Q2 thay vì quét toàn bộ bảng.
                </Paragraph>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, color: theme === 'dark' ? '#38bdf8' : '#0ea5e9' }}>
                  {JSON.stringify(explainResult, null, 2)}
                </pre>
              </div>
            )}

            <Table 
              dataSource={partitions || []} 
              rowKey="partitionName"
              pagination={false}
              size="small"
              loading={loadingPartitions}
              scroll={{ x: 500 }}
              columns={[
                { title: 'Tên Partition', dataIndex: 'partitionName', key: 'partitionName' },
                { title: 'Số dòng', dataIndex: 'tableRows', key: 'tableRows' },
                { title: 'Dung lượng (KB)', dataIndex: 'dataLengthKb', key: 'dataLengthKb' },
                { title: 'Giới hạn', dataIndex: 'partitionDescription', key: 'partitionDescription' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
