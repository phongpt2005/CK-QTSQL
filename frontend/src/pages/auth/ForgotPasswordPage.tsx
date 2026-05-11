import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services';
import './auth.css';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email: values.email });
      setEmail(values.email);
      setStep(2);
      message.success('Mã xác thực đã được gửi đến email của bạn.');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: { code: string; newPassword: string; confirmPassword?: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        code: values.code,
        newPassword: values.newPassword,
      });
      message.success('Mật khẩu đã được thay đổi thành công. Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      message.success('Đã gửi lại mã xác thực!');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Top Header (WMS Industrial) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, background: '#1e3a8a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>W</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px' }}>WMS Industrial</span>
        </div>
        <div>
          <span style={{ color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Support</span>
        </div>
      </div>

      {/* ── Left Panel: Image ── */}
      <div className="auth-split__image-panel auth-split__image-panel--login">
        <img
          src="/login-bg.jpg"
          alt="Warehouse"
          className="auth-split__bg-image"
          style={{ objectPosition: 'center 20%' }}
        />
        {/* Overlay removed per user request */}

        <div className="auth-split__image-content" style={{ padding: '80px 60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 12px', borderRadius: 4, marginBottom: 24 }}>
            <LockOutlined style={{ color: '#1e3a8a', fontSize: 12 }} />
            <span style={{ color: '#1e3a8a', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>HỆ THỐNG BẢO MẬT CAO CẤP</span>
          </div>

          <h1 className="auth-split__hero-title" style={{ fontSize: 42, marginBottom: 16 }}>
            Kiểm soát toàn diện<br />Chuỗi cung ứng của bạn.
          </h1>
          <p className="auth-split__hero-desc" style={{ fontSize: 16, maxWidth: 400 }}>
            Nền tảng quản lý kho vận cấp doanh nghiệp, đảm bảo độ chính xác dữ liệu lên đến 99.9% cho các hoạt động logistics quy mô lớn.
          </p>

        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="auth-split__form-panel" style={{ background: '#f8fafc' }}>
        <div className="auth-split__form-container animate-fadeInUp" style={{ background: '#ffffff', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: 420 }}>

          {step === 1 ? (
            <>
              {/* Step 1: Request Code */}
              <div className="auth-split__logo" style={{ marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, background: '#e0e7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: 20 }}>
                  <KeyOutlined />
                </div>
              </div>

              <Title level={3} className="auth-split__title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                Khôi phục mật khẩu
              </Title>
              <Text className="auth-split__subtitle" style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 24 }}>
                Nhập địa chỉ email liên kết với tài khoản của bạn để nhận mã xác nhận.
              </Text>

              <Form layout="vertical" onFinish={handleRequestCode} size="large" className="auth-split__form">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="auth-split__input-icon" />}
                    placeholder="user@gmail.com"
                    autoFocus
                  />
                </Form.Item>
                <div style={{ fontSize: 12, color: '#4b5563', marginTop: -12, marginBottom: 24 }}>
                  Chúng tôi sẽ gửi một mã gồm 6 chữ số đến email này.
                </div>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="auth-split__submit-btn"
                    style={{ background: '#1e3a8a', height: 44 }}
                  >
                    Gửi mã xác nhận
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ color: '#1e3a8a', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    <ArrowLeftOutlined style={{ marginRight: 6 }} />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Form>
            </>
          ) : (
            <>
              {/* Step 2: Reset Password */}
              <Title level={3} className="auth-split__title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                Thiết lập mật khẩu mới
              </Title>
              <Text className="auth-split__subtitle" style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 24 }}>
                Vui lòng xác minh danh tính và tạo mật khẩu mạnh.
              </Text>

              <Form layout="vertical" onFinish={handleResetPassword} size="large" className="auth-split__form">
                <Form.Item
                  label="Mã xác thực (6 số)"
                  name="code"
                  rules={[{ required: true, len: 6, message: 'Mã xác thực phải gồm 6 chữ số' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input
                    placeholder="000000"
                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 600 }}
                    maxLength={6}
                    autoFocus
                  />
                </Form.Item>

                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <span onClick={handleResendCode} style={{ color: '#1e3a8a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {loading ? <Spin size="small" /> : 'Gửi lại mã'}
                  </span>
                </div>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[{ required: true, min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }]}
                  style={{ marginBottom: 8 }}
                >
                  <Input.Password
                    prefix={<LockOutlined className="auth-split__input-icon" />}
                    placeholder="........"
                  />
                </Form.Item>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 16 }}>
                  Phải có ít nhất 6 ký tự
                </div>

                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                >
                  <Input.Password
                    prefix={<ReloadOutlined className="auth-split__input-icon" />}
                    placeholder="........"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="auth-split__submit-btn"
                    style={{ background: '#1e3a8a', height: 44 }}
                  >
                    Xác nhận thay đổi →
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ color: '#1e3a8a', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    <ArrowLeftOutlined style={{ marginRight: 6 }} />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Form>
            </>
          )}

        </div>

        {/* Footer Text */}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            © {new Date().getFullYear()} INDUSTRIAL INTEGRITY SYSTEMS. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </div>
  );
}
