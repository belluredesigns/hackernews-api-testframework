import { HNItem } from '../../../src/api/contracts/IHackerNewsAPI';

/**
 * Item factory class for creating test data.
 * Provides factory methods to create HackerNews items with realistic defaults.
 */
export class ItemFactory {
  /**
   * Creates a mock story item.
   * @param overrides - Optional properties to override default values
   * @returns Mock story item with test data
   */
  static createStory(overrides: Partial<HNItem> = {}): HNItem {
    return {
      id: overrides.id ?? Math.floor(Math.random() * 1000000),
      type: 'story',
      by: overrides.by ?? 'testuser',
      time: overrides.time ?? Math.floor(Date.now() / 1000),
      title: overrides.title ?? 'Test Story Title',
      url: overrides.url ?? 'https://example.com/test-story',
      score: overrides.score ?? 100,
      descendants: overrides.descendants ?? 25,
      kids: overrides.kids ?? [101, 102, 103],
      ...overrides,
    };
  }

  /**
   * Creates a mock comment item.
   * @param overrides - Optional properties to override default values
   * @returns Mock comment item with test data
   */
  static createComment(overrides: Partial<HNItem> = {}): HNItem {
    return {
      id: overrides.id ?? Math.floor(Math.random() * 1000000),
      type: 'comment',
      by: overrides.by ?? 'commenter',
      time: overrides.time ?? Math.floor(Date.now() / 1000),
      text: overrides.text ?? 'This is a test comment',
      parent: overrides.parent ?? 1,
      kids: overrides.kids,
      ...overrides,
    };
  }

  /**
   * Creates a mock job posting item.
   * @param overrides - Optional properties to override default values
   * @returns Mock job item with test data
   */
  static createJob(overrides: Partial<HNItem> = {}): HNItem {
    return {
      id: overrides.id ?? Math.floor(Math.random() * 1000000),
      type: 'job',
      by: overrides.by ?? 'employer',
      time: overrides.time ?? Math.floor(Date.now() / 1000),
      title: overrides.title ?? 'Test Job Posting',
      text: overrides.text ?? 'We are hiring!',
      url: overrides.url ?? 'https://example.com/jobs',
      ...overrides,
    };
  }

  /**
   * Creates a mock poll item.
   * @param overrides - Optional properties to override default values
   * @returns Mock poll item with test data
   */
  static createPoll(overrides: Partial<HNItem> = {}): HNItem {
    return {
      id: overrides.id ?? Math.floor(Math.random() * 1000000),
      type: 'poll',
      by: overrides.by ?? 'pollster',
      time: overrides.time ?? Math.floor(Date.now() / 1000),
      title: overrides.title ?? 'Test Poll',
      text: overrides.text ?? 'What do you think?',
      parts: overrides.parts ?? [201, 202, 203],
      descendants: overrides.descendants ?? 10,
      ...overrides,
    };
  }

  /**
   * Creates a mock deleted item.
   * @param overrides - Optional properties to override default values
   * @returns Mock deleted item with test data
   */
  static createDeletedItem(overrides: Partial<HNItem> = {}): HNItem {
    return {
      id: overrides.id ?? Math.floor(Math.random() * 1000000),
      deleted: true,
      ...overrides,
    };
  }

  /**
   * Creates a mock story with associated comments.
   * @param commentCount - Number of comments to create (default: 3)
   * @returns Object containing the story and array of comments
   */
  static createStoryWithComments(commentCount: number = 3): { story: HNItem; comments: HNItem[] } {
    const storyId = Math.floor(Math.random() * 1000000);
    const comments = Array.from({ length: commentCount }, (_, i) =>
      this.createComment({ id: storyId + i + 1, parent: storyId })
    );

    const story = this.createStory({
      id: storyId,
      kids: comments.map(c => c.id),
    });

    return { story, comments };
  }
}
