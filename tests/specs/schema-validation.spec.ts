/**
 * Schema Validation Tests
 *
 * This test suite validates data against JSON schemas using AJV.
 * Tests ensure that API responses conform to defined schemas for items, stories, comments, jobs, and users.
 *
 * @tags @smoke
 */

import { test, expect } from '../support/fixtures/apiFixtures';
import {
  validateItem,
  validateStory,
  validateComment,
  validateJob,
} from '../../src/api/schemas/item.schema';
import { validateUser } from '../../src/api/schemas/user.schema';

/**
 * Test suite for JSON schema validation.
 * Uses AJV validators to ensure API responses match expected schemas.
 */
test.describe('@smoke Schema Validation Tests', () => {
  /**
   * Test: Validate item against item schema
   * Verifies that a top story conforms to the generic item schema
   */
  test('should validate item schema for top story', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(1);
    const firstId = topStories[0];
    expect(firstId).toBeDefined();

    const item = await hackerNewsClient.getItem(firstId!);
    expect(item).not.toBeNull();

    const isValid = validateItem(item);
    expect(isValid).toBeTruthy();

    if (!isValid && validateItem.errors) {
      console.error('Validation errors:', validateItem.errors);
    }
  });

  /**
   * Test: Validate story against story schema
   * Verifies that a story item conforms to the strict story schema with required fields
   */
  test('should validate story schema for actual story', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(10);

    for (const storyId of topStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.type === 'story') {
        const isValid = validateStory(story);
        expect(isValid).toBeTruthy();

        if (!isValid && validateStory.errors) {
          console.error('Story validation errors:', validateStory.errors);
        }
        break;
      }
    }
  });

  /**
   * Test: Validate comment against comment schema
   * Verifies that a comment item conforms to the comment schema with required fields
   */
  test('should validate comment schema for actual comment', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(10);

    for (const storyId of topStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.kids && story.kids.length > 0) {
        const firstKid = story.kids[0];
        if (firstKid !== undefined) {
          const comment = await hackerNewsClient.getItem(firstKid);

          if (comment && comment.type === 'comment' && comment.text) {
            const isValid = validateComment(comment);
            expect(isValid).toBeTruthy();

            if (!isValid && validateComment.errors) {
              console.error('Comment validation errors:', validateComment.errors);
            }
            break;
          }
        }
      }
    }
  });

  /**
   * Test: Validate job against job schema
   * Verifies that a job posting conforms to the job schema with required fields
   */
  test('should validate job schema for actual job', async ({ hackerNewsClient }) => {
    const jobStories = await hackerNewsClient.getJobStories(5);
    expect(jobStories.length).toBeGreaterThan(0);

    const firstJobId = jobStories[0];
    expect(firstJobId).toBeDefined();

    const job = await hackerNewsClient.getItem(firstJobId!);

    if (job && job.type === 'job') {
      const isValid = validateJob(job);
      expect(isValid).toBeTruthy();

      if (!isValid && validateJob.errors) {
        console.error('Job validation errors:', validateJob.errors);
      }
    }
  });

  /**
   * Test: Validate user against user schema
   * Verifies that a user profile conforms to the user schema
   */
  test('should validate user schema for actual user', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('pg');
    expect(user).not.toBeNull();

    const isValid = validateUser(user);
    expect(isValid).toBeTruthy();

    if (!isValid && validateUser.errors) {
      console.error('User validation errors:', validateUser.errors);
    }
  });

  /**
   * Test: Validate multiple items against schema
   * Verifies that a batch of items all pass schema validation
   */
  test('should validate multiple items against schema', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(10);
    const validationResults: boolean[] = [];

    for (const storyId of topStories.slice(0, 5)) {
      const item = await hackerNewsClient.getItem(storyId);

      if (item) {
        const isValid = validateItem(item);
        validationResults.push(isValid);

        if (!isValid && validateItem.errors) {
          console.error(`Item ${item.id} validation errors:`, validateItem.errors);
        }
      }
    }

    expect(validationResults.every(result => result === true)).toBeTruthy();
  });

  /**
   * Test: Verify all required story fields are present
   * Validates that stories have all mandatory fields defined
   */
  test('should validate all required fields are present in story', async ({ hackerNewsClient }) => {
    const topStories = await hackerNewsClient.getTopStories(5);

    for (const storyId of topStories) {
      const story = await hackerNewsClient.getItem(storyId);

      if (story && story.type === 'story') {
        expect(story.id).toBeDefined();
        expect(story.type).toBe('story');
        expect(story.title).toBeDefined();
        expect(story.by).toBeDefined();
        expect(story.time).toBeDefined();
        break;
      }
    }
  });

  /**
   * Test: Verify all required user fields are present
   * Validates that users have all mandatory fields with correct types
   */
  test('should validate all required fields are present in user', async ({ hackerNewsClient }) => {
    const user = await hackerNewsClient.getUser('pg');
    expect(user).not.toBeNull();

    if (user) {
      expect(user.id).toBeDefined();
      expect(user!.created).toBeDefined();
      expect(user!.karma).toBeDefined();

      expect(typeof user!.id).toBe('string');
      expect(typeof user!.created).toBe('number');
      expect(typeof user.karma).toBe('number');
    }
  });
});
