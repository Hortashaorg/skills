# Package Request Flow - MVP Implementation

**Goal:** Users can search for packages and request them to be added. Worker fetches from npm and populates the database.

## Scope

**In scope:**
- Search for packages by name
- See if package exists in our DB
- Request a package if not found
- See request status (pending/fetching/completed/failed)
- Worker service that processes requests
- Fetch from npm API
- Store package metadata and versions

**Out of scope (for now):**
- Auto-queueing dependencies (add later)
- Rate limiting enforcement (add later)
- Audit logging (add later)
- Tag management (separate feature)
- Package browsing/listing (separate feature)

## User Flow

### 1. Search for a Package

**User action:** Types "express" in search box

**Frontend:**
- Input field with debounced search
- Query `packages.byName({ name: "express", registry: "npm" })`
- Show results if found
- Show "Package not in database - Request it" if not found

**States:**
- Empty state: "Search for npm packages..."
- Loading state: "Searching..."
- Found state: Show package card with link to detail page
- Not found state: Show "Request this package" button

### 2. Request a Package

**User action:** Clicks "Request this package" button

**Frontend:**
- Call mutator: `packageRequests.create({ packageName: "express", registry: "npm" })`
- Show toast: "Package request submitted!"
- Update UI to show request status

**Backend mutator (`packageRequests.create`):**
- Generate UUID
- Insert into `package_requests` table
- Status: "pending"
- attemptCount: 0
- Return request ID

**No validation yet - just create the request**

### 3. See Request Status

**User action:** Check if their request is being processed

**Frontend:**
- Query `packageRequests.byId({ id: requestId })`
- Show badge based on status:
  - pending: "Queued" (blue)
  - fetching: "Fetching..." (yellow, animated)
  - completed: "Ready!" (green)
  - failed: "Failed" (red) + error message
  - discarded: "Discarded after 3 failures" (gray)

**Real-time updates:** Zero syncs automatically - UI updates when worker changes status

## Worker Flow

### Worker Service Architecture

**Separate service** (not part of backend server):
- Single Node.js process
- Polls database every 30 seconds
- Uses Zero SDK to query/mutate
- Fetches from npm API
- No shared memory with backend

**Location:** `/skills/services/worker/` (new service)

**Files:**
```
services/worker/
├── package.json
├── tsconfig.json
├── index.ts           # Main entry point
├── npm-client.ts      # npm API integration
└── processor.ts       # Request processing logic
```

### Worker Loop

**Every 30 seconds:**

1. **Query pending requests**
   - Query: `packageRequests.pending()` (limit 10)
   - Filter by status: "pending"
   - Order by createdAt ASC (oldest first)

2. **Process each request**
   ```typescript
   for (const request of pendingRequests) {
     await processRequest(request);
   }
   ```

3. **Sleep 30 seconds, repeat**

### Processing a Single Request

**Step 1: Mark as fetching**
- Mutator: `packageRequests.markFetching({ id: request.id })`
- Prevents other workers from picking it up

**Step 2: Fetch from npm**
- GET `https://registry.npmjs.org/{packageName}`
- Parse response JSON

**Step 3: Store package data**

If successful:
```typescript
// 1. Upsert package
await mutate.packages.upsert({
  name: packageData.name,
  registry: "npm",
  description: packageData.description,
  homepage: packageData.homepage,
  repository: packageData.repository?.url,
  lastFetchAttempt: Date.now(),
  lastFetchSuccess: Date.now(),
});

// 2. Store versions (just latest for MVP)
const latestVersion = packageData["dist-tags"].latest;
const versionData = packageData.versions[latestVersion];

await mutate.packageVersions.create({
  packageId: package.id,
  version: latestVersion,
  publishedAt: new Date(versionData.time).getTime(),
});

// 3. Mark request completed
await mutate.packageRequests.markCompleted({
  id: request.id,
  packageId: package.id,
});
```

If failed:
```typescript
// Increment attempt count
const newAttemptCount = request.attemptCount + 1;

await mutate.packageRequests.markFailed({
  id: request.id,
  errorMessage: error.message,
  attemptCount: newAttemptCount,
});
// Status becomes "discarded" if attemptCount >= 3
```

**Step 4: Log and continue**
- Console log success/failure
- Move to next request

## npm API Integration

**Endpoint:** `https://registry.npmjs.org/{packageName}`

**Response shape:**
```json
{
  "name": "express",
  "description": "Fast, unopinionated, minimalist web framework",
  "dist-tags": { "latest": "4.18.2" },
  "versions": {
    "4.18.2": {
      "name": "express",
      "version": "4.18.2",
      "description": "...",
      "dependencies": { "body-parser": "^1.20.1", ... },
      "devDependencies": { ... },
      "time": "2023-02-15T12:00:00Z"
    }
  },
  "homepage": "http://expressjs.com/",
  "repository": { "type": "git", "url": "https://github.com/expressjs/express" }
}
```

**Error handling:**
- 404: Package not found → mark failed
- 429: Rate limited → retry after delay (not implementing backoff for MVP)
- 500: npm error → mark failed
- Network errors → mark failed

**For MVP:** No retry logic, no backoff. Just mark failed and move on.

## Frontend Components Needed

### Search Interface
- `PackageSearchInput` - Text input with search icon
- `PackageSearchResults` - Shows search results
- `PackageNotFound` - "Request this package" card
- `PackageCard` - Display package info (name, description)

### Request Status
- `RequestStatusBadge` - Colored badge showing status
- `RequestButton` - "Request this package" action

### Utilities
- `usePackageSearch` - Hook for search logic
- `usePackageRequest` - Hook for creating requests

## Implementation Order

1. ✅ Database migration (create tables)
2. ✅ Seed test data (optional - for developing UI)
3. 🔲 Frontend: Search UI
4. 🔲 Frontend: Request button
5. 🔲 Frontend: Status badge
6. 🔲 Worker: Setup service
7. 🔲 Worker: npm client
8. 🔲 Worker: Request processor
9. 🔲 Test end-to-end flow

## Questions to Answer

1. **Search behavior:** Exact match only, or show similar packages?
   - **Decision:** Exact match for MVP. Fetch all packages and filter client-side.

2. **Request feedback:** Toast notification or inline message?
   - **Decision:** Toast + update search results to show status badge

3. **Worker deployment:** How do we run it locally for development?
   - **Decision:** `pnpm worker dev` runs it alongside backend

4. **Error display:** Show error message to user or just "Failed"?
   - **Decision:** Show error message (helps with debugging)

## Success Criteria

**MVP is complete when:**
- User can search for "express"
- User can click "Request this package"
- Request appears in database as "pending"
- Worker picks up request within 60 seconds
- Worker fetches from npm successfully
- Package appears in database with metadata
- Request status updates to "completed"
- User sees package in search results (or detail page)

## Not Doing Yet

- Dependency tracking (no packageDependencies rows for MVP)
- Auto-queueing related packages
- Rate limiting (10 requests/hour per user)
- Deduplication checks (multiple requests for same package)
- Audit logging
- Package cooldown (1 hour between fetches)
- User authentication (can do anonymous requests for testing)

These can all be added incrementally after core flow works.
