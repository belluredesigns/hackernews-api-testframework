/**
 * Performance Tests
 *
 * This test suite validates API performance and response times.
 * Tests measure response times for various operations, concurrent request handling,
 * and consistency of data across multiple requests.
 *
 * @tags @performance
 */

import { test, expect } from '../support/fixtures/apiFixtures';

/**
 * Test suite for performance benchmarks and load testing.
 * Includes response time validations and concurrent request handling tests.
 */
test.describe('@performance Performance Tests', () => {
  /**
   * Test: Top stories retrieval performance
   * Validates that retrieving top stories completes within acceptable time (< 2s)
   */
  test('should retrieve top stories within acceptable time', async ({ hackerNewsClient }) => {
    const start = performance.now();
    const stories = await hackerNewsClient.getTopStories(10);
    const duration = performance.now() - start;

    expect(Array.isArray(stories)).toBeTruthy();
    expect(stories.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
  });

  test('should retrieve single item within acceptable time', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const start = performance.now();
    const item = await hackerNewsClient.getItem(firstId!);
    const duration = performance.now() - start;

    expect(item).not.toBeNull();
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should retrieve max item ID within acceptable time', async ({ hackerNewsClient }) => {
    const start = performance.now();
    const maxId = await hackerNewsClient.getMaxItemId();
    const duration = performance.now() - start;

    expect(typeof maxId).toBe('number');
    expect(maxId).toBeGreaterThan(0);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should retrieve user within acceptable time', async ({ hackerNewsClient }) => {
    const start = performance.now();
    const user = await hackerNewsClient.getUser('pg');
    const duration = performance.now() - start;

    expect(user).not.toBeNull();
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should handle multiple concurrent item requests efficiently', async ({
    hackerNewsClient,
  }) => {
    const topStories = await hackerNewsClient.getTopStories(10);
    const ids = topStories.slice(0, 5);

    const start = performance.now();
    const promises = ids.map(id => hackerNewsClient.getItem(id!));
    const items = await Promise.all(promises);
    const duration = performance.now() - start;

    expect(items.length).toBe(5);
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });

  test('should maintain consistent response times over multiple requests', async ({
    hackerNewsClient,
  }) => {
    const measurements: number[] = [];
    const iterations = 5;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await hackerNewsClient.getTopStories(10);
      const duration = performance.now() - start;
      measurements.push(duration);
    }

    const average = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const variance =
      measurements.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / measurements.length;
    const stdDev = Math.sqrt(variance);

    expect(average).toBeLessThan(2000);
    expect(stdDev).toBeLessThan(1000); // Response times should be consistent
  });

  test('should handle large limit requests efficiently', async ({ hackerNewsClient }) => {
    const start = performance.now();
    const stories = await hackerNewsClient.getTopStories(500);
    const duration = performance.now() - start;

    expect(Array.isArray(stories)).toBeTruthy();
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });

  test('should retrieve multiple story types concurrently', async ({ hackerNewsClient }) => {
    const start = performance.now();

    const [topStories, newStories, bestStories, askStories, showStories, jobStories] =
      await Promise.all([
        hackerNewsClient.getTopStories(10),
        hackerNewsClient.getNewStories(10),
        hackerNewsClient.getBestStories(10),
        hackerNewsClient.getAskStories(10),
        hackerNewsClient.getShowStories(10),
        hackerNewsClient.getJobStories(10),
      ]);

    const duration = performance.now() - start;

    expect(Array.isArray(topStories)).toBeTruthy();
    expect(Array.isArray(newStories)).toBeTruthy();
    expect(Array.isArray(bestStories)).toBeTruthy();
    expect(Array.isArray(askStories)).toBeTruthy();
    expect(Array.isArray(showStories)).toBeTruthy();
    expect(Array.isArray(jobStories)).toBeTruthy();

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should benchmark average response time for 100 item requests', async ({
    hackerNewsClient,
  }) => {
    const topStories = await hackerNewsClient.getTopStories(100);
    const measurements: number[] = [];

    for (let i = 0; i < 10; i++) {
      const randomId = topStories[Math.floor(Math.random() * topStories.length)];
      if (randomId !== undefined) {
        const start = performance.now();
        await hackerNewsClient.getItem(randomId);
        const duration = performance.now() - start;
        measurements.push(duration);
      }
    }

    const average = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const p95 = measurements.sort((a, b) => a - b)[Math.floor(measurements.length * 0.95)] || 0;

    expect(average).toBeLessThan(1000); // Average should be under 1 second
    expect(p95).toBeLessThan(2000); // 95th percentile should be under 2 seconds
  });

  test('should handle rapid sequential requests without degradation', async ({
    hackerNewsClient,
  }) => {
    const measurements: number[] = [];
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await hackerNewsClient.getTopStories(5);
      const duration = performance.now() - start;
      measurements.push(duration);
    }

    const firstHalf = measurements.slice(0, iterations / 2);
    const secondHalf = measurements.slice(iterations / 2);

    const avgFirst = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    // Second half should not be significantly slower than first half
    expect(avgSecond).toBeLessThan(avgFirst * 1.5);
  });
});

test.describe('@performance Load Tests', () => {
  test('should handle 50 concurrent item requests', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(50);

    const start = performance.now();
    const promises = topStories.map(id => hackerNewsClient.getItem(id!));
    const results = await Promise.all(promises);
    const duration = performance.now() - start;

    expect(results.length).toBe(50);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  test('should handle repeated requests to same endpoint', async ({ hackerNewsClient }) => {
    const iterations = 20;
    const measurements: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await hackerNewsClient.getMaxItemId();
      const duration = performance.now() - start;
      measurements.push(duration);
    }

    const average = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;

    expect(average).toBeLessThan(1000);
    measurements.forEach(duration => {
      expect(duration).toBeLessThan(2000);
    });
  });
});
