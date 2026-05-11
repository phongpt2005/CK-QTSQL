import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import './auth.css';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login(values);
      setAuth(res.access_token, res.user);
      message.success(`Xin chào, ${res.user.username}!`);
      
      const from = location.state?.from;
      const redirectPath = from ? `${from.pathname}${from.search}` : '/';
      navigate(redirectPath, { replace: true });
    } catch {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Left Panel: Image ── */}
      <div className="auth-split__image-panel auth-split__image-panel--login">
        <img
          src="/login-bg.jpg"
          alt="Kho hàng tự động"
          className="auth-split__bg-image"
        />
        <div className="auth-split__image-overlay auth-split__image-overlay--dark" />

        <div className="auth-split__image-content">
          {/* Floating feature badges */}
          <div className="auth-badge auth-badge--float-1 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <span className="auth-badge__dot" />
            Theo dõi thời gian thực
          </div>
          <div className="auth-badge auth-badge--float-2 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <span className="auth-badge__dot" />
            Đồng bộ kho hàng
          </div>
          <div className="auth-badge auth-badge--float-3 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <span className="auth-badge__dot" />
            Tự động phân loại
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="auth-split__form-panel">
        <div className="auth-split__form-container animate-fadeInUp">
          {/* Logo */}
          <div className="auth-split__logo">
            <div className="auth-split__logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>

          <Title level={3} className="auth-split__title">
            WMS Pro - Đăng Nhập
          </Title>
          <Text className="auth-split__subtitle">
            Quản lý chuỗi cung ứng toàn diện của bạn.
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
              rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Tên đăng nhập' }]}
            >
              <Input
                prefix={<UserOutlined className="auth-split__input-icon" />}
                placeholder="Nhập tên đăng nhập"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="auth-split__input-icon" />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <div className="auth-split__options">
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <Link to="/forgot-password" className="auth-split__forgot">Quên mật khẩu?</Link>
            </div>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="auth-split__submit-btn"
              >
                Đăng nhập bảo mật
              </Button>
            </Form.Item>
          </Form>


          <div className="auth-split__link-text">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-split__link">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
