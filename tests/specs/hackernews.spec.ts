/**
 * HackerNews API Smoke Tests
 *
 * This test suite contains smoke tests for the HackerNews API.
 * These tests verify basic API functionality and ensure core features work correctly.
 *
 * @tags @smoke
 */

import { test, expect } from '../support/fixtures/apiFixtures';
import { TestHelpers } from '../support/helpers/TestHelpers';

/**
 * Smoke test suite for HackerNews API basic functionality.
 * Tests core endpoints and basic data retrieval operations.
 */
test.describe('@smoke HackerNews API Tests', () => {
  /**
   * Test: Verify retrieval of top story IDs
   * Validates that top stories endpoint returns valid array of story IDs
   */
  test('@smoke should retrieve top story IDs', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(500);

    expect(Array.isArray(topStories)).toBeTruthy();
    expect(topStories.length).toBeGreaterThan(0);
    expect(topStories.length).toBeLessThanOrEqual(500);
    topStories.forEach(id => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });
  });

  /**
   * Test: Verify retrieval of a single item by ID
   * Validates that getItem returns a valid item with proper structure
   */
  test('should retrieve a single item by ID', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const itemId = topStories[0];
    expect(itemId).toBeDefined();

    const item = await hackerNewsClient.getItem(itemId || 0);
    console.log('Item:', JSON.stringify(item, null, 2));

    expect(item).not.toBeNull();
    TestHelpers.validateItemStructure(item!);
  });

  /**
   * Test: Verify retrieval of top story with its top comment
   * Validates that getTopStoryWithComment returns story details and comment text
   */
  test('should retrieve top story with comment', async ({ hackerNewsClient }) => {
    const result = await hackerNewsClient.getTopStoryWithComment();

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('top_comment');

    expect(typeof result?.title).toBe('string');
    expect(typeof result?.top_comment).toBe('string');
  });

  /**
   * Test: Verify retrieval of new story IDs
   * Validates that new stories endpoint returns valid array
   */
  test('should retrieve new stories', async ({ hackerNewsClient }) => {
    const newStories = await hackerNewsClient.getNewStories(10);

    expect(Array.isArray(newStories)).toBeTruthy();
    expect(newStories.length).toBeGreaterThan(0);
    expect(newStories.length).toBeLessThanOrEqual(10);
  });

  /**
   * Test: Verify retrieval of best story IDs
   * Validates that best stories endpoint returns valid array
   */
  test('should retrieve best stories', async ({ hackerNewsClient }) => {
    const bestStories = await hackerNewsClient.getBestStories(5);

    expect(Array.isArray(bestStories)).toBeTruthy();
    expect(bestStories.length).toBeGreaterThan(0);
    expect(bestStories.length).toBeLessThanOrEqual(5);
  });

  /**
   * Test: Verify retrieval of Ask HN story IDs
   * Validates that ask stories endpoint returns valid array
   */
  test('should retrieve ask stories', async ({ hackerNewsClient }) => {
    const askStories = await hackerNewsClient.getAskStories(5);

    expect(Array.isArray(askStories)).toBeTruthy();
    expect(askStories.length).toBeLessThanOrEqual(5);
  });

  /**
   * Test: Verify retrieval of Show HN story IDs
   * Validates that show stories endpoint returns valid array
   */
  test('should retrieve show stories', async ({ hackerNewsClient }) => {
    const showStories = await hackerNewsClient.getShowStories(5);

    expect(Array.isArray(showStories)).toBeTruthy();
    expect(showStories.length).toBeLessThanOrEqual(5);
  });

  /**
   * Test: Verify retrieval of job posting IDs
   * Validates that job stories endpoint returns valid array
   */
  test('should retrieve job stories', async ({ hackerNewsClient }) => {
    const jobStories = await hackerNewsClient.getJobStories(5);

    expect(Array.isArray(jobStories)).toBeTruthy();
    expect(jobStories.length).toBeLessThanOrEqual(5);
  });

  /**
   * Test: Verify retrieval of maximum item ID
   * Validates that getMaxItemId returns a positive number
   */
  test('should retrieve max item ID', async ({ hackerNewsClient }) => {
    const maxItemId = await hackerNewsClient.getMaxItemId();

    expect(typeof maxItemId).toBe('number');
    expect(maxItemId).toBeGreaterThan(0);
  });

  /**
   * Test: Verify handling of non-existent item
   * Validates that requesting an invalid item ID returns null
   */
  test('should return null for non-existent item', async ({ hackerNewsClient }) => {
    const item = await hackerNewsClient.getItem(999999999);

    expect(item).toBeNull();
  });

  /**
   * Test: Verify story data structure validation
   * Validates that a story has all required fields and correct types
   */
  test('should validate story structure', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const story = await hackerNewsClient.getItem(firstId!);

    expect(story).not.toBeNull();
    expect(story?.type).toBe('story');
    TestHelpers.validateStoryStructure(story!);
  });
});
