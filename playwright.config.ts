import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'https://hacker-news.firebaseio.com/v0';

export default defineConfig({
  testDir: './tests/specs',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  timeout: 30000,

  expect: {
    timeout: 5000
  },

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/json/results.json' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['list']
  ],

  use: {
    baseURL,

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    extraHTTPHeaders: {
      'Accept': 'application/json',
    },

    actionTimeout: 10000,
  },

  globalSetup: './tests/support/hooks/globalSetup.ts',
  globalTeardown: './tests/support/hooks/globalTeardown.ts',

  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
