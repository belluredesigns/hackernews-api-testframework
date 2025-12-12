# Quick Start Guide

## Running Tests Immediately

```bash
# Install dependencies
npm install

# Run all tests
npm test
```

## Common Commands

```bash
# Run tests with UI
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run test:report

# Clean all reports
npm run clean
```

## Writing Your First Test

1. Create a new test file in `tests/specs/`:

```typescript
// tests/specs/my-test.spec.ts
import { test, expect } from '../support/fixtures/apiFixtures';

test.describe('My Test Suite', () => {
  test('my first test', async ({ hackerNewsClient }) => {
    const stories = await hackerNewsClient.getTopStories(5);
    expect(stories.length).toBe(5);
  });
});
```

2. Run your test:

```bash
npm test tests/specs/my-test.spec.ts
```

## Creating a New API Client

1. Define the interface in `src/api/contracts/`:

```typescript
// src/api/contracts/IMyAPI.ts
export interface IMyAPI {
  getData(): Promise<any>;
}
```

2. Create the client in `src/api/clients/`:

```typescript
// src/api/clients/MyAPIClient.ts
import { BaseAPI } from '../../core/base/BaseAPI';
import { IMyAPI } from '../contracts/IMyAPI';

export class MyAPIClient extends BaseAPI implements IMyAPI {
  constructor(baseUrl?: string) {
    super('MyAPI', baseUrl);
  }

  async getData(): Promise<any> {
    const response = await this.get('/endpoint');
    this.validateResponse(response, 200);
    return response.data;
  }
}
```

3. Add fixture in `tests/support/fixtures/`:

```typescript
// Update apiFixtures.ts
export interface APIFixtures {
  hackerNewsClient: HackerNewsClient;
  myAPIClient: MyAPIClient; // Add this
  baseUrl: string;
}

export const test = base.extend<APIFixtures>({
  // ... existing fixtures ...

  myAPIClient: async ({ baseUrl }, use) => {
    const client = new MyAPIClient(baseUrl);
    await use(client);
  }
});
```

4. Use in tests:

```typescript
test('use my api', async ({ myAPIClient }) => {
  const data = await myAPIClient.getData();
  expect(data).toBeDefined();
});
```

## Using Data Factories

```typescript
import { ItemFactory } from '../data/factories/ItemFactory';

// Create a story
const story = ItemFactory.createStory({
  title: 'My Custom Story',
  score: 1000
});

// Create a comment
const comment = ItemFactory.createComment({
  text: 'Great article!'
});

// Create story with comments
const { story, comments } = ItemFactory.createStoryWithComments(5);
```

## Using Test Helpers

```typescript
import { TestHelpers } from '../support/helpers/TestHelpers';

// Validate item structure
TestHelpers.validateItemStructure(item);

// Validate story structure
TestHelpers.validateStoryStructure(story);

// Wait for condition
await TestHelpers.waitForCondition(
  async () => {
    const item = await client.getItem(123);
    return item !== null;
  },
  5000 // timeout in ms
);
```

## Environment Configuration

Create a `.env` file:

```bash
TEST_ENV=dev
BASE_URL=https://hacker-news.firebaseio.com/v0
LOG_LEVEL=INFO
```

Run tests with different environments:

```bash
npm run test:dev        # Development
npm run test:staging    # Staging
npm run test:production # Production
```

## Viewing Reports

After running tests:

```bash
# View HTML report
npm run test:report

# Reports are in:
# - reports/html/index.html (HTML)
# - reports/json/results.json (JSON)
# - reports/junit/results.xml (JUnit)
```

## Debugging Tests

```bash
# Run in debug mode
npm run test:debug

# Run with headed browser
npm run test:headed

# Run specific test file
npm test tests/specs/my-test.spec.ts

# Run tests matching pattern
npm test -- --grep "should validate"
```

## Logging

Access logger in your code:

```typescript
import logger from '../src/core/utils/Logger';

// In tests or anywhere
logger.info('Test started');
logger.debug('Debug info', { data: 123 });
logger.warn('Warning message');
logger.error('Error occurred', error);
```

## Project Structure Cheat Sheet

```
src/
├── core/base/          # Base classes to extend
├── core/http/          # HTTP client & validators
├── core/config/        # Configuration management
├── core/utils/         # Logger & error handling
├── api/clients/        # Your API clients here
├── api/contracts/      # API interfaces here
└── api/models/         # Request/response models here

tests/
├── specs/              # Your test files here
├── data/factories/     # Data generators here
├── data/fixtures/      # Static test data here
└── support/
    ├── fixtures/       # Playwright fixtures here
    ├── helpers/        # Helper functions here
    └── hooks/          # Setup/teardown here
```

## Best Practices Checklist

- ✅ Extend `BaseAPI` for new API clients
- ✅ Use fixtures instead of creating clients in tests
- ✅ Use data factories instead of hardcoded data
- ✅ Use `TestHelpers` for common validations
- ✅ Add proper logging for debugging
- ✅ Validate responses using `ResponseValidator`
- ✅ Handle errors with custom error types
- ✅ Write descriptive test names
- ✅ Keep tests independent
- ✅ Use TypeScript types everywhere

## Troubleshooting

### Tests not found
- Check `testDir` in `playwright.config.ts`
- Ensure test files end with `.spec.ts`
- Ensure test files are in `tests/specs/`

### Module not found
- Run `npm install`
- Check import paths
- Ensure TypeScript is compiled

### Tests failing
- Check logs in console
- Run with `--headed` to see browser
- Check `reports/` for detailed reports
- Enable DEBUG logging in `.env`

### Configuration issues
- Check `.env` file exists
- Verify environment variables
- Check `ConfigManager` settings

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Check [FRAMEWORK_IMPROVEMENTS.md](FRAMEWORK_IMPROVEMENTS.md) for architecture details
3. Review example tests in `tests/specs/`
4. Check framework code in `src/core/` for implementation details

## Quick Tips

- Use `test.only()` to run a single test
- Use `test.skip()` to skip a test
- Use `test.describe.serial()` for sequential execution
- Use `test.beforeEach()` for setup in each test
- Use `expect.soft()` for soft assertions
- Check `playwright.config.ts` for timeout settings

Happy Testing! 🚀
