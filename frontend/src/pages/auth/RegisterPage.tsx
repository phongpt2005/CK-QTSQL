import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import './auth.css';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await authService.register({
        username: values.username,
        password: values.password,
      });
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Left Panel: Image with purple gradient ── */}
      <div className="auth-split__image-panel auth-split__image-panel--register">
        <img
          src="/register-bg.jpg"
          alt="Trung tâm Logistics"
          className="auth-split__bg-image"
        />
        <div className="auth-split__image-overlay auth-split__image-overlay--purple" />

        <div className="auth-split__image-content auth-split__image-content--register">
          <div className="auth-split__brand-name animate-fadeInUp">WMS Pro</div>
          <h2 className="auth-split__hero-title animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
            Tham gia<br />Hệ thống.
          </h2>
          <p className="auth-split__hero-desc animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            Triển khai quản lý kho hàng thông minh<br />
            với hệ thống bảo mật và linh hoạt.
          </p>

          <div className="auth-split__features">
            <div className="auth-split__feature animate-fadeInUp" style={{ animationDelay: '0.45s' }}>
              <span className="auth-split__feature-icon">✓</span>
              Đăng ký nhanh chóng
            </div>
            <div className="auth-split__feature animate-fadeInUp" style={{ animationDelay: '0.55s' }}>
              <span className="auth-split__feature-icon">✓</span>
              Phân quyền linh hoạt
            </div>
            <div className="auth-split__feature animate-fadeInUp" style={{ animationDelay: '0.65s' }}>
              <span className="auth-split__feature-icon">✓</span>
              Quản lý toàn diện
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="auth-split__form-panel">
        <div className="auth-split__form-container animate-fadeInUp">
          <Title level={3} className="auth-split__title">
            Tạo Tài Khoản
          </Title>
          <Text className="auth-split__subtitle">
            Đăng ký để truy cập hệ thống quản lý kho.
          </Text>

          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            className="auth-split__form"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập Email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="auth-split__input-icon" />}
                placeholder="email@gmail.com"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="auth-split__input-icon" />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="auth-split__input-icon" />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="auth-split__submit-btn"
              >
                Tạo tài khoản →
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-split__link-text">
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-split__link">
              Đăng nhập ngay
            </Link>
          </div>

          <div className="auth-split__footer">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
