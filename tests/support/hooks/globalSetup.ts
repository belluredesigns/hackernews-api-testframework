import logger, { LogLevel } from '../../../src/core/utils/Logger';
import configManager from '../../../src/core/config/ConfigManager';

/**
 * Global test setup function.
 * Runs once before all tests to initialize configuration and logging.
 * Displays test environment settings.
 */
async function globalSetup() {
  const config = configManager.getConfig();

  const logLevel = config.logging.level as LogLevel;
  logger.setLogLevel(logLevel);

  logger.info('=== Global Test Setup ===');
  logger.info(`Environment: ${config.environment.name}`);
  logger.info(`Base URL: ${config.environment.baseUrl}`);
  logger.info(`Timeout: ${config.environment.timeout}ms`);
  logger.info(`Retries: ${config.environment.retries}`);
  logger.info(`Log Level: ${config.logging.level}`);
  logger.info('========================');
}

export default globalSetup;
