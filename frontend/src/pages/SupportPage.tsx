import React, { useRef, useState } from 'react';
import { Row, Col, Typography, Input, Button, Form, Collapse, message, Modal, List } from 'antd';
import {
  BookOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  SendOutlined,
  PhoneOutlined,
  FilePdfOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { supportService } from '@/services';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SupportPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const handleFinish = async (values: any) => {
    try {
      setLoading(true);
      await supportService.create({
        subject: values.subject,
        description: values.description,
      });
      message.success('Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất!');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const showGuideModal = () => {
    setIsModalVisible(true);
  };

  const faqItems = [
    {
      key: '1',
      label: 'Làm thế nào để tạo một đơn nhập hàng mới?',
      children: <Text>Để tạo đơn nhập hàng mới, bạn hãy vào mục "Nhập hàng" &gt; "Tạo đơn nhập" ở menu bên trái. Điền đầy đủ thông tin nhà cung cấp, ngày dự kiến và thêm các sản phẩm cần nhập vào danh sách. Cuối cùng bấm "Tạo đơn".</Text>,
    },
    {
      key: '2',
      label: 'Hệ thống cảnh báo tồn kho hoạt động như thế nào?',
      children: <Text>Hệ thống tự động theo dõi số lượng tồn kho của tất cả sản phẩm. Bất cứ khi nào số lượng của một mặt hàng giảm xuống mức bằng hoặc dưới 10, hệ thống sẽ đưa sản phẩm đó vào danh sách "Cảnh báo sắp hết hàng" trên Bảng điều khiển.</Text>,
    },
    {
      key: '3',
      label: 'Làm sao để thay đổi mật khẩu tài khoản?',
      children: <Text>Bạn có thể nhấp vào hình đại diện ở góc phải trên cùng, chọn "Đăng xuất" rồi sử dụng tính năng "Quên mật khẩu" ở màn hình Đăng nhập để thiết lập lại mật khẩu mới thông qua email.</Text>,
    },
    {
      key: '4',
      label: 'Làm thế nào để thêm một kho lưu trữ mới?',
      children: <Text>Vào mục "Kho bãi" &gt; "Danh sách kho", nhấp vào nút "Thêm kho mới" ở góc trên bên phải. Điền Tên kho, Mã kho, và địa chỉ, sau đó lưu lại.</Text>,
    },
  ];

  const guideFiles = [
    { title: 'Hướng dẫn Quản lý Kho bãi v4.2', size: '2.4 MB' },
    { title: 'Tài liệu Giao dịch Nhập/Xuất', size: '1.8 MB' },
    { title: 'Báo cáo và Thống kê', size: '3.1 MB' },
  ];

  return (
    <div className="stagger-children">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Trung tâm Hỗ trợ</Title>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>Tìm kiếm câu trả lời hoặc gửi yêu cầu trợ giúp đến đội ngũ kỹ thuật</Text>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={8}>
          <div className="content-card neu-hover" onClick={showGuideModal} style={{ textAlign: 'center', padding: '32px 20px', cursor: 'pointer' }}>
            <div style={{ background: '#eff6ff', color: '#1e3a8a', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              <BookOutlined />
            </div>
            <Title level={5} style={{ marginBottom: 8 }}>Tài liệu hướng dẫn</Title>
            <Text style={{ color: '#6b7280', display: 'block', fontSize: 13 }}>
              Xem các tài liệu chi tiết về cách sử dụng toàn bộ tính năng của nền tảng WMS.
            </Text>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div className="content-card neu-hover" onClick={() => scrollToRef(faqRef)} style={{ textAlign: 'center', padding: '32px 20px', cursor: 'pointer' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              <QuestionCircleOutlined />
            </div>
            <Title level={5} style={{ marginBottom: 8 }}>Câu hỏi thường gặp</Title>
            <Text style={{ color: '#6b7280', display: 'block', fontSize: 13 }}>
              Duyệt qua danh sách các câu hỏi phổ biến nhất từ người dùng khác.
            </Text>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="content-card neu-hover" onClick={() => scrollToRef(contactRef)} style={{ textAlign: 'center', padding: '32px 20px', cursor: 'pointer' }}>
            <div style={{ background: '#d1fae5', color: '#047857', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              <CustomerServiceOutlined />
            </div>
            <Title level={5} style={{ marginBottom: 8 }}>Hỗ trợ trực tiếp</Title>
            <Text style={{ color: '#6b7280', display: 'block', fontSize: 13 }}>
              Liên hệ với chuyên viên hỗ trợ của chúng tôi để được giải quyết vấn đề 24/7.
            </Text>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* FAQ Section */}
        <Col xs={24} lg={12}>
          <div ref={faqRef} className="content-card" style={{ padding: 24, height: '100%' }}>
            <Title level={4} style={{ marginBottom: 24, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <QuestionCircleOutlined style={{ color: '#1e3a8a' }} /> Câu hỏi thường gặp (FAQ)
            </Title>
            <Collapse 
              items={faqItems} 
              ghost 
              expandIconPosition="end"
              style={{ background: 'transparent' }}
            />
            <div style={{ marginTop: 24, padding: 16, background: '#f3f4f6', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>Không tìm thấy câu trả lời?</div>
                <div style={{ fontSize: 12, color: '#4b5563' }}>Gọi ngay cho hotline kỹ thuật</div>
              </div>
              <Button type="primary" style={{ background: '#111827', borderColor: '#111827' }} icon={<PhoneOutlined />}>
                1900 1234
              </Button>
            </div>
          </div>
        </Col>

        {/* Contact Form */}
        <Col xs={24} lg={12}>
          <div ref={contactRef} className="content-card" style={{ padding: 24, height: '100%' }}>
            <Title level={4} style={{ marginBottom: 24, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MailOutlined style={{ color: '#1e3a8a' }} /> Gửi yêu cầu hỗ trợ
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
            >
              <Form.Item
                label="Chủ đề cần hỗ trợ"
                name="subject"
                rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
              >
                <Input placeholder="Ví dụ: Không thể duyệt đơn xuất hàng..." className="neu-input" />
              </Form.Item>

              <Form.Item
                label="Mô tả chi tiết vấn đề"
                name="description"
                rules={[{ required: true, message: 'Vui lòng mô tả vấn đề của bạn' }]}
              >
                <TextArea 
                  rows={5} 
                  placeholder="Mô tả chi tiết những gì bạn đang gặp phải, các thao tác dẫn đến lỗi..." 
                  className="neu-input"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              <Form.Item style={{ margin: 0, marginTop: 32 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SendOutlined />}
                  style={{ background: '#1e3a8a', height: 40, width: '100%' }}
                >
                  Gửi yêu cầu
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOutlined style={{ color: '#1e3a8a' }} /> Tài liệu hướng dẫn
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: '8px 0' }}>
          <Text style={{ color: '#6b7280', display: 'block', marginBottom: 16 }}>
            Chọn tài liệu cần tải xuống. Các tài liệu được lưu dưới dạng PDF.
          </Text>
          <List
            itemLayout="horizontal"
            dataSource={guideFiles}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="text" icon={<DownloadOutlined />} style={{ color: '#1e3a8a' }} />
                ]}
              >
                <List.Item.Meta
                  avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#ef4444' }} />}
                  title={<Text strong>{item.title}</Text>}
                  description={item.size}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </div>
  );
}
