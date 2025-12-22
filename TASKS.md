# TechGarden MVP - Task Tracker

> **Product definition:** See [MVP.md](./MVP.md) for full feature specs and schema.

Progress toward a deployable MVP with data flowing and utility for users.

---

## Milestone 1: Core Data Flow

**Goal:** End-to-end flow working: search → request → fetch → display

### Database & Zero Layer
- [x] Create migration with all MVP tables
- [x] Run migration successfully
- [x] Generate Zero schema types
- [x] Define queries: `packages.search`, `packages.byName`, `packages.byId`, `packages.list`
- [x] Define queries: `packageRequests.pending`, `packageRequests.byId`, `packageRequests.existingPending`
- [x] Define mutators: `packageRequests.create` (auth protected)
- [x] Define mutators: `packageUpvotes.create`, `packageUpvotes.remove` (auth protected)

### UI Components
- [x] SearchInput composite (generic, works with any data)
- [x] Badge component (has success/info/warning/danger variants)
- [x] Button component
- [x] Card component
- [x] Toast system
- [x] Tabs component (line/pills variants, Kobalte-based)
- [x] Select component (dropdown, Kobalte-based)
- [x] UpvoteButton component (toggle, shows count, disabled for anon)

### Homepage Search Integration
- [x] Wire SearchInput to `packages.list` query on homepage
- [x] Display package results (name, description, registry badge)
- [x] Registry filter dropdown (All, npm, jsr, brew, apt)
- [x] "Not found" state when package doesn't exist in DB
- [x] "Request this package" button calling `packageRequests.create`
- [x] Registry selection when requesting (inherits filter or manual pick)
- [x] Show request status after submitting
- [x] User info in navbar (Anonymous or user ID)
- [x] Toast notifications for request feedback

### Worker Job
- [x] Create `services/worker/` service
- [x] npm API client (fetch `registry.npmjs.org/{name}`)
- [x] npm response mapper (extract versions, dependencies, dist-tags)
- [x] Request processor: query pending → fetch → parse → store
- [x] Process all pending requests in one run, then exit
- [x] Update request status throughout process (fetching → completed/failed)
- [x] Add `pnpm worker start` script
- [x] Handle errors gracefully (mark failed, continue with next)

### End-to-End Validation
- [x] Search for non-existent package → request it → run worker → package appears

---

## Milestone 2: Data Population

**Goal:** Database grows automatically through dependency chains

### Auto-Queue Dependencies
- [x] Parse dependencies from npm response (runtime, dev, peer, optional)
- [x] Create auto-queued requests for each dependency
- [x] Handle circular dependencies via deduplication
- [x] Link `dependencyPackageId` when dependency package exists

### Rate Limiting & Protection
- [x] Package cooldown (1 hour between fetches)
- [x] Request deduplication (no duplicate pending requests)
- [x] Retry with backoff, discard after 3 failures

---

## Milestone 3: User Value

**Goal:** Useful features for both anonymous and logged-in users

### Package Browsing
- [x] Homepage shows recently updated packages
- [x] Search with registry filter (name-only matching)
- [x] Upvoting system (affects search result ordering)

### Package Details
- [x] `/package/:registry/:name` route - package detail page
- [x] Metadata display (name, description, homepage, repo)
- [x] Version selector (defaults to latest stable, search for older versions)
- [x] Dependency list with tabs by type (runtime, dev, peer, optional)
- [x] Dependencies link to package page when fetched

### User Dashboard
- [ ] `/my-requests` route - view request history
- [ ] Real-time status updates

---

## Milestone 4: Admin & Polish

**Goal:** Admin features and demo-ready polish

### Authorization
- [ ] Role system (admin vs user)
- [ ] Admin-only mutators for tags and package-tags
- [ ] Audit logging for admin actions

### Tag System
- [ ] `/admin/tags` - tag management (CRUD)
- [ ] Assign tags to packages
- [ ] `/tags` and `/tags/:slug` routes for browsing by tag

### Polish
- [ ] Error states and edge cases
- [ ] Loading skeletons
- [ ] Mobile responsiveness

---

## Milestone 5: Multi-Registry Support

**Goal:** Support multiple package registries with cross-registry dependencies

### Registry Adapters
- [ ] JSR adapter (use `npm.jsr.io` - npm-compatible endpoint)
- [ ] PyPI adapter (Python packages)
- [ ] crates.io adapter (Rust packages)
- [ ] Homebrew adapter (macOS packages)

### Cross-Registry Dependencies

**Problem:** npm packages can depend on JSR packages (e.g., `@jsr/std__path`). These show as "not found" when we only query npm.

**How it works:**
- `@jsr/std__path` on npm → `@std/path` on JSR
- Pattern: `@jsr/{scope}__{name}` → `@{scope}/{name}`
- JSR provides npm-compatible registry at `npm.jsr.io`
- Package managers use `.npmrc` to route: `@jsr:registry=https://npm.jsr.io`

**Implementation:**
- [ ] Detect `@jsr/*` pattern in npm dependencies
- [ ] Route `@jsr/*` requests to `npm.jsr.io` endpoint
- [ ] Normalize name: `@jsr/std__path` → `@std/path`
- [ ] Store with `registry: "jsr"` for proper linking
- [ ] Add `dependencyRegistry` field to track source registry per dependency
- [ ] Link cross-registry dependencies when both packages exist

---

## Current Focus

**Active:** Milestone 3 - User Value

**Completed:** Milestone 1 (full data flow), Milestone 2 (auto-queue, deduplication, cooldown, retry)

**Next task:** User dashboard

---

## Notes

- Homepage uses card grid for search results (max 20), links to package detail
- Homepage shows "Recently updated" packages when no search query
- Homepage search filters by package name only (not description)
- Search results sorted by upvote count (highest first)
- Package detail page at `/package/:registry/:name` with version selector
- Version selector supports exact versions, dist-tags (latest, next), and ranges (^1.0.0, ~2.3.0)
- Version metadata: `latestVersion`, `distTags` on packages; `isPrerelease`, `isYanked` on versions
- Registry filter with extensible options in `lib/registries.ts`
- All user-facing mutators require authentication (throw if `ctx.userID === "anon"`)
- Worker uses Zero transactions directly, not mutators (for bulk operations)
- Worker runs as a job (not daemon) - scheduled via Kubernetes CronJob, processes 10 requests per run
- Anonymous users can browse and see upvote counts (button renders as static, non-clickable); logged-in users can request packages and upvote
- npm schema handles edge cases: unpublished packages, malformed deps (string instead of object), unknown field types
