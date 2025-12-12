/**
 * User response interface.
 * Represents the structure of a user response from the HackerNews API.
 */
export interface UserResponse {
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
