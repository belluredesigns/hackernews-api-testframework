/**
 * Data-Driven Tests
 *
 * This test suite uses data-driven testing approach with parameterized test cases.
 * Tests validate various endpoints and scenarios using different input parameters
 * to ensure consistent behavior across different data sets.
 *
 * @tags @regression @smoke
 */

import { test, expect } from '../support/fixtures/apiFixtures';

/**
 * Test suite for parameterized and data-driven tests.
 * Uses test data arrays to run the same tests with different inputs.
 */
test.describe('@regression Data-Driven Tests', () => {
  /**
   * Test data for validating different limit parameters.
   * Tests story retrieval with various limit values (1, 5, 10, 25, 50).
   */
  const limitTestCases = [
    { limit: 1, description: 'single item' },
    { limit: 5, description: 'five items' },
    { limit: 10, description: 'ten items' },
    { limit: 25, description: 'twenty-five items' },
    { limit: 50, description: 'fifty items' },
  ];

  limitTestCases.forEach(({ limit, description }) => {
    test(`should retrieve ${description} from top stories`, async ({ hackerNewsClient }) => {
      const stories = await hackerNewsClient.getTopStories(limit);

      expect(Array.isArray(stories)).toBeTruthy();
      expect(stories.length).toBeGreaterThan(0);
      expect(stories.length).toBeLessThanOrEqual(limit);

      stories.forEach(id => {
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
      });
    });
  });

  // Test data for different story endpoints
  const storyEndpoints = [
    { method: 'getTopStories', name: 'top stories' },
    { method: 'getNewStories', name: 'new stories' },
    { method: 'getBestStories', name: 'best stories' },
    { method: 'getAskStories', name: 'ask stories' },
    { method: 'getShowStories', name: 'show stories' },
    { method: 'getJobStories', name: 'job stories' },
  ];

  storyEndpoints.forEach(({ method, name }) => {
    test(`should retrieve ${name} successfully`, async ({ hackerNewsClient }) => {
      const stories = await (hackerNewsClient as any)[method](10);

      expect(Array.isArray(stories)).toBeTruthy();
      expect(stories.length).toBeLessThanOrEqual(10);
      expect(stories.length).toBeGreaterThan(0);

      stories.forEach((id: number) => {
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
      });
    });
  });

  // Test data for invalid item IDs
  const invalidItemIds = [
    { id: -1, description: 'negative ID' },
    { id: 0, description: 'zero ID' },
    { id: 999999999999, description: 'very large ID' },
  ];

  invalidItemIds.forEach(({ id, description }) => {
    test(`should handle ${description} gracefully`, async ({ hackerNewsClient }) => {
      const item = await hackerNewsClient.getItem(id);
      expect(item).toBeNull();
    });
  });

  // Test data for boundary values - split into separate tests
  test('should handle zero limit correctly', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(0);
    expect(Array.isArray(stories)).toBeTruthy();
    expect(stories.length).toBe(0);
  });

  test('should handle minimum limit correctly', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(1);
    expect(Array.isArray(stories)).toBeTruthy();
    expect(stories.length).toBe(1);
  });

  test('should handle large limit correctly', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(100);
    expect(Array.isArray(stories)).toBeTruthy();
    expect(stories.length).toBeLessThanOrEqual(100);
    expect(stories.length).toBeGreaterThan(0);
  });

  // Test data for user IDs - split into positive and negative
  test('should find known user: pg', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('pg');

    expect(user).not.toBeNull();

    const userId = user?.id;
    const userKarma = user?.karma;
    const userCreated = user?.created;

    expect(userId).toBe('pg');
    expect(userKarma).toBeDefined();
    expect(userCreated).toBeDefined();
  });

  test('should find known user: dang', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('dang');

    expect(user).not.toBeNull();

    const userId = user?.id;
    const userKarma = user?.karma;
    const userCreated = user?.created;

    expect(userId).toBe('dang');
    expect(userKarma).toBeDefined();
    expect(userCreated).toBeDefined();
  });

  test('should not find non-existent user', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('thisuserdoesnotexist99999');
    expect(user).toBeNull();
  });

  // Test data for concurrent requests
  const concurrencyLevels = [
    { level: 5, description: '5 concurrent requests' },
    { level: 10, description: '10 concurrent requests' },
    { level: 20, description: '20 concurrent requests' },
  ];

  concurrencyLevels.forEach(({ level, description }) => {
    test(`should handle ${description}`, async ({ hackerNewsClient }) => {
      const topStories = await hackerNewsClient.getTopStories(level);
      const ids = topStories.slice(0, level);

      const promises = ids.map(id => {
        const itemId = id;
        expect(itemId).toBeDefined();
        return hackerNewsClient.getItem(itemId as number);
      });

      const results = await Promise.all(promises);

      expect(results.length).toBe(level);

      // Verify at least some items were retrieved successfully
      const successfulItems = results.filter(item => item !== null);
      expect(successfulItems.length).toBeGreaterThan(0);
    });
  });
});

test.describe('@smoke Parameterized Validation Tests', () => {
  test('should validate story has correct type field', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(5);
    expect(stories.length).toBeGreaterThan(0);

    const firstId = stories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);
    expect(item).not.toBeNull();
    expect(item?.type).toBe('story');
  });

  test('should validate job has correct type field', async ({ hackerNewsClient }) => {
    const jobs = await hackerNewsClient.getJobStories(5);
    expect(jobs.length).toBeGreaterThan(0);

    const firstId = jobs[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);
    expect(item).not.toBeNull();
    expect(item?.type).toBe('job');
  });

  test('should validate id is of type number', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);

    expect(item).not.toBeNull();
    expect(typeof item?.id).toBe('number');
  });

  test('should validate type is of type string', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);

    expect(item).not.toBeNull();
    expect(item?.type).toBeDefined();
    expect(typeof item?.type).toBe('string');
  });

  test('should validate time is of type number', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);

    expect(item).not.toBeNull();
    expect(item?.time).toBeDefined();
    expect(typeof item?.time).toBe('number');
  });

  test('should validate score is of type number for stories', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId as number);

    expect(item).not.toBeNull();
    // Score should exist for stories
    expect(item?.score).toBeDefined();
    expect(typeof item?.score).toBe('number');
  });
});
