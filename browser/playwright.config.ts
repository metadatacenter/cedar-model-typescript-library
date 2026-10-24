import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  workers: process.env.CEDAR_TEST_WORKERS ? Number(process.env.CEDAR_TEST_WORKERS) : undefined,
  testDir: '.',
  testMatch: '*.browser.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
