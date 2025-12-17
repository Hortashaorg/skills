# Package Request Flow - Task List

## Phase 1: Database Setup

### Task 1: Create Database Migration ✅
**Status:** DONE
**Estimate:** 30 mins
**Owner:** Completed

**Deliverable:**
- Migration file in `packages/database/drizzle/` that creates all tables
- Run `pnpm database migrate` successfully
- Verify tables exist in Postgres

**Acceptance Criteria:**
- [x] All 8 tables created (account, packages, packageVersions, packageDependencies, packageRequests, tags, packageTags, auditLog)
- [x] All enums created (registry, dependency_type, package_request_status, audit_action, actor_type)
- [x] All indexes created
- [x] All foreign keys created
- [x] Migration applies cleanly without errors

---

### ~~Task 2: Seed Test Data~~ (DEFERRED)
**Decision:** Skip seeding. Start with empty database and populate through the UI as we build features. More realistic for testing empty states.

---

## Phase 2: Frontend UI

### Task 3: Package Search Input Component
**Status:** TODO
**Estimate:** 1 hour
**Owner:** TBD

**Location:** `services/frontend/src/components/feature/package-search/`

**Deliverable:**
- Search input component with debouncing
- Queries packages by name
- Shows loading state

**Files to create:**
- `package-search-input.tsx` - Component
- `package-search-input.stories.tsx` - Storybook stories
- `use-package-search.ts` - Hook for search logic

**Acceptance Criteria:**
- [ ] Input field with search icon
- [ ] Debounces input (300ms)
- [ ] Queries `packages.byName({ name, registry: "npm" })`
- [ ] Shows loading spinner while querying
- [ ] Clears results when input is empty
- [ ] Storybook story shows all states (empty, loading, results, error)

**Props:**
```typescript
interface PackageSearchInputProps {
  onResultsChange?: (results: Package[]) => void;
}
```

---

### Task 4: Package Search Results Display
**Status:** TODO
**Estimate:** 1.5 hours
**Owner:** TBD

**Location:** `services/frontend/src/components/feature/package-search/`

**Deliverable:**
- Display search results
- Show "Package not found" state
- Link to package detail page (if exists)

**Files to create:**
- `package-search-results.tsx` - Results list
- `package-card.tsx` - Individual package card
- `package-not-found.tsx` - Not found state

**Acceptance Criteria:**
- [ ] Shows list of matching packages
- [ ] Each card shows: name, description, registry badge
- [ ] Empty state: "Search for npm packages..."
- [ ] Not found state: Shows PackageNotFound component
- [ ] Links to `/packages/:id` (can be stub for now)
- [ ] Responsive layout (stacks on mobile)

**States to handle:**
- No search yet (empty)
- Searching (loading)
- Results found (list)
- No results (not found)

---

### Task 5: Request Package Button
**Status:** TODO
**Estimate:** 1 hour
**Owner:** TBD

**Location:** `services/frontend/src/components/feature/package-request/`

**Deliverable:**
- Button to request a package
- Calls mutation
- Shows success toast

**Files to create:**
- `request-package-button.tsx` - Button component
- `use-package-request.ts` - Hook for mutation

**Acceptance Criteria:**
- [ ] Button component with loading state
- [ ] Calls `packageRequests.create({ packageName, registry })`
- [ ] Shows toast on success: "Package requested!"
- [ ] Shows toast on error: "Failed to request package"
- [ ] Disables while loading
- [ ] Returns request ID for status tracking

**Props:**
```typescript
interface RequestPackageButtonProps {
  packageName: string;
  registry: "npm" | "jsr" | "brew" | "apt";
  onSuccess?: (requestId: string) => void;
}
```

---

### Task 6: Request Status Badge
**Status:** TODO
**Estimate:** 30 mins
**Owner:** TBD

**Location:** `services/frontend/src/components/ui/badge/`

**Deliverable:**
- Badge component showing request status
- Updates in real-time (Zero sync)

**Files to create:**
- `request-status-badge.tsx` - Badge component
- `request-status-badge.stories.tsx` - All status variants

**Acceptance Criteria:**
- [ ] Shows status with appropriate color:
  - pending: "Queued" (blue)
  - fetching: "Fetching..." (yellow, animated pulse)
  - completed: "Ready!" (green)
  - failed: "Failed" (red)
  - discarded: "Discarded" (gray)
- [ ] Queries `packageRequests.byId({ id })`
- [ ] Updates automatically when status changes
- [ ] Tooltip shows error message on failed/discarded

**Props:**
```typescript
interface RequestStatusBadgeProps {
  requestId: string;
}
```

---

### Task 7: Integrate Search Flow on Homepage
**Status:** TODO
**Estimate:** 1 hour
**Owner:** TBD

**Location:** `services/frontend/src/routes/index.tsx`

**Deliverable:**
- Homepage with search interface
- Shows results or request button

**Acceptance Criteria:**
- [ ] Search input at top of page
- [ ] Results appear below input
- [ ] If package not found, show RequestPackageButton
- [ ] After successful request, show RequestStatusBadge
- [ ] Clean, centered layout
- [ ] Mobile responsive

**Layout:**
```
┌─────────────────────────────┐
│  TechGarden                 │
├─────────────────────────────┤
│                             │
│  [Search for packages...]   │
│                             │
│  ┌─────────────────────┐   │
│  │ express             │   │
│  │ Web framework       │   │
│  │ [Ready!]            │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## Phase 3: Worker Service

### Task 8: Worker Service Setup
**Status:** TODO
**Estimate:** 30 mins
**Owner:** TBD

**Location:** `services/worker/`

**Deliverable:**
- New service directory with boilerplate
- Package.json with dependencies
- Basic entry point

**Files to create:**
```
services/worker/
├── package.json
├── tsconfig.json
├── index.ts
└── .env.example
```

**Acceptance Criteria:**
- [ ] Can run `pnpm worker dev` to start service
- [ ] Connects to Postgres via Zero SDK
- [ ] Logs "Worker service started" on startup
- [ ] Uses same database connection as backend

**Dependencies:**
```json
{
  "@rocicorp/zero": "...",
  "@package/database": "workspace:*",
  "node-fetch": "^3.3.0"
}
```

---

### Task 9: npm API Client
**Status:** TODO
**Estimate:** 1 hour
**Owner:** TBD

**Location:** `services/worker/npm-client.ts`

**Deliverable:**
- Module that fetches package data from npm registry
- Error handling for common cases

**Functions to implement:**
```typescript
export async function fetchPackage(packageName: string): Promise<NpmPackageData>
```

**Acceptance Criteria:**
- [ ] Fetches from `https://registry.npmjs.org/{packageName}`
- [ ] Returns parsed JSON
- [ ] Handles 404 (package not found)
- [ ] Handles 429 (rate limit) - throw error
- [ ] Handles network errors
- [ ] Timeout after 10 seconds
- [ ] Unit tests for error cases

**Return type:**
```typescript
interface NpmPackageData {
  name: string;
  description?: string;
  homepage?: string;
  repository?: { url: string };
  "dist-tags": { latest: string };
  versions: {
    [version: string]: {
      version: string;
      time: string;
      dependencies?: Record<string, string>;
    };
  };
}
```

---

### Task 10: Request Processor
**Status:** TODO
**Estimate:** 2 hours
**Owner:** TBD

**Location:** `services/worker/processor.ts`

**Deliverable:**
- Logic to process a single package request
- Store package and version in database

**Functions to implement:**
```typescript
export async function processRequest(request: PackageRequest): Promise<void>
```

**Acceptance Criteria:**
- [ ] Marks request as "fetching"
- [ ] Calls npm client to fetch package data
- [ ] Upserts package using `packages.upsert`
- [ ] Creates latest version using `packageVersions.create`
- [ ] Marks request as "completed" with packageId
- [ ] On error: marks request as "failed" with error message
- [ ] On 3rd failure: marks as "discarded"
- [ ] Logs success/failure to console

**Error handling:**
- Package not found (404) → mark failed
- Rate limited (429) → mark failed, retry later (not implemented)
- npm error (500) → mark failed
- Network error → mark failed

---

### Task 11: Worker Main Loop
**Status:** TODO
**Estimate:** 1 hour
**Owner:** TBD

**Location:** `services/worker/index.ts`

**Deliverable:**
- Polling loop that processes pending requests

**Acceptance Criteria:**
- [ ] Queries `packageRequests.pending()` every 30 seconds
- [ ] Processes up to 10 requests per cycle
- [ ] Calls `processRequest()` for each
- [ ] Handles errors gracefully (logs and continues)
- [ ] Logs stats: "Processed 3 requests, 2 succeeded, 1 failed"
- [ ] Can be stopped with Ctrl+C

**Pseudocode:**
```typescript
async function main() {
  while (true) {
    const pending = await query.packageRequests.pending();
    for (const request of pending) {
      try {
        await processRequest(request);
      } catch (error) {
        console.error("Failed to process request:", error);
      }
    }
    await sleep(30_000);
  }
}
```

---

### Task 12: Add Worker to Development Scripts
**Status:** TODO
**Estimate:** 15 mins
**Owner:** TBD

**Location:** Root `package.json`

**Deliverable:**
- Scripts to run worker service

**Acceptance Criteria:**
- [ ] `pnpm worker dev` - Run worker in development
- [ ] Worker runs concurrently with backend and frontend
- [ ] Worker logs appear in terminal

**package.json scripts:**
```json
{
  "worker": "pnpm --filter '@service/worker'",
  "dev:all": "concurrently \"pnpm frontend dev\" \"pnpm backend dev\" \"pnpm worker dev\""
}
```

---

## Phase 4: Integration & Testing

### Task 13: End-to-End Manual Test
**Status:** TODO
**Estimate:** 30 mins
**Owner:** TBD

**Deliverable:**
- Documented test flow proving everything works

**Test Steps:**
1. Start all services: `pnpm dev:all`
2. Open browser to `http://localhost:5173`
3. Search for "lodash"
4. If not found, click "Request this package"
5. Watch badge change: Queued → Fetching → Ready
6. Wait for worker to process (max 60 seconds)
7. Verify package appears in database
8. Search for "lodash" again - should show package

**Acceptance Criteria:**
- [ ] Search returns results for seeded packages
- [ ] Request button appears for non-existent packages
- [ ] Request creates database row
- [ ] Worker picks up request within 60 seconds
- [ ] Worker fetches from npm successfully
- [ ] Package and version stored in database
- [ ] Status badge updates to "Ready!"
- [ ] Searching again shows the package

**Evidence:**
- Screenshots at each step
- Database queries showing data

---

## Summary

**Total Tasks:** 13
**Estimated Time:** ~12 hours
**Order of execution:** 1 → 2 → 8 → 3 → 4 → 5 → 6 → 7 → 9 → 10 → 11 → 12 → 13

**Critical path:**
1. Database (Tasks 1-2)
2. Worker basics (Task 8-9)
3. Frontend UI (Tasks 3-7)
4. Worker processing (Tasks 10-12)
5. Integration test (Task 13)

**Can work in parallel:**
- Tasks 3-7 (Frontend) can be done while Task 8-12 (Worker) is in progress
- Frontend can use seeded data to develop UI before worker is ready
