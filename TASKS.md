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
- [x] Define mutators: `packageRequests.create`, `markFetching`, `markCompleted`, `markFailed`
- [x] Define mutators: `packages.upsert`, `packageVersions.create`, `packageDependencies.create`

### UI Components
- [x] SearchInput composite (generic, works with any data)
- [x] Badge component (has success/info/warning/danger variants)
- [x] Button component
- [x] Card component
- [x] Toast system

### Homepage Search Integration
- [ ] Wire SearchInput to `packages.search` query on homepage
- [ ] Display package results (name, description, registry badge)
- [ ] "Not found" state when package doesn't exist in DB
- [ ] "Request this package" button calling `packageRequests.create`
- [ ] Show request status after submitting (pending → fetching → completed)

### Worker Service
- [ ] Create `services/worker/` service
- [ ] npm API client (fetch `registry.npmjs.org/{name}`)
- [ ] Request processor: fetch → parse → store via Zero mutators
- [ ] Polling loop (query pending requests every 30s)
- [ ] Update request status throughout process
- [ ] Add `pnpm worker dev` script

### End-to-End Validation
- [ ] Search for non-existent package → request it → worker fetches → package appears

---

## Milestone 2: Data Population

**Goal:** Database grows automatically through dependency chains

### Auto-Queue Dependencies
- [ ] Parse dependencies from npm response (runtime, dev, peer, optional)
- [ ] Create auto-queued requests for each dependency
- [ ] Handle circular dependencies via deduplication
- [ ] Link `dependencyPackageId` when dependency package exists

### Rate Limiting & Protection
- [ ] User request limits (10/hour)
- [ ] Package cooldown (1 hour between fetches)
- [ ] Request deduplication (no duplicate pending requests)
- [ ] Retry with backoff, discard after 3 failures

---

## Milestone 3: User Value

**Goal:** Useful features for both anonymous and logged-in users

### Package Browsing
- [ ] `/packages` route - browse all packages
- [ ] List/grid display with search and filter
- [ ] Sort options (recent, popular, name)

### Package Details
- [ ] `/packages/:id` route - package detail page
- [ ] Metadata display (name, description, homepage, repo)
- [ ] Version history
- [ ] Dependency list with links to other packages
- [ ] Dependency stats (direct count, transitive count)

### User Dashboard
- [ ] `/my-requests` route - view request history
- [ ] Real-time status updates

---

## Milestone 4: Admin & Polish

**Goal:** Admin features and demo-ready polish

### Tag System
- [ ] `/admin/tags` - tag management (CRUD)
- [ ] Assign tags to packages
- [ ] `/tags` and `/tags/:slug` routes for browsing by tag

### Polish
- [ ] Error states and edge cases
- [ ] Loading skeletons
- [ ] Mobile responsiveness

---

## Current Focus

**Active:** Milestone 1 - Core Data Flow

**Completed:** Database schema, Zero queries/mutators, UI components

**Next task:** Homepage search integration (wire SearchInput to package queries)

---

## Notes

- SearchInput is generic - pass any data, it searches and displays
- Feature components only when truly needed (prefer composing existing UI)
- All data access through Zero queries/mutations
- Worker is a separate service polling the database
- Anonymous users can browse; logged-in users can request packages
