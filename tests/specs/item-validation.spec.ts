/**
 * Item Validation Tests
 *
 * This test suite validates the structure and content of HackerNews items.
 * Tests ensure that items have required fields, correct data types, and valid relationships.
 */

import { test, expect } from '../support/fixtures/apiFixtures';
import { TestHelpers } from '../support/helpers/TestHelpers';

/**
 * Test suite for validating item properties and structure.
 * Verifies required fields, data types, and item relationships.
 */
test.describe('Item Validation Tests', () => {
  /**
   * Test: Verify item has required ID field
   * Validates that every item has an 'id' property of type number
   */
  test('should validate item has required fields', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId!);

    expect(item).not.toBeNull();
    expect(item).toHaveProperty('id');
    expect(item!.id).toBeDefined();
    expect(typeof item!.id).toBe('number');
  });

  /**
   * Test: Verify story has title field
   * Validates that story items have a non-empty title string
   */
  test('should validate story has title', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(5);

    for (const storyId of topStories.slice(0, 3)) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.type === 'story') {
        expect(story.title).toBeDefined();
        expect(typeof story.title).toBe('string');
        expect(story.title!.length).toBeGreaterThan(0);
        break;
      }
    }
  });

  /**
   * Test: Verify comment has parent reference
   * Validates that comments have a 'parent' field linking to parent item
   */
  test('should validate comment has parent', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(10);

    for (const storyId of topStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.kids && story.kids.length > 0) {
        const firstKid = story.kids[0];
        if (firstKid !== undefined) {
          const comment = await hackerNewsClient.getItem(firstKid);

          if (comment && comment.type === 'comment') {
            TestHelpers.validateCommentStructure(comment);
            expect(comment.parent).toBeDefined();
            expect(typeof comment.parent).toBe('number');
            break;
          }
        }
      }
    }
  });

  /**
   * Test: Verify item timestamp is valid Unix timestamp
   * Validates that 'time' field is a positive number not in the future
   */
  test('should validate item time is unix timestamp', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId!);

    expect(item).not.toBeNull();

    if (item!.time) {
      expect(typeof item!.time).toBe('number');
      expect(item!.time).toBeGreaterThan(0);

      const now = Math.floor(Date.now() / 1000);
      expect(item!.time).toBeLessThanOrEqual(now);
    }
  });

  /**
   * Test: Verify kids array contains valid item IDs
   * Validates that 'kids' array contains only positive numbers
   */
  test('should validate kids array contains numbers', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(10);

    for (const storyId of topStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.kids && story.kids.length > 0) {
        expect(Array.isArray(story.kids)).toBeTruthy();

        story.kids.forEach(kidId => {
          expect(typeof kidId).toBe('number');
          expect(kidId).toBeGreaterThan(0);
        });
        break;
      }
    }
  });
});
