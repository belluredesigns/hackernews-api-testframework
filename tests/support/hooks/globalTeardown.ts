import logger from '../../../src/core/utils/Logger';

/**
 * Global test teardown function.
 * Runs once after all tests to perform cleanup and log completion.
 */
async function globalTeardown() {
  logger.info('=== Global Test Teardown ===');
  logger.info('All tests completed');
  logger.info('============================');
}

export default globalTeardown;
