# API Requirements Test Coverage

This document maps the specific API requirements to their corresponding test implementations.

## Requirements Overview

### Requirement 1: Retrieving top stories with the Top Stories API
**Objective:** Verify that the Top Stories API endpoint returns a valid array of story IDs.

**Test Location:** `tests/specs/api-requirements.spec.ts:23`

**Test Name:** `Requirement 1: should retrieve top stories with the Top Stories API`

**What it tests:**
- Top Stories API returns an array
- Array contains valid numeric story IDs
- All IDs are positive integers
- Respects the limit parameter (e.g., requesting 10 returns ≤ 10)

**Sample Output:**
```
Retrieved 10 top stories
First 5 story IDs: 46234788, 46239177, 46234920, 46182874, 46236924
```

---

### Requirement 2: Using the Top Stories API to retrieve the current top story from the Items API
**Objective:** Verify the complete workflow of getting top stories, then retrieving detailed information about the current #1 story.

**Test Location:** `tests/specs/api-requirements.spec.ts:55`

**Test Name:** `Requirement 2: should use Top Stories API to retrieve current top story from Items API`

**What it tests:**
1. Call Top Stories API to get story IDs
2. Extract the first (current top) story ID
3. Use Items API to retrieve full story details
4. Validate story structure (id, type, title, author, time, score)

**Sample Output:**
```
Current top story ID: 46234788
Retrieved top story: "GPT-5.2"
Posted by: atgctg
Score: 916
```

---

### Requirement 3: Using the Top Stories API to retrieve a top story, then retrieve its first comment using the Items API
**Objective:** Verify the complete workflow of navigating from top stories → story details → first comment.

**Test Location:** `tests/specs/api-requirements.spec.ts:105`

**Test Name:** `Requirement 3: should retrieve top story and its first comment using Items API`

**What it tests:**
1. Call Top Stories API to get story IDs
2. Find a story that has comments (iterate through stories)
3. Extract the first comment ID from the story's `kids` array
4. Use Items API to retrieve the comment details
5. Validate comment structure (id, type, parent, author, text)
6. Verify the comment's parent ID matches the story ID

**Sample Output:**
```
Found story with comments - ID: 46234788
Story title: "GPT-5.2"
Number of comments: 754
First comment ID: 46235173
Retrieved first comment by: breakingcups
Comment text length: 511 characters
```

---

## Additional Test: Complete Workflow

**Test Location:** `tests/specs/api-requirements.spec.ts:174`

**Test Name:** `Bonus: should verify complete API workflow from top stories to comments`

**What it tests:** Combines all three requirements into a single end-to-end workflow test that:
1. Retrieves top stories
2. Gets the current top story details
3. Finds a story with comments and retrieves its first comment
4. Provides detailed console output for each step

**Sample Output:**
```
=== Starting Complete API Workflow Test ===

1. Retrieving top stories...
   ✓ Retrieved 20 story IDs

2. Retrieving current top story...
   ✓ Story: "GPT-5.2"
   ✓ Score: 916

3. Finding story with comments...
   ✓ Found story: "GPT-5.2"
   ✓ Has 136 direct replies

4. Retrieving first comment...
   ✓ Comment by: breakingcups
   ✓ Comment preview: Is it me, or did it still get at least three placements...

=== Complete API Workflow Test Successful ===
```

---

## Running the Tests

### Run all requirement tests:
```bash
npm test -- tests/specs/api-requirements.spec.ts
```

### Run a specific requirement test:
```bash
# Requirement 1
npm test -- tests/specs/api-requirements.spec.ts -g "Requirement 1"

# Requirement 2
npm test -- tests/specs/api-requirements.spec.ts -g "Requirement 2"

# Requirement 3
npm test -- tests/specs/api-requirements.spec.ts -g "Requirement 3"
```

### Run with UI mode (interactive):
```bash
npx playwright test tests/specs/api-requirements.spec.ts --ui
```

---

## Test Results Summary

All requirement tests are **PASSING** ✅

```
4 passed (1.4s)

✓ Requirement 1: should retrieve top stories with the Top Stories API
✓ Requirement 2: should use Top Stories API to retrieve current top story from Items API
✓ Requirement 3: should retrieve top story and its first comment using Items API
✓ Bonus: should verify complete API workflow from top stories to comments
```

---

## API Endpoints Covered

| Requirement | API Endpoint | Purpose |
|-------------|--------------|---------|
| 1 | `GET /v0/topstories.json` | Retrieve top story IDs |
| 2 | `GET /v0/topstories.json` | Get story IDs |
| 2 | `GET /v0/item/{id}.json` | Get story details |
| 3 | `GET /v0/topstories.json` | Get story IDs |
| 3 | `GET /v0/item/{id}.json` | Get story details (with kids array) |
| 3 | `GET /v0/item/{id}.json` | Get comment details |

---

## Data Flow Diagram

```
Requirement 1:
┌──────────────────┐
│ Top Stories API  │──────► Array of story IDs
└──────────────────┘

Requirement 2:
┌──────────────────┐        ┌──────────────┐
│ Top Stories API  │──────► │  Items API   │──────► Story Details
└──────────────────┘        └──────────────┘
     (Get IDs)                 (Get Story)

Requirement 3:
┌──────────────────┐        ┌──────────────┐        ┌──────────────┐
│ Top Stories API  │──────► │  Items API   │──────► │  Items API   │──────► Comment
└──────────────────┘        └──────────────┘        └──────────────┘
     (Get IDs)                (Get Story)            (Get Comment)
                              (Extract kids[0])
```

---

## Notes

- All tests include comprehensive assertions and validation
- Each test provides detailed console output for debugging
- Tests are tagged with `@smoke` and `@requirements` for easy filtering
- Tests handle edge cases (e.g., finding stories with comments)
- All tests respect API rate limits with proper retry logic
- Tests are idempotent and can run in any order
