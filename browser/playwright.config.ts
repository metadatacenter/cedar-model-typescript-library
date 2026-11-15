import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  // A focused test would run alone in CI and pass, so CI refuses one. Every run is a first attempt.
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CEDAR_TEST_WORKERS ? Number(process.env.CEDAR_TEST_WORKERS) : undefined,
  testDir: '.',
  testMatch: '*.browser.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
