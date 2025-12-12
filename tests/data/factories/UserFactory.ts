import { HNUser } from '../../../src/api/contracts/IHackerNewsAPI';

/**
 * User factory class for creating test data.
 * Provides factory methods to create HackerNews users with realistic defaults.
 */
export class UserFactory {
  /**
   * Creates a mock user.
   * @param overrides - Optional properties to override default values
   * @returns Mock user with test data
   */
  static createUser(overrides: Partial<HNUser> = {}): HNUser {
    const timestamp = Math.floor(Date.now() / 1000);
    const userId = overrides.id ?? `testuser${Math.floor(Math.random() * 1000)}`;

    return {
      id: userId,
      created: overrides.created ?? timestamp - 86400 * 365,
      karma: overrides.karma ?? Math.floor(Math.random() * 10000),
      about: overrides.about ?? 'This is a test user bio',
      submitted: overrides.submitted ?? [1, 2, 3, 4, 5],
      ...overrides
    };
  }

  /**
   * Creates a mock user with high karma.
   * @param karma - Karma score for the user (default: 50000)
   * @returns Mock user with high karma
   */
  static createHighKarmaUser(karma: number = 50000): HNUser {
    return this.createUser({
      karma,
      about: 'High karma user for testing'
    });
  }

  /**
   * Creates a mock new user.
   * Returns a user created 1 day ago with low karma.
   * @returns Mock new user with minimal activity
   */
  static createNewUser(): HNUser {
    const now = Math.floor(Date.now() / 1000);
    return this.createUser({
      created: now - 86400,
      karma: 10,
      submitted: [1]
    });
  }

  /**
   * Creates a mock active user with many submissions.
   * @param submissionCount - Number of submissions (default: 100)
   * @returns Mock user with high activity
   */
  static createActiveUser(submissionCount: number = 100): HNUser {
    const submissions = Array.from({ length: submissionCount }, (_, i) => i + 1);
    return this.createUser({
      submitted: submissions,
      karma: submissionCount * 50
    });
  }
}
