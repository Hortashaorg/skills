# TechGarden MVP - Phase 1

User-driven package curation: search, request, and browse npm packages.

## Core Flow

1. **User searches** for a package name
2. **If not in DB**: Show "Add this package" button
3. **User requests**: Package request created
4. **Background job**: Fetches from npm API and populates DB
5. **Auto-queue dependencies**: All dependencies automatically queued for fetching
6. **Package available**: Appears in search results with full dependency graph

## Why This Approach?

- **Organic growth**: Only curate packages people actually use
- **Complete dependency graphs**: Auto-queueing dependencies ensures full trees, no orphaned links
- **Better insights**: Can accurately calculate transitive dependencies, bundle sizes, and relationships
- **Natural data expansion**: One user request can populate 50+ packages (entire dependency tree)
- **Lower API load**: No mass-fetching, reduced rate limiting risk
- **User-driven**: Community decides what's valuable
- **Scalable**: Start small, grow naturally through relationships

## MVP Features

### 1. Package Search & Request

**Search interface**
- Search input with live results
- Shows packages already in DB
- "Add this package" for missing packages
- Registry selector (npm only for MVP)

**Package request flow**
- Click "Add this package" → create request
- Visual feedback ("Request submitted, fetching data...")
- Show request status (pending, fetching, completed, failed)
- Notify when package is ready

### 2. Package Browsing

**List view**
- Browse all available packages
- Search and filter
- Sort by recently added, popularity, name

**Package detail page**
- Full metadata (name, description, versions)
- Dependency list (with links to dependency packages)
- **Dependency insights** (enabled by complete graphs):
  - Direct dependency count
  - Transitive dependency count (total including nested)
  - Shared dependencies with other packages
  - Dependency depth visualization
- Tags (admin-assigned)
- Version history

### 3. Background Package Fetcher

**Request queue system**
- Poll `package_requests` table for pending requests
- Fetch from npm API (batch multiple requests if possible)
- Parse metadata, versions, dependencies
- Update request status throughout process
- Handle errors gracefully (package not found, API errors)

**Spam prevention & rate limiting**
- Deduplicate pending requests (don't create duplicate requests for same package)
- Package cooldown: Can't re-request package within 1 hour of last attempt
- User limits: Max requests per user per hour (prevent spam clicking)
- Database-level deduplication on package name + registry

### 4. Rate Limiting & Abuse Prevention

**Package-level throttling**
- Track last fetch attempt per package (`lastFetchAttempt` timestamp)
- Reject new requests if attempted within last hour
- Applies to both new requests and refresh attempts

**User-level limits**
- Max 10 package requests per user per hour
- Track request count in time window
- Clear, helpful error messages when limit reached

**Request deduplication**
- Check for existing pending/fetching requests before creating new one
- If exists: Return existing request status instead of creating duplicate
- Unique constraint on `packageName + registry + status` (for pending/fetching)

**Background job protections**
- Process requests in batches (e.g., 5 at a time)
- Rate limit npm API calls (delay between requests)
- Retry logic with exponential backoff for API failures
- Mark as failed after 3 attempts, allow manual retry later

### 5. Admin Tagging

**Tag management**
- Create/edit/delete tags
- Assign tags to packages
- Tag categories: "database", "frontend", "styling", "testing", "devops", etc.

## Database Schema

### New Tables

```typescript
// package_requests table - user requests for packages to add
{
  id: string (uuid)
  packageName: string
  registry: "npm" (only npm for MVP)
  requestedBy: string | null (foreign key -> account.id, null for auto-queued dependencies)
  sourceRequestId: string | null (foreign key -> package_requests.id, tracks which request triggered this)
  isAutoQueued: boolean (default: false, true if auto-queued from dependency)
  status: "pending" | "fetching" | "completed" | "failed"
  errorMessage: string | null
  packageId: string | null (foreign key -> packages.id, set when completed)
  attemptCount: number (default: 0, increment on each fetch attempt)
  createdAt: number
  updatedAt: number

  // Indexes & constraints
  unique(packageName, registry, status) where status in ('pending', 'fetching')
  index(requestedBy, createdAt) for user rate limiting queries (only user requests)
  index(status, isAutoQueued) for worker queue processing
}

// packages table
{
  id: string (uuid)
  name: string
  description: string | null
  registry: "npm"
  homepage: string | null
  repository: string | null
  latestVersion: string | null
  npmDownloadsLastMonth: number | null
  lastFetchAttempt: number | null (timestamp of last fetch, used for 1-hour cooldown)
  lastFetchSuccess: number | null (timestamp of last successful fetch)
  createdAt: number
  updatedAt: number

  // Indexes & constraints
  unique(name, registry)
  index(lastFetchAttempt) for cooldown checks
}

// package_versions table
{
  id: string (uuid)
  packageId: string (foreign key -> packages.id)
  version: string
  publishedAt: number
  createdAt: number
}

// package_dependencies table
{
  id: string (uuid)
  packageId: string (foreign key -> packages.id)
  versionId: string (foreign key -> package_versions.id)
  dependencyName: string (name, might not exist in our DB yet)
  dependencyPackageId: string | null (foreign key -> packages.id, null if not in our DB)
  dependencyVersionRange: string
  dependencyType: "runtime" | "dev" | "peer" | "optional"
  createdAt: number
}

// tags table
{
  id: string (uuid)
  name: string (unique)
  slug: string (unique, url-friendly)
  description: string | null
  color: string | null (hex color for UI)
  createdAt: number
  updatedAt: number
}

// package_tags table
{
  id: string (uuid)
  packageId: string (foreign key -> packages.id)
  tagId: string (foreign key -> tags.id)
  createdBy: string (foreign key -> account.id)
  createdAt: number
}

// Update account table
account {
  // existing fields...
  isAdmin: boolean (default: false)
}
```

## Backend Tasks

### Package Request System

- [ ] Create package request mutator
- [ ] Zero query for user's requests (show status)
- [ ] Zero query for pending requests (for background job)

### npm Integration

- [ ] npm API client service
- [ ] Fetch package metadata
- [ ] Fetch version list
- [ ] Parse dependencies
- [ ] Error handling (404, rate limits, etc.)

### Background Job / Worker Service

**Deployment strategy:**
- **Separate service** (not part of backend server)
- Prevents duplicate jobs when backend scales horizontally
- Single instance runs cron job
- Uses Zero's database mutations to process requests

**Implementation:**
- Periodic task (every 30-60 seconds)
- Query pending requests via Zero
- Process in batches (5-10 at a time)
- Fetch from npm API with rate limiting
- Update request status via Zero mutations

**Why separate service?**
- Backend server scales horizontally (multiple instances)
- Don't want 10 cron jobs doing the same work
- Worker service runs as single instance (or with leader election later)
- Cleaner separation of concerns

### Zero Queries & Mutations

All data access goes through Zero - no REST API needed. Frontend and worker service both use Zero queries/mutations.

**Queries** (`packages/database/queries/`)
- `packages.list` - browse packages with filters
- `packages.byId` - single package with versions and dependencies
- `packages.search` - search by name (check existence before allowing request)
- `packages.byName` - check if package exists and last fetch time
- `packages.exists` - quick existence check (for auto-queue deduplication)
- `packageRequests.mine` - user's package requests with status (where requestedBy = userID)
- `packageRequests.pending` - pending requests (worker service only)
- `packageRequests.userRecentCount` - count user's requests in last hour (only isAutoQueued = false)
- `packageRequests.existingPending` - check for duplicate pending/fetching requests
- `packageDependencies.unlinked` - dependencies with null packageId (for batch linking job)
- `tags.list` - all tags
- `tags.withCounts` - tags with package counts

**Mutators** (`packages/database/mutators/`)

*Package requests (with validation)*
- `packageRequests.create` - user creates request
  - Validate: User hasn't exceeded hourly limit (10 requests/hour)
  - Validate: No existing pending/fetching request for this package
  - Validate: Package hasn't been attempted in last hour (if exists)
  - Return: Existing request if duplicate, or new request

*Background worker mutations*
- `packageRequests.markFetching` - update status to 'fetching', increment attemptCount
- `packageRequests.markCompleted` - update status to 'completed', link packageId
- `packageRequests.markFailed` - update status to 'failed', set errorMessage
- `packageRequests.createAutoQueued` - create auto-queued dependency request
  - Set isAutoQueued = true, requestedBy = null, sourceRequestId = parent
  - Skip user rate limiting
  - Still respect package cooldown and deduplication
- `packages.upsert` - create or update package (update lastFetchAttempt)
- `packages.updateFetchTimestamps` - update lastFetchAttempt and lastFetchSuccess
- `packageVersions.create` - add version
- `packageDependencies.create` - add dependency
- `packageDependencies.linkPackage` - update dependencyPackageId when package exists

*Tag management (admin only - check in mutator)*
- `tags.create` - create tag (admin check)
- `tags.update` - update tag (admin check)
- `tags.delete` - delete tag (admin check)
- `packageTags.create` - add tag to package (admin check)
- `packageTags.delete` - remove tag (admin check)

## Frontend Tasks

### Components to Build

**Package search**
- `PackageSearch` - search input with live results
- `SearchResults` - list of matching packages
- `AddPackageButton` - "Add this package" for missing packages
- `RequestStatus` - show request status (pending, fetching, etc.)

**Package browsing**
- `PackageList` - grid/list of packages
- `PackageCard` - preview card with name, description, tags
- `PackageFilters` - filter by tags, search

**Package details**
- `PackageDetail` - full package view
- `VersionHistory` - list of versions
- `DependencyList` - dependencies with links (if in DB)
- `DependencyGraph` - visual tree/graph of dependencies (basic for MVP)
- `DependencyStats` - direct count, transitive count, depth indicator
- `PackageTags` - tag chips with admin edit UI

**Tag management (admin)**
- `TagList` - browse all tags
- `TagForm` - create/edit tags
- `TagManager` - CRUD interface
- `TagChip` - reusable tag display

**User requests**
- `MyRequests` - view user's package requests and status

### Pages/Routes

- `/` - Landing with search + recently added packages
- `/packages` - Browse all packages
- `/packages/:id` - Package detail page
- `/my-requests` - User's package requests
- `/tags` - Browse tags
- `/tags/:slug` - Packages filtered by tag
- `/admin/tags` - Tag management (admin only)

## Implementation Details

### Worker Service Architecture

**Separate service** (not part of backend):
- Single instance to avoid duplicate work
- Polls database every 30-60 seconds
- Uses Zero SDK to query/mutate data
- No shared memory with backend

**Worker flow:**
1. Query pending requests (limit 5-10)
2. Mark as 'fetching' (prevents other workers from taking)
3. Fetch from npm API in parallel with delays
4. Parse and store package data via Zero mutations
5. **Auto-queue dependencies**: For each dependency, create package request if needed
   - Check if package already exists in DB (skip if exists)
   - Check if already has pending/fetching request (skip if duplicate)
   - Check cooldown period (skip if attempted recently)
   - Create request with `isAutoQueued: true`, link `sourceRequestId`
6. Mark original request as 'completed' or 'failed'
7. Repeat (worker will eventually process queued dependencies)

### Rate Limiting Implementation

**User request limits (mutator validation):**
```typescript
// Before creating USER request (isAutoQueued = false), check:
1. Count user's requests in last hour (where requestedBy = userID and isAutoQueued = false)
2. If >= 10, reject with error
3. Check for existing pending/fetching request (deduplicate)
4. Check package's lastFetchAttempt (1-hour cooldown)
5. Create request or return existing

// Auto-queued dependencies bypass user limits:
- isAutoQueued = true
- requestedBy = null
- sourceRequestId = parent request ID
- NO rate limiting (but still respects package cooldown and deduplication)
```

**Package cooldown (mutator validation):**
- Query package by name
- Check `lastFetchAttempt` timestamp
- If < 1 hour ago, reject with helpful error message
- Update `lastFetchAttempt` when starting fetch

**Deduplication:**
- Unique constraint on `(packageName, registry, status)` where status in ('pending', 'fetching')
- Database enforces no duplicate pending/fetching requests
- Mutator catches constraint error and returns existing request

### npm API Integration

**Batch processing:**
- npm has no batch endpoint, process individually
- Use `Promise.all` for parallel requests (5-10 at a time)
- Add 100-200ms delay between batches to avoid rate limiting
- Cache responses in-memory during worker run

**Error handling:**
- 404: Package not found (mark as failed with clear message)
- 429: Rate limited (exponential backoff, retry later)
- 500: npm API error (retry with backoff)
- Network errors: Retry with backoff
- After 3 attempts: Mark as failed, allow manual retry

### Auto-Queue Dependencies Strategy

**When package is successfully fetched:**
1. Parse all dependencies (runtime, dev, peer, optional)
2. For each dependency, queue package request if:
   - Package doesn't exist in DB yet
   - No pending/fetching request exists
   - Package hasn't been attempted in last hour (cooldown)
3. Create requests with `isAutoQueued: true`, `sourceRequestId: parentRequestId`
4. Worker will eventually process these, which may queue more dependencies (recursive growth)

**Handling circular dependencies:**
- Package A depends on B, B depends on A
- Deduplication prevents infinite loops:
  - Check if package exists before queuing
  - Check if pending/fetching request exists
  - Unique constraint on `(packageName, registry, status)`
- Both get queued, both get processed, no duplicates created

**Handling deep dependency trees:**
- No artificial depth limit - let it grow naturally
- Deduplication ensures shared dependencies only queued once
- Example: User requests "express"
  - Queues 50+ dependencies
  - Many packages share dependencies (e.g., multiple packages use "debug")
  - Each dependency only queued once due to deduplication
  - Full tree eventually populated

**Linking dependencies after creation:**
- Initially store dependency with name only (`dependencyName`)
- Set `dependencyPackageId: null`
- After dependency package is created, link them:
  - Worker updates `dependencyPackageId` when marking request completed
  - Or run periodic batch job to link unlinked dependencies (future optimization)

**Benefits:**
- Complete dependency graphs (no orphaned dependencies)
- Accurate transitive dependency counts
- Better insights (total bundle size, shared dependencies)
- One user request can populate entire ecosystem subtree

## Anonymous User Value

Users can browse and explore without signing in. Complete dependency graphs enable powerful read-only features:

### What Anonymous Users Can Do

**Search & browse**
- Search packages by name
- Filter by tags
- View all package metadata

**Dependency insights** (enabled by auto-queued complete graphs)
- Interactive dependency graph visualization
- See direct vs transitive dependencies
- Calculate total dependency count (e.g., "express has 57 transitive dependencies")
- Explore dependency depth (how many levels deep)
- Identify shared dependencies across packages

**Package comparison**
- Compare 2-3 packages side-by-side
- Dependency overlap analysis
- Bundle size estimates
- Last updated, download stats

**Package health indicators**
- Freshness (last updated date)
- Dependency count (complexity indicator)
- License compatibility
- Maintenance status

### What Requires Sign-In

- Request new packages
- Tag packages (admin)
- Save custom package lists (future)
- Earn XP and leaderboards (future)


## Out of Scope for MVP

- Community tagging (voting, suggestions)
- XP and leaderboards
- Q&A system
- Project creation and discovery
- Package recommendations ("people who use X also use Y")
- Cross-registry linking (jsr, brew, etc.)
- Advanced interactive graph visualizations (3D, force-directed layouts, etc.)
- Automatic package updates (re-sync npm data periodically)
- Bundle size analysis (requires external API like bundlephobia)
- Batch dependency linking job (can link manually in worker for MVP)

## Next Steps After MVP

1. Seed initial packages (popular ones like React, Hono, etc.)
2. Test request → fetch → display flow
3. Validate tag taxonomy
4. Monitor npm API usage and rate limits
5. Plan Phase 2: Community features
