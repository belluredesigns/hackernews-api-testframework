/**
 * Hacker News item interface.
 * Represents a HackerNews item (story, comment, job, poll, etc.).
 */
export interface HNItem {
  /** Unique item identifier */
  id: number;
  /** True if the item is deleted */
  deleted?: boolean;
  /** Type of item */
  type?: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
  /** Username of the item's author */
  by?: string;
  /** Creation time (Unix timestamp) */
  time?: number;
  /** Item text (comment body, poll text, etc.) */
  text?: string;
  /** True if the item is dead */
  dead?: boolean;
  /** Parent item ID (for comments) */
  parent?: number;
  /** Associated poll ID (for poll options) */
  poll?: number;
  /** IDs of child comments */
  kids?: number[];
  /** URL of the story */
  url?: string;
  /** Story score (points) */
  score?: number;
  /** Story or poll title */
  title?: string;
  /** List of related poll option IDs (for polls) */
  parts?: number[];
  /** Total comment count */
  descendants?: number;
}

/**
 * Hacker News user interface.
 * Represents a HackerNews user profile.
 */
export interface HNUser {
  /** Username */
  id: string;
  /** Account creation time (Unix timestamp) */
  created: number;
  /** User's karma score */
  karma: number;
  /** User's self-description (HTML) */
  about?: string;
  /** List of the user's submitted item IDs */
  submitted?: number[];
}

/**
 * Hacker News API contract interface.
 * Defines the methods that must be implemented by HackerNews API clients.
 */
export interface IHackerNewsAPI {
  /**
   * Retrieves an item by its ID.
   * @param itemId - Unique item identifier
   * @returns Promise resolving to the item, or null if not found
   */
  getItem(itemId: number): Promise<HNItem | null>;

  /**
   * Retrieves top story IDs.
   * @param limit - Maximum number of stories to return (default: 500)
   * @returns Promise resolving to array of story IDs
   */
  getTopStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves new story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  getNewStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves best story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  getBestStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves Ask HN story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  getAskStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves Show HN story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  getShowStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves job story IDs.
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Promise resolving to array of story IDs
   */
  getJobStories(limit?: number): Promise<number[]>;

  /**
   * Retrieves a user by their username.
   * @param userId - Username to retrieve
   * @returns Promise resolving to the user, or null if not found
   */
  getUser(userId: string): Promise<HNUser | null>;

  /**
   * Retrieves the maximum item ID.
   * @returns Promise resolving to the maximum item ID
   */
  getMaxItemId(): Promise<number>;
}
