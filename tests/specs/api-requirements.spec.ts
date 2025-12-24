/**
 * API Requirements Tests
 *
 * This test suite covers specific API requirements:
 * 1. Retrieving top stories with the Top Stories API
 * 2. Using the Top Stories API to retrieve the current top story from the Items API
 * 3. Using the Top Stories API to retrieve a top story, retrieve its first comment using the Items API
 *
 * @tags @smoke @requirements
 */

import { test, expect } from '../support/fixtures/apiFixtures';

test.describe('@smoke @requirements API Requirements Tests', () => {
  /**
   * Requirement 1: Retrieving top stories with the Top Stories API
   *
   * This test verifies that the Top Stories API endpoint:
   * - Returns an array of story IDs
   * - Contains valid numeric IDs
   * - Returns the expected number of stories
   */
  test('Requirement 1: should retrieve top stories with the Top Stories API', async ({
    hackerNewsClient,
  }) => {
    // Retrieve top 10 stories from the Top Stories API
    const topStories = await hackerNewsClient.getTopStories(10);

    // Verify the response is an array
    expect(Array.isArray(topStories)).toBeTruthy();

    // Verify we received stories
    expect(topStories.length).toBeGreaterThan(0);
    expect(topStories.length).toBeLessThanOrEqual(10);

    // Verify each story ID is a valid number
    topStories.forEach(storyId => {
      expect(typeof storyId).toBe('number');
      expect(storyId).toBeGreaterThan(0);
      expect(Number.isInteger(storyId)).toBeTruthy();
    });

    console.log(`Retrieved ${topStories.length} top stories`);
    console.log(`First 5 story IDs: ${topStories.slice(0, 5).join(', ')}`);
  });

  /**
   * Requirement 2: Using the Top Stories API to retrieve the current top story from the Items API
   *
   * This test verifies the workflow:
   * 1. Call Top Stories API to get story IDs
   * 2. Extract the first (current top) story ID
   * 3. Use Items API to retrieve the full story details
   */
  test('Requirement 2: should use Top Stories API to retrieve current top story from Items API', async ({
    hackerNewsClient,
  }) => {
    // Step 1: Get top stories from Top Stories API
    const topStories = await hackerNewsClient.getTopStories(1);

    expect(Array.isArray(topStories)).toBeTruthy();
    expect(topStories.length).toBeGreaterThan(0);

    // Step 2: Extract the current top story ID
    const topStoryId = topStories[0];
    expect(topStoryId).toBeDefined();
    expect(typeof topStoryId).toBe('number');

    console.log(`Current top story ID: ${topStoryId}`);

    // Step 3: Retrieve the full story details using Items API
    const topStory = await hackerNewsClient.getItem(topStoryId);

    // Verify the story was retrieved successfully
    expect(topStory).not.toBeNull();
    expect(topStory).toBeDefined();

    // Verify the story has required fields
    expect(topStory?.id).toBe(topStoryId);
    expect(topStory?.type).toBe('story');
    expect(topStory?.title).toBeDefined();
    expect(typeof topStory?.title).toBe('string');
    expect(topStory?.title.length).toBeGreaterThan(0);

    // Verify story metadata
    expect(topStory?.by).toBeDefined();
    expect(topStory?.time).toBeDefined();
    expect(typeof topStory?.time).toBe('number');

    console.log(`Retrieved top story: "${topStory?.title}"`);
    console.log(`Posted by: ${topStory?.by}`);
    console.log(`Score: ${topStory?.score || 0}`);
  });

  /**
   * Requirement 3: Using the Top Stories API to retrieve a top story,
   * then retrieve its first comment using the Items API
   *
   * This test verifies the workflow:
   * 1. Call Top Stories API to get story IDs
   * 2. Use Items API to retrieve a story with comments
   * 3. Extract the first comment ID from the story's kids array
   * 4. Use Items API to retrieve the first comment details
   */
  test('Requirement 3: should retrieve top story and its first comment using Items API', async ({
    hackerNewsClient,
  }) => {
    // Step 1: Get top stories from Top Stories API
    const topStories = await hackerNewsClient.getTopStories(50);

    expect(Array.isArray(topStories)).toBeTruthy();
    expect(topStories.length).toBeGreaterThan(0);

    console.log(`Retrieved ${topStories.length} top story IDs`);

    // Step 2: Find a story with comments
    let storyWithComments = null;
    let storyId = null;

    for (const id of topStories) {
      const story = await hackerNewsClient.getItem(id);

      if (story && story.kids && story.kids.length > 0) {
        storyWithComments = story;
        storyId = id;
        break;
      }
    }

    // Verify we found a story with comments
    expect(storyWithComments).not.toBeNull();
    expect(storyId).toBeDefined();

    console.log(`Found story with comments - ID: ${storyId}`);
    console.log(`Story title: "${storyWithComments?.title}"`);
    console.log(`Number of comments: ${storyWithComments?.descendants || 0}`);

    // Step 3: Extract the first comment ID from the kids array
    const firstCommentId = storyWithComments?.kids?.[0];

    expect(firstCommentId).toBeDefined();
    expect(typeof firstCommentId).toBe('number');
    expect(firstCommentId).toBeGreaterThan(0);

    console.log(`First comment ID: ${firstCommentId}`);

    // Step 4: Retrieve the first comment using Items API
    const firstComment = await hackerNewsClient.getItem(firstCommentId!);

    // Verify the comment was retrieved successfully
    expect(firstComment).not.toBeNull();
    expect(firstComment).toBeDefined();

    // Verify the comment has required fields
    expect(firstComment?.id).toBe(firstCommentId);
    expect(firstComment?.type).toBe('comment');
    expect(firstComment?.parent).toBe(storyId);
    expect(firstComment?.by).toBeDefined();
    expect(firstComment?.text).toBeDefined();
    expect(typeof firstComment?.text).toBe('string');

    console.log(`Retrieved first comment by: ${firstComment?.by}`);
    console.log(`Comment text length: ${firstComment?.text?.length || 0} characters`);

    // Additional validation: Verify the comment's parent matches the story
    expect(firstComment?.parent).toBe(storyWithComments?.id);
  });

  /**
   * Bonus Test: Verify the complete workflow end-to-end
   *
   * This test combines all three requirements in a single workflow
   */
  test('Bonus: should verify complete API workflow from top stories to comments', async ({
    hackerNewsClient,
  }) => {
    console.log('=== Starting Complete API Workflow Test ===');

    // Part 1: Get top stories
    console.log('\n1. Retrieving top stories...');
    const topStories = await hackerNewsClient.getTopStories(20);
    expect(topStories.length).toBeGreaterThan(0);
    console.log(`   ✓ Retrieved ${topStories.length} story IDs`);

    // Part 2: Get the current top story
    console.log('\n2. Retrieving current top story...');
    const currentTopStoryId = topStories[0];
    const currentTopStory = await hackerNewsClient.getItem(currentTopStoryId);
    expect(currentTopStory).not.toBeNull();
    console.log(`   ✓ Story: "${currentTopStory?.title}"`);
    console.log(`   ✓ Score: ${currentTopStory?.score || 0}`);

    // Part 3: Find and retrieve first comment
    console.log('\n3. Finding story with comments...');
    let targetStory = null;
    let commentId = null;

    for (const id of topStories) {
      const story = await hackerNewsClient.getItem(id);
      if (story?.kids && story.kids.length > 0) {
        targetStory = story;
        commentId = story.kids[0];
        break;
      }
    }

    expect(targetStory).not.toBeNull();
    expect(commentId).toBeDefined();
    console.log(`   ✓ Found story: "${targetStory?.title}"`);
    console.log(`   ✓ Has ${targetStory?.kids?.length || 0} direct replies`);

    console.log('\n4. Retrieving first comment...');
    const comment = await hackerNewsClient.getItem(commentId!);
    expect(comment).not.toBeNull();
    expect(comment?.type).toBe('comment');
    console.log(`   ✓ Comment by: ${comment?.by}`);
    console.log(`   ✓ Comment preview: ${comment?.text?.substring(0, 100)}...`);

    console.log('\n=== Complete API Workflow Test Successful ===');
  });
});
