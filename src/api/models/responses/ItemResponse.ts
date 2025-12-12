/**
 * Item response interface.
 * Represents the structure of an item response from the HackerNews API.
 */
export interface ItemResponse {
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
 * Story with comment response interface.
 * Represents a story along with its top comment.
 */
export interface StoryWithCommentResponse {
  /** Story title */
  title?: string;
  /** Story URL */
  url?: string;
  /** Text of the top comment */
  top_comment: string;
}
