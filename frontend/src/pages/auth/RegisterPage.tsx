import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';

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
    <div className="auth-page-wrapper">
      <div className="auth-bg-gradient" />
      <div className="auth-image-bg" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-container">
        <div
          className="animate-fadeInUp"
          style={{
            padding: 48,
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-out-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 16px',
              borderRadius: 20,
              background: 'linear-gradient(145deg, var(--color-primary-light), var(--color-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '6px 6px 16px rgba(79, 110, 247, 0.35), -4px -4px 12px rgba(255, 255, 255, 0.15)',
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
            Tạo Tài Khoản
          </Title>
          <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Tham gia vào WMS Pro
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="email@gmail.com"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
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
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 46, fontSize: 15, fontWeight: 600 }}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </div>
    </div>
  </div>
);
}
