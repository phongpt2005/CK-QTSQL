import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // 1. Đi tới trang đăng nhập
  await page.goto('/login');
  await expect(page.getByText('WMS Pro')).toBeVisible({ timeout: 15000 });

  // 2. Điền thông tin đăng nhập
  await page.getByPlaceholder('Tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Mật khẩu').fill('admin123');

  // 3. Bấm nút đăng nhập
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // 4. Đợi redirect sang Dashboard — kiểm tra subtitle hiện trên trang chủ
  await expect(page.locator('.page-subtitle')).toContainText('Tổng quan hệ thống quản lý kho', { timeout: 15000 });

  // 5. Lưu state đăng nhập (cookies + localStorage) để các test sau dùng lại
  await page.context().storageState({ path: authFile });
});
