import { defineConfig, devices } from '@playwright/test';

/** E2E de los flujos de conversión (HU-01 a HU-06) sobre la web estática compilada. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4321', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PW_CHROMIUM
          ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } }
          : {}),
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        ...(process.env.PW_CHROMIUM
          ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } }
          : {}),
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @kreatya/web preview --port 4321',
      url: 'http://localhost:4321',
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter @kreatya/admin preview --port 4322',
      url: 'http://localhost:4322',
      reuseExistingServer: true,
    },
  ],
});
