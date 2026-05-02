import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store/auth.store';

// ── Axios Instance ──
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Attach JWT ──
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor: Global Error Handling ──
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; statusCode?: number }>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // 401 → Token expired / invalid → logout
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return Promise.reject(error);
    }

    // 403 → Forbidden
    if (status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này.');
      return Promise.reject(error);
    }

    // Extract error message
    let errorMsg = 'Đã xảy ra lỗi. Vui lòng thử lại.';
    if (data?.message) {
      errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }

    // Business errors (400, 404, 409)
    if (status && status >= 400 && status < 500) {
      message.error(errorMsg);
    }

    // Server errors (500+)
    if (status && status >= 500) {
      message.error('Lỗi hệ thống. Vui lòng liên hệ quản trị viên.');
    }

    // Network error
    if (!error.response) {
      message.error('Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.');
    }

    return Promise.reject(error);
  },
);

export default api;
