import { BaseAPI } from '../../core/base/BaseAPI';
import { IHackerNewsAPI, HNItem, HNUser } from '../contracts/IHackerNewsAPI';
import { ItemResponse, StoryWithCommentResponse } from '../models/responses/ItemResponse';
import { UserResponse } from '../models/responses/UserResponse';
import { ResponseValidator } from '../../core/http/ResponseValidator';

/**
 * Hacker News API Client.
 * Implements the IHackerNewsAPI interface to interact with the HackerNews Firebase API.
 * Provides methods to retrieve stories, items, users, and other HackerNews data.
 */
export class HackerNewsClient extends BaseAPI implements IHackerNewsAPI {
  /**
   * Creates a new HackerNewsClient instance.
   * @param baseUrl - Optional custom base URL (defaults to official HackerNews API)
   */
  constructor(baseUrl?: string) {
    super('HackerNews', baseUrl || 'https://hacker-news.firebaseio.com/v0');
  }

  /**
   * Retrieves an item by its ID.
   * @param itemId - Unique item identifier
   * @returns Promise resolving to the item, or null if not found or response is unsuccessful
   */
  async getItem(itemId: number): Promise<HNItem | null> {
    const response = await this.get<ItemResponse>(`/item/${itemId}.json`);

    if (!response.ok || response.data === null) {
      return null;
    }

    this.validateRequired(response.data, ['id']);
    return response.data;
  }

  /**
   * Retrieves top story IDs.
   * @param limit - Maximum number of stories to return (default: 500)
   * @returns Promise resolving to array of story IDs
   */
  async getTopStories(limit: number = 500): Promise<number[]> {
    const response = await this.get<number[]>('/topstories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');
    ResponseValidator.validateArrayNotEmpty({ data }, 'data');

    return data.slice(0, limit);
  }

  /**
   * Retrieves new story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  async getNewStories(limit: number = 10): Promise<number[]> {
    const response = await this.get<number[]>('/newstories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');
    ResponseValidator.validateArrayNotEmpty({ data }, 'data');

    return data.slice(0, limit);
  }

  /**
   * Retrieves best story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  async getBestStories(limit: number = 10): Promise<number[]> {
    const response = await this.get<number[]>('/beststories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');
    ResponseValidator.validateArrayNotEmpty({ data }, 'data');

    return data.slice(0, limit);
  }

  /**
   * Retrieves Ask HN story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  async getAskStories(limit: number = 10): Promise<number[]> {
    const response = await this.get<number[]>('/askstories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');

    return data.slice(0, limit);
  }

  /**
   * Retrieves Show HN story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  async getShowStories(limit: number = 10): Promise<number[]> {
    const response = await this.get<number[]>('/showstories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');

    return data.slice(0, limit);
  }

  /**
   * Retrieves job story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  async getJobStories(limit: number = 10): Promise<number[]> {
    const response = await this.get<number[]>('/jobstories.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'array');

    return data.slice(0, limit);
  }

  /**
   * Retrieves a user by their username.
   * @param userId - Username to retrieve
   * @returns Promise resolving to the user, or null if not found or response is unsuccessful
   */
  async getUser(userId: string): Promise<HNUser | null> {
    const response = await this.get<UserResponse>(`/user/${userId}.json`);

    if (!response.ok || response.data === null) {
      return null;
    }

    this.validateRequired(response.data, ['id', 'created', 'karma']);
    return response.data;
  }

  /**
   * Retrieves the maximum item ID.
   * Returns the largest item ID currently in the system.
   * @returns Promise resolving to the maximum item ID
   */
  async getMaxItemId(): Promise<number> {
    const response = await this.get<number>('/maxitem.json');
    this.validateResponse(response, 200);

    const data = response.data;
    this.validateType({ data }, 'data', 'number');

    return data;
  }

  /**
   * Retrieves the top story with its top comment.
   * Fetches the first top story and its first child comment.
   * @returns Promise resolving to story with comment, or null if no stories available
   */
  async getTopStoryWithComment(): Promise<StoryWithCommentResponse | null> {
    const ids = await this.getTopStories(1);
    if (!ids || ids.length === 0) return null;

    const firstId = ids[0];
    if (firstId === undefined) return null;

    const story = await this.getItem(firstId);
    if (!story) return null;

    const result: StoryWithCommentResponse = {
      title: story.title,
      url: story.url,
      top_comment: 'No comments found.',
    };

    if (story.kids && Array.isArray(story.kids) && story.kids.length > 0) {
      const firstKid = story.kids[0];
      if (firstKid !== undefined) {
        const firstComment = await this.getItem(firstKid);
        if (firstComment && firstComment.text) {
          result.top_comment = firstComment.text;
        }
      }
    }

    return result;
  }
}
