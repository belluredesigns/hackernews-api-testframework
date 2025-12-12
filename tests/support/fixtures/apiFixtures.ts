import { test as base } from '../../../src/core/base/BaseTest';
import { HackerNewsClient } from '../../../src/api/clients/HackerNewsClient';
import configManager from '../../../src/core/config/ConfigManager';

/**
 * API test fixtures interface.
 * Defines fixtures available to API tests.
 */
export interface APIFixtures {
  /** Initialized HackerNewsClient instance */
  hackerNewsClient: HackerNewsClient;
  /** Base URL for the API */
  baseUrl: string;
}

/**
 * Extended test fixture for API testing.
 * Provides hackerNewsClient and baseUrl fixtures to all tests.
 */
export const test = base.extend<APIFixtures>({
  baseUrl: async ({}, use) => {
    const url = configManager.getBaseUrl();
    await use(url);
  },

  hackerNewsClient: async ({ baseUrl }, use) => {
    const client = new HackerNewsClient(baseUrl);
    await use(client);
  }
});

export { expect } from '@playwright/test';
