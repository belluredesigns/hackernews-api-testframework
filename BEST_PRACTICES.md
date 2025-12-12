# Test Best Practices & Anti-Patterns

This document outlines the best practices followed in this framework and common anti-patterns that were avoided.

## ✅ Best Practices Implemented

### 1. No Conditional Logic in Tests

**Why it matters:** Tests should be deterministic and easy to understand. Conditional logic makes tests unpredictable and harder to debug.

#### ❌ Anti-Pattern (What NOT to do):
```typescript
test('bad example with conditionals', async ({ client }) => {
  const items = await client.getItems();

  if (items.length > 0) {  // ❌ Conditional logic
    expect(items[0].id).toBeDefined();
  }

  const item = await client.getItem(1);
  if (item !== null) {  // ❌ Conditional expectation
    expect(item.title).toBeDefined();
  }
});
```

**Problems:**
- Test might pass even without assertions running
- Impossible to know what was actually tested
- Masks failures
- Reduces test reliability

#### ✅ Good Practice:
```typescript
test('good example without conditionals', async ({ client }) => {
  const items = await client.getItems();

  // Assert preconditions
  expect(items.length).toBeGreaterThan(0);

  // Assert outcome
  const firstId = items[0];
  expect(firstId).toBeDefined();

  const item = await client.getItem(firstId as number);
  expect(item).not.toBeNull();
  expect(item?.title).toBeDefined();
});
```

**Benefits:**
- Clear pass/fail criteria
- All assertions always run
- Failures are explicit
- Easy to understand what's being tested

### 2. Avoid Non-Null Assertions (!)

**Why it matters:** Non-null assertions (`!`) bypass TypeScript's safety checks and can cause runtime errors.

#### ❌ Anti-Pattern:
```typescript
test('bad example with non-null assertions', async ({ client }) => {
  const user = await client.getUser('unknown');
  expect(user!.id).toBe('unknown');  // ❌ Could crash if user is null
  expect(user!.karma).toBeGreaterThan(0);  // ❌ Unsafe
});
```

#### ✅ Good Practice:
```typescript
test('good example with safe checks', async ({ client }) => {
  const user = await client.getUser('pg');

  // Assert non-null first
  expect(user).not.toBeNull();

  // Use optional chaining
  expect(user?.id).toBe('pg');
  expect(user?.karma).toBeGreaterThan(0);
});
```

### 3. Split Conditional Tests into Separate Tests

**Why it matters:** Each test should have a single, clear purpose.

#### ❌ Anti-Pattern:
```typescript
test('bad example - tests multiple scenarios', async ({ client }) => {
  const limit = 10;
  const items = await client.getItems(limit);

  if (limit === 0) {
    expect(items.length).toBe(0);
  } else if (limit === 1) {
    expect(items.length).toBe(1);
  } else {
    expect(items.length).toBeGreaterThan(0);
  }
});
```

#### ✅ Good Practice:
```typescript
test('should handle zero limit', async ({ client }) => {
  const items = await client.getItems(0);
  expect(items.length).toBe(0);
});

test('should handle single item limit', async ({ client }) => {
  const items = await client.getItems(1);
  expect(items.length).toBe(1);
});

test('should handle multiple items limit', async ({ client }) => {
  const items = await client.getItems(10);
  expect(items.length).toBeGreaterThan(0);
  expect(items.length).toBeLessThanOrEqual(10);
});
```

### 4. Use Parameterized Tests for Similar Scenarios

**Why it matters:** DRY (Don't Repeat Yourself) principle while maintaining clarity.

#### ✅ Good Practice:
```typescript
const testCases = [
  { limit: 1, description: 'single item' },
  { limit: 5, description: 'five items' },
  { limit: 10, description: 'ten items' },
];

testCases.forEach(({ limit, description }) => {
  test(`should retrieve ${description}`, async ({ client }) => {
    const items = await client.getItems(limit);

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(limit);
  });
});
```

### 5. Assert Preconditions Explicitly

**Why it matters:** Makes test assumptions clear and failures more debuggable.

#### ❌ Anti-Pattern:
```typescript
test('bad example - assumes array has items', async ({ client }) => {
  const items = await client.getItems();
  const firstItem = items[0];  // ❌ Might be undefined
  expect(firstItem.id).toBeDefined();
});
```

#### ✅ Good Practice:
```typescript
test('good example - asserts preconditions', async ({ client }) => {
  const items = await client.getItems();

  // Assert precondition
  expect(items.length).toBeGreaterThan(0);

  const firstItem = items[0];
  expect(firstItem).toBeDefined();
  expect(firstItem?.id).toBeDefined();
});
```

### 6. Use Optional Chaining (?.) Over Non-Null Assertions (!)

**Why it matters:** Safer and more explicit about handling null/undefined.

#### ❌ Anti-Pattern:
```typescript
const userId = user!.id;  // ❌ Crashes if user is null
const karma = user!.karma;  // ❌ Unsafe
```

#### ✅ Good Practice:
```typescript
const userId = user?.id;  // ✅ Returns undefined if user is null
const karma = user?.karma;  // ✅ Safe
expect(userId).toBe('pg');  // ✅ Explicit assertion
```

### 7. One Assertion Concept Per Test

**Why it matters:** Makes failures easier to diagnose.

#### ❌ Anti-Pattern:
```typescript
test('bad example - tests everything', async ({ client }) => {
  const user = await client.getUser('pg');
  expect(user).not.toBeNull();
  expect(user?.id).toBe('pg');

  const items = await client.getItems();
  expect(items.length).toBeGreaterThan(0);

  const story = await client.getItem(1);
  expect(story).not.toBeNull();
});
```

#### ✅ Good Practice:
```typescript
test('should retrieve user by id', async ({ client }) => {
  const user = await client.getUser('pg');
  expect(user).not.toBeNull();
  expect(user?.id).toBe('pg');
});

test('should retrieve items list', async ({ client }) => {
  const items = await client.getItems();
  expect(items.length).toBeGreaterThan(0);
});

test('should retrieve story by id', async ({ client }) => {
  const story = await client.getItem(1);
  expect(story).not.toBeNull();
});
```

### 8. Use Descriptive Test Names

**Why it matters:** Tests serve as living documentation.

#### ❌ Anti-Pattern:
```typescript
test('test 1', async ({ client }) => {});
test('check user', async ({ client }) => {});
test('it works', async ({ client }) => {});
```

#### ✅ Good Practice:
```typescript
test('should retrieve user by username', async ({ client }) => {});
test('should return null for non-existent user', async ({ client }) => {});
test('should validate user has required fields', async ({ client }) => {});
```

### 9. Avoid Loops with Conditional Breaks

**Why it matters:** Makes tests non-deterministic.

#### ❌ Anti-Pattern:
```typescript
test('bad example with loop', async ({ client }) => {
  const items = await client.getItems(10);

  for (const item of items) {
    if (item.score !== undefined) {
      expect(typeof item.score).toBe('number');
      break;  // ❌ Test behavior depends on data order
    }
  }
});
```

#### ✅ Good Practice:
```typescript
test('should validate score is a number', async ({ client }) => {
  const items = await client.getItems(1);
  const firstItem = items[0];

  expect(firstItem).toBeDefined();
  expect(firstItem?.score).toBeDefined();
  expect(typeof firstItem?.score).toBe('number');
});
```

### 10. Use Test Tags for Organization

**Why it matters:** Enables targeted test execution.

#### ✅ Good Practice:
```typescript
test.describe('@smoke Critical Path Tests', () => {
  test('@smoke should retrieve top stories', async ({ client }) => {
    // Fast, critical validation
  });
});

test.describe('@regression Full Suite', () => {
  test('@regression should handle edge cases', async ({ client }) => {
    // Comprehensive coverage
  });
});

test.describe('@performance Performance Tests', () => {
  test('@performance should respond within SLA', async ({ client }) => {
    // Performance validation
  });
});
```

**Usage:**
```bash
npm run test:smoke       # Run only @smoke tests
npm run test:regression  # Run only @regression tests
npm run test:performance # Run only @performance tests
```

---

## 🎯 Framework-Specific Best Practices

### 1. Fixture-Based Dependency Injection

```typescript
// ✅ Use fixtures for clean dependency injection
test('good example', async ({ hackerNewsClient }) => {
  const stories = await hackerNewsClient.getTopStories(10);
  expect(stories.length).toBeGreaterThan(0);
});

// ❌ Don't create clients in tests
test('bad example', async () => {
  const client = new HackerNewsClient();  // ❌ Avoid
  const stories = await client.getTopStories(10);
});
```

### 2. Schema Validation

```typescript
// ✅ Use schema validation for contract testing
import { validateItem } from '../schemas/item.schema';

test('should validate response schema', async ({ hackerNewsClient }) => {
  const item = await hackerNewsClient.getItem(1);

  expect(item).not.toBeNull();
  const isValid = validateItem(item);
  expect(isValid).toBeTruthy();
});
```

### 3. Type Safety

```typescript
// ✅ Use TypeScript types throughout
test('good example with types', async ({ hackerNewsClient }) => {
  const stories: number[] = await hackerNewsClient.getTopStories(10);
  expect(Array.isArray(stories)).toBeTruthy();
});

// ❌ Avoid any types
test('bad example', async ({ hackerNewsClient }) => {
  const stories: any = await hackerNewsClient.getTopStories(10);  // ❌ Avoid any
});
```

### 4. Error Handling

```typescript
// ✅ Test error scenarios explicitly
test('should return null for non-existent item', async ({ hackerNewsClient }) => {
  const item = await hackerNewsClient.getItem(999999999999);
  expect(item).toBeNull();
});

test('should handle negative item ID', async ({ hackerNewsClient }) => {
  const item = await hackerNewsClient.getItem(-1);
  expect(item).toBeNull();
});
```

---

## 📚 References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Best Practices by Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Desiderata by Kent Beck](https://kentcdodds.com/blog/test-desiderata)

---

## 🔍 Code Review Checklist

Before committing tests, verify:

- [ ] No conditional logic (`if`, `else`, `switch`) in tests
- [ ] No non-null assertions (`!`) without prior null checks
- [ ] Each test has a clear, single purpose
- [ ] Test names are descriptive and follow "should [action] [result]" pattern
- [ ] All assertions will always execute (no conditional assertions)
- [ ] Preconditions are asserted explicitly
- [ ] Optional chaining (`?.`) used instead of non-null assertions
- [ ] Tests are tagged appropriately (`@smoke`, `@regression`, etc.)
- [ ] No loops with conditional breaks in tests
- [ ] Type safety maintained (no `any` types without justification)

---

**Last Updated:** December 2024
**Framework Version:** 2.0
