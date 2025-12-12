import { test as base } from '@playwright/test';
import logger from '../utils/Logger';
import configManager from '../config/ConfigManager';

/**
 * Base test context interface.
 * Provides context information available to all tests.
 */
export interface BaseTestContext {
  /** Name of the current test */
  testName: string;
  /** Test start time in milliseconds */
  startTime: number;
}

/**
 * Extended Playwright test fixture with automatic logging.
 * Provides testName and startTime fixtures, and logs test lifecycle events.
 */
export const test = base.extend<BaseTestContext>({
  testName: async ({}, use, testInfo) => {
    const name = testInfo.title;
    await use(name);
  },

  startTime: async ({}, use, testInfo) => {
    const start = Date.now();
    logger.info(`Test started: ${testInfo.title}`);

    await use(start);

    const duration = Date.now() - start;
    const status = testInfo.status;

    if (status === 'passed') {
      logger.info(`Test passed: ${testInfo.title} (${duration}ms)`);
    } else if (status === 'failed') {
      logger.error(`Test failed: ${testInfo.title} (${duration}ms)`, {
        error: testInfo.error?.message,
        stack: testInfo.error?.stack
      });
    } else if (status === 'timedOut') {
      logger.error(`Test timed out: ${testInfo.title} (${duration}ms)`);
    } else if (status === 'skipped') {
      logger.warn(`Test skipped: ${testInfo.title}`);
    }
  }
});

export { expect } from '@playwright/test';

/**
 * Abstract base class for test classes.
 * Provides common logging and configuration access methods for tests.
 */
export abstract class BaseTest {
  protected testContext: BaseTestContext;

  /**
   * Creates a new BaseTest instance.
   * @param context - Test context containing test name and start time
   */
  constructor(context: BaseTestContext) {
    this.testContext = context;
  }

  /**
   * Logs an informational message with the test name prefix.
   * @param message - Message to log
   * @param data - Optional additional data to include
   */
  protected log(message: string, data?: any): void {
    logger.info(`[${this.testContext.testName}] ${message}`, data);
  }

  /**
   * Logs a debug message with the test name prefix.
   * @param message - Message to log
   * @param data - Optional additional data to include
   */
  protected logDebug(message: string, data?: any): void {
    logger.debug(`[${this.testContext.testName}] ${message}`, data);
  }

  /**
   * Logs an error message with the test name prefix.
   * @param message - Message to log
   * @param error - Optional error object to include
   */
  protected logError(message: string, error?: any): void {
    logger.error(`[${this.testContext.testName}] ${message}`, error);
  }

  /**
   * Gets the complete test configuration.
   * @returns Test configuration object
   */
  protected getConfig() {
    return configManager.getConfig();
  }

  /**
   * Gets the current environment configuration.
   * @returns Environment configuration object
   */
  protected getEnvironment() {
    return configManager.getEnvironment();
  }

  /**
   * Gets the base URL for the current environment.
   * @returns Base URL string
   */
  protected getBaseUrl(): string {
    return configManager.getBaseUrl();
  }
}
