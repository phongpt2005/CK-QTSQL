import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Chạy tuần tự để đảm bảo logic DB khóa không bị ảnh hưởng bởi nhiều luồng test cùng lúc
  reporter: 'html',
  timeout: 60000, // 60s cho mỗi test (luồng E2E dài hơn unit test)
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    actionTimeout: 15000,   // 15s timeout cho mỗi action (click, fill, ...)
    navigationTimeout: 30000, // 30s cho navigation
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Khởi động server (Tùy chọn nếu muốn tự chạy)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
