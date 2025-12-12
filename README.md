# HackerNews API Test Framework

A comprehensive API testing framework for the HackerNews API built with Playwright and TypeScript, following industry best practices and scalable architecture patterns.

## Framework Architecture

This framework follows a layered architecture pattern:

```
src/
├── core/                 # Core framework components
│   ├── base/            # Base classes (BaseAPI, BaseTest, BasePage)
│   ├── config/          # Configuration management
│   ├── http/            # HTTP client layer
│   └── utils/           # Core utilities (Logger, ErrorHandler)
├── api/                 # API layer
│   ├── clients/         # API service clients
│   ├── models/          # Request/Response models
│   └── contracts/       # API contracts/interfaces
tests/
├── specs/               # Test specifications
├── data/                # Test data
│   ├── factories/       # Data factories
│   └── fixtures/        # Static fixtures
├── suites/              # Test suites organization
└── support/             # Test support
    ├── hooks/           # Global hooks
    ├── fixtures/        # Playwright fixtures
    └── helpers/         # Test helpers
```

## Features

- **Layered Architecture**: Separation of concerns with core, API, and test layers
- **Base Classes**: Reusable `BaseAPI`, `BaseTest`, and `BasePage` for consistent patterns
- **HTTP Client**: Abstracted HTTP layer with retry logic and error handling
- **Response Validation**: Built-in schema and response validators
- **Configuration Management**: Environment-specific configurations
- **Structured Logging**: Comprehensive logging with different log levels
- **Error Handling**: Centralized error handling with custom error types
- **Data Factories**: Dynamic test data generation
- **Test Fixtures**: Reusable Playwright fixtures for API clients
- **Multiple Reporters**: HTML, JSON, and JUnit reports
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for first-time setup)
npx playwright install
```

**Note**: The `npx playwright install` command downloads the necessary browser binaries. This is required when cloning the repository for the first time or when Playwright is updated.

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Environment variables:
- `TEST_ENV`: Environment name (dev, staging, production)
- `BASE_URL`: API base URL
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR)
- `LOGGING_ENABLED`: Enable/disable logging
- `REPORT_DIR`: Reports output directory
- `REPORT_FORMAT`: Report formats (html,json,junit)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# Run tests for specific environment
npm run test:dev
npm run test:staging
npm run test:production

# View test report
npm run test:report

# Clean reports and artifacts
npm run clean
```

## Project Structure

### Core Layer

**BaseAPI** ([src/core/base/BaseAPI.ts](src/core/base/BaseAPI.ts))
- Base class for all API clients
- Provides HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Built-in response validation
- Logging integration

**BaseTest** ([src/core/base/BaseTest.ts](src/core/base/BaseTest.ts))
- Base class for test suites
- Test lifecycle management
- Access to configuration
- Logging helpers

**HttpClient** ([src/core/http/HttpClient.ts](src/core/http/HttpClient.ts))
- Abstracted HTTP client with fetch
- Automatic retry logic
- Timeout handling
- Request/response logging

**ResponseValidator** ([src/core/http/ResponseValidator.ts](src/core/http/ResponseValidator.ts))
- Schema validation
- Type validation
- Required field validation
- Pattern matching

**ConfigManager** ([src/core/config/ConfigManager.ts](src/core/config/ConfigManager.ts))
- Environment configuration
- Centralized config access
- Runtime config switching

**Logger** ([src/core/utils/Logger.ts](src/core/utils/Logger.ts))
- Structured logging
- Log levels (DEBUG, INFO, WARN, ERROR)
- Timestamp formatting

**ErrorHandler** ([src/core/utils/ErrorHandler.ts](src/core/utils/ErrorHandler.ts))
- Custom error types
- Centralized error handling
- Error logging

### API Layer

**HackerNewsClient** ([src/api/clients/HackerNewsClient.ts](src/api/clients/HackerNewsClient.ts))
- Extends BaseAPI
- Implements IHackerNewsAPI interface
- Methods for all HackerNews endpoints
- Built-in validation

**Contracts** ([src/api/contracts/](src/api/contracts/))
- TypeScript interfaces for API contracts
- Type definitions for responses

**Models** ([src/api/models/](src/api/models/))
- Request/Response models
- Type-safe data structures

### Test Layer

**Test Fixtures** ([tests/support/fixtures/apiFixtures.ts](tests/support/fixtures/apiFixtures.ts))
- Reusable Playwright fixtures
- Pre-configured API clients
- Automatic cleanup

**Data Factories** ([tests/data/factories/](tests/data/factories/))
- Dynamic test data generation
- Customizable data creation
- Realistic test scenarios

**Test Helpers** ([tests/support/helpers/TestHelpers.ts](tests/support/helpers/TestHelpers.ts))
- Reusable validation methods
- Common test utilities
- Helper functions

**Global Hooks** ([tests/support/hooks/](tests/support/hooks/))
- Global setup/teardown
- Environment initialization
- Logging configuration

## Writing Tests

### Basic Test

```typescript
import { test, expect } from '../support/fixtures/apiFixtures';

test.describe('My Test Suite', () => {
  test('should retrieve data', async ({ hackerNewsClient }) => {
    const data = await hackerNewsClient.getTopStories(5);

    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
  });
});
```

### Using Test Helpers

```typescript
import { TestHelpers } from '../support/helpers/TestHelpers';

test('should validate item structure', async ({ hackerNewsClient }) => {
  const item = await hackerNewsClient.getItem(1);

  TestHelpers.validateItemStructure(item!);
});
```

### Using Data Factories

```typescript
import { ItemFactory } from '../data/factories/ItemFactory';

const story = ItemFactory.createStory({
  title: 'Custom Story Title',
  score: 1000
});
```

## Creating New API Clients

1. Create interface in `src/api/contracts/`
2. Create models in `src/api/models/`
3. Extend `BaseAPI` in `src/api/clients/`
4. Implement interface methods
5. Add fixtures in `tests/support/fixtures/`

Example:

```typescript
import { BaseAPI } from '../../core/base/BaseAPI';

export class MyAPIClient extends BaseAPI {
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

## Reports

Test reports are generated in the `reports/` directory:
- **HTML Report**: `reports/html/index.html`
- **JSON Report**: `reports/json/results.json`
- **JUnit Report**: `reports/junit/results.xml`

## CI/CD Integration

The framework is CI/CD ready with:
- Environment variable support
- Multiple report formats
- Retry configuration
- Parallel execution support

Example GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test
  env:
    TEST_ENV: staging
    CI: true
```

## Best Practices

1. **Use Base Classes**: Extend `BaseAPI` for API clients and `BaseTest` for test suites
2. **Use Fixtures**: Leverage Playwright fixtures for dependency injection
3. **Use Factories**: Create test data using factories instead of hardcoding
4. **Validate Responses**: Use `ResponseValidator` for comprehensive validation
5. **Log Appropriately**: Use different log levels for different scenarios
6. **Handle Errors**: Use custom error types for better error handling
7. **Type Everything**: Leverage TypeScript for type safety

### ✨ Highlights

- **130+ tests** (up from 16) covering all scenarios
- **JSON Schema validation** with Ajv
- **Performance testing** with SLA assertions
- **Security testing** (injection attacks, input validation)
- **Negative & edge case testing**
- **Data-driven testing** with parameterization
- **CI/CD pipeline** with test sharding (4x faster)
- **Code quality tools** (ESLint, Prettier, Husky)
- **TypeScript strict mode** - zero errors
- **Test tagging** (@smoke, @regression, @negative, @performance, @security)
- **Comprehensive documentation** (TEST_STRATEGY.md)

### 📊 Test Coverage

| Category | Tests | Purpose |
|----------|-------|---------|
| Smoke | 25 | Quick validation |
| Negative | 30 | Error handling |
| Edge Cases | 15 | Boundary scenarios |
| Performance | 12 | Response time SLAs |
| Security | 16 | Attack vectors |
| Data-Driven | 25+ | Parameterized tests |
| Schema | 8 | Contract validation |

### 🚀 Quick Commands

```bash
# Run by category
npm run test:smoke       # Quick validation (< 3min)
npm run test:negative    # Error handling tests
npm run test:performance # Performance benchmarks
npm run test:security    # Security validation

# Code quality
npm run lint             # Check code quality
npm run format           # Format code
npm run type-check       # TypeScript validation

# Parallel execution
npm run test:parallel    # Run with 10 workers
```
