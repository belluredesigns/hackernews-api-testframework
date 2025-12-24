/**
 * Edge Case Tests
 *
 * This test suite validates handling of edge cases and boundary conditions.
 * Tests cover unusual but valid scenarios like stories without comments,
 * missing optional fields, special characters, and deeply nested structures.
 *
 * @tags @regression
 */

import { test, expect } from '../support/fixtures/apiFixtures';

/**
 * Test suite for edge cases and boundary conditions.
 * Verifies that the API handles unusual but valid scenarios correctly.
 */
test.describe('@regression Edge Case Tests', () => {
  /**
   * Test: Handle story with no comments
   * Validates that stories without kids array or empty kids are handled correctly
   */
  test('should handle story with no comments', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(20);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && (!story.kids || story.kids.length === 0)) {
        expect(story.id).toBeDefined();
        expect(story.type).toBe('story');
        expect(story.kids === undefined || story.kids.length === 0).toBeTruthy();
        break;
      }
    }
  });

  test('should handle story with no URL', async ({ hackerNewsClient }) => {
    const askStories = await hackerNewsClient.getAskStories(10);

    for (const storyId of askStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && !story.url) {
        expect(story.id).toBeDefined();
        expect(story.title).toBeDefined();
        expect(story.url).toBeUndefined();
        break;
      }
    }
  });

  test('should handle poll with parts', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(50);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.type === 'poll' && story.parts) {
        expect(Array.isArray(story.parts)).toBeTruthy();
        expect(story.parts.length).toBeGreaterThan(0);
        break;
      }
    }
  });

  test('should handle story with very long title', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(100);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.title && story.title.length > 100) {
        expect(story.title.length).toBeGreaterThan(100);
        expect(typeof story.title).toBe('string');
        break;
      }
    }
  });

  test('should handle comment with no text (deleted)', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(20);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.kids && story.kids.length > 0) {
        for (const kidId of story.kids.slice(0, 10)) {
          const comment = await hackerNewsClient.getItem(kidId!);

          if (comment && comment.type === 'comment' && !comment.text) {
            expect(comment.deleted === true || comment.dead === true).toBeTruthy();
            return;
          }
        }
      }
    }
  });

  test('should handle user with no submitted items', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('test_user_no_submissions');

    if (user !== null) {
      expect(user.submitted === undefined || user.submitted?.length === 0).toBeTruthy();
    }
  });

  test('should handle story with score of 0', async ({ hackerNewsClient }) => {
    const newStories = await hackerNewsClient.getNewStories(50);

    for (const storyId of newStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.score === 0) {
        expect(story.score).toBe(0);
        expect(story.id).toBeDefined();
        break;
      }
    }
  });

  test('should handle item with no author (deleted user)', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(50);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && !story.by) {
        expect(story.by).toBeUndefined();
        expect(story.deleted === true || story.dead === true).toBeTruthy();
        break;
      }
    }
  });

  test('should handle deeply nested comments', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(10);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.kids && story.kids.length > 0) {
        const firstKidId = story.kids[0];
        if (firstKidId !== undefined) {
          const firstComment = await hackerNewsClient.getItem(firstKidId);

          if (firstComment && firstComment.kids && firstComment.kids.length > 0) {
            expect(firstComment.kids.length).toBeGreaterThan(0);
            expect(Array.isArray(firstComment.kids)).toBeTruthy();
            break;
          }
        }
      }
    }
  });

  test('should handle job story type', async ({ hackerNewsClient }) => {
    const jobStories = await hackerNewsClient.getJobStories(5);

    expect(jobStories.length).toBeGreaterThan(0);

    const firstJobId = jobStories[0];
    expect(firstJobId).toBeDefined();

    const job = await hackerNewsClient.getItem(firstJobId!);

    if (job) {
      expect(job.type).toBe('job');
      expect(job.title).toBeDefined();
    }
  });

  test('should handle story with special characters in title', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(50);

    for (const storyId of stories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.title && /[<>&"']/.test(story.title)) {
        expect(story.title).toBeDefined();
        expect(typeof story.title).toBe('string');
        break;
      }
    }
  });

  test('should handle user with very high karma', async ({ hackerNewsClient }) => {
    // pg (Paul Graham) is known to have high karma
    const user = await hackerNewsClient.getUser('pg');

    if (user) {
      expect(user.karma).toBeGreaterThan(1000);
      expect(typeof user.karma).toBe('number');
    }
  });

  test('should handle concurrent requests for different items', async ({ hackerNewsClient }) => {
    const ids = [1, 2, 3, 4, 5];

    const promises = ids.map(id => hackerNewsClient.getItem(id));
    const results = await Promise.all(promises);

    expect(results.length).toBe(ids.length);
    results.forEach((item, index) => {
      if (item !== null) {
        expect(item.id).toBe(ids[index]);
      }
    });
  });

  test('should handle concurrent requests for top stories', async ({ hackerNewsClient }) => {
    const promises = [
      hackerNewsClient.getTopStories(5),
      hackerNewsClient.getNewStories(5),
      hackerNewsClient.getBestStories(5),
    ];

    const [topStories, newStories, bestStories] = await Promise.all(promises);

    expect(Array.isArray(topStories)).toBeTruthy();
    expect(Array.isArray(newStories)).toBeTruthy();
    expect(Array.isArray(bestStories)).toBeTruthy();
  });
});
