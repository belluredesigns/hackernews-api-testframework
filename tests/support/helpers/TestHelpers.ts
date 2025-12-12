import { expect } from '@playwright/test';
import { HNItem } from '../../../src/api/contracts/IHackerNewsAPI';

/**
 * Test helper utility class.
 * Provides common utility methods for test validation and data manipulation.
 */
export class TestHelpers {
  /**
   * Waits for a condition to become true within a timeout period.
   * @param condition - Async function that returns true when condition is met
   * @param timeout - Maximum time to wait in milliseconds (default: 5000)
   * @param interval - Polling interval in milliseconds (default: 100)
   * @throws {Error} If condition is not met within timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.delay(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Creates a delay promise.
   * @param ms - Number of milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validates that an item has the expected structure and field types.
   * Uses Playwright expect assertions.
   * @param item - HackerNews item to validate
   */
  static validateItemStructure(item: HNItem): void {
    expect(item).toBeDefined();
    expect(item.id).toBeDefined();
    expect(typeof item.id).toBe('number');

    if (item.type) {
      expect(['job', 'story', 'comment', 'poll', 'pollopt']).toContain(item.type);
    }

    if (item.time) {
      expect(typeof item.time).toBe('number');
      expect(item.time).toBeGreaterThan(0);
    }

    if (item.kids) {
      expect(Array.isArray(item.kids)).toBeTruthy();
      item.kids.forEach(kid => {
        expect(typeof kid).toBe('number');
      });
    }
  }

  /**
   * Validates that a story has the expected structure and required fields.
   * Uses Playwright expect assertions.
   * @param story - HackerNews story to validate
   */
  static validateStoryStructure(story: HNItem): void {
    this.validateItemStructure(story);
    expect(story.type).toBe('story');
    expect(story.title).toBeDefined();
    expect(typeof story.title).toBe('string');
  }

  /**
   * Validates that a comment has the expected structure and required fields.
   * Uses Playwright expect assertions.
   * @param comment - HackerNews comment to validate
   */
  static validateCommentStructure(comment: HNItem): void {
    this.validateItemStructure(comment);
    expect(comment.type).toBe('comment');
    expect(comment.parent).toBeDefined();
    expect(typeof comment.parent).toBe('number');
  }

  /**
   * Returns a random element from an array.
   * @template T - Type of array elements
   * @param array - Array to select from
   * @returns Random element from the array
   * @throws {Error} If array is empty or index out of bounds
   */
  static getRandomElement<T>(array: T[]): T {
    const index = Math.floor(Math.random() * array.length);
    const element = array[index];
    if (element === undefined) {
      throw new Error('Array is empty or index out of bounds');
    }
    return element;
  }

  /**
   * Generates a random alphanumeric string.
   * @param length - Length of the string to generate (default: 10)
   * @returns Random string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sorts an array of objects by a specific property.
   * Returns a new array without modifying the original.
   * @template T - Type of array elements
   * @param array - Array to sort
   * @param property - Property name to sort by
   * @param order - Sort order: 'asc' or 'desc' (default: 'asc')
   * @returns New sorted array
   */
  static sortByProperty<T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
