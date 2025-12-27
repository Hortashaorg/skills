# TechGarden MVP - Task Tracker

> **Product definition:** See [MVP.md](./MVP.md) for full feature specs and schema.

---

## Current Status

**Domain:** `tech-garden.dev` (staging: `test.tech-garden.dev`)

**Completed:**
- Milestone 1: Core Data Flow (search → request → fetch → display)
- Milestone 2: Data Population (auto-queue dependencies, rate limiting)
- Milestone 3: User Value (browsing, details, upvoting, auth UX)
- Milestone 4: Admin & Tags (role system, admin dashboard, tag management)

**Next:** Deploy to staging → Monitoring → Iterate

---

## Backlog

Polish and improvements to pick from before/after deploy.

### High Priority

- [x] **Accessibility: ARIA labels** - Add labels to form inputs (SearchBar, RequestForm, VersionSelector)
- [x] **Form UX: Button loading states** - Disable + spinner on submit buttons (TagForm, RequestForm)
- [x] **Error handling: Mutation feedback** - Show toast on upvote/request failures
- [x] **Shared Spinner component** - Extract to `components/ui/spinner` with size variants

### Medium Priority

- [ ] **Full mobile audit** - Layout fixes across all pages
- [ ] **Form validation UX** - Real-time feedback, inline errors, character counts
- [ ] **Shared Pagination component** - Extract from ResultsGrid + RequestsTable
- [ ] **Accessibility: Hamburger menu** - Add aria-label to mobile nav toggle
- [ ] **Edge cases: Long text tooltips** - Add title attributes to truncated package names/descriptions

### Low Priority (Post-Launch)

- [ ] Zero preloading on link hover
- [ ] Query optimization audit
- [ ] `formatDate()` utility in `@package/common`
- [ ] Extract Table components from admin pages
- [ ] Split large components (VersionSelector, package/index.tsx)
- [ ] Update README with deployment instructions
- [ ] **Version list virtualization** - For packages with 1000+ versions
- [ ] **Empty state improvements** - More helpful CTAs and context messages
- [ ] **Dark mode contrast audit** - Verify WCAG AA compliance

### Done

- [x] **Denormalized upvote count** - `upvoteCount` column on packages table for server-side sorting by popularity
- [x] **Server-side search** - `packages.search` query with ILIKE, registry filter, tag filter, sorted by upvotes
- [x] **Load more pagination** - Progressive loading for search results beyond initial limit
- [x] **URL-synced state hook** - `createUrlSignal` for cleaner URL state management
- [x] QueryBoundary component (loading states, stories, applied to package page + dependencies section)
- [x] ErrorFallback stories
- [x] Tag filtering on homepage (multi-select, URL persistence)
- [x] Tags on package cards (max 3, "+X more" overflow)
- [x] 404 page
- [x] Error boundary
- [x] Meta tags (title, description)
- [x] Favicon (SVG seedling)
- [x] Connection status cleanup (hide "Connected")
- [x] Mobile-friendly navbar (hamburger menu, responsive layout)
- [x] Production build verified
- [x] EmptyState component for "no results" UI
- [x] Loading state for initial page load
- [x] Homepage refactor - unified ResultsGrid (loading/empty/results in one component)
- [x] Registry filter synced to URL (`?registry=npm`)
- [x] Consolidated package request into EmptyState action (removed duplicate "not found" UIs)
- [x] `createUrlSignal` hook for URL-synced state (reduces boilerplate)
- [x] `useQuery` result.type pattern for loading states (replaces `useConnectionState` hack)
- [x] Server-side search filtering (`packages.search` query with ILIKE, registry, tag filters)
- [x] Server-side sorting in admin requests (query handles sort order per status)
- [x] Updated CLAUDE.md with correct ZQL capabilities (LIKE, IN, compound filters)

---

## Future Milestones

### Milestone 5: Observability

**Goal:** Production-ready monitoring

- [ ] Configure Zero telemetry
- [ ] Set up Grafana dashboards (connections, sync latency, errors)
- [ ] Worker metrics (requests processed, failures, duration)
- [ ] Structured logging in backend and worker

### Milestone 6: Deployment

**Goal:** Deploy to Kubernetes

**Pre-Launch:**
- [x] Buy domain name (`tech-garden.dev`)
- [ ] SSL certificates (cert-manager)
- [ ] Environment secrets in Kubernetes

**Infrastructure:**
- [ ] Frontend deployment
- [ ] Backend deployment (Hono API)
- [ ] Worker CronJob
- [ ] Zero cache server
- [ ] PostgreSQL
- [ ] Ingress configuration

**Post-Launch:**
- [ ] Health checks and readiness probes
- [ ] Resource limits and autoscaling
- [ ] Backup strategy for database

---

## Completed Milestones (Archive)

<details>
<summary>Milestone 1: Core Data Flow</summary>

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
- [x] Registry filter dropdown
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

</details>

<details>
<summary>Milestone 2: Data Population</summary>

### Auto-Queue Dependencies
- [x] Parse dependencies from npm response (runtime, dev, peer, optional)
- [x] Create auto-queued requests for each dependency
- [x] Handle circular dependencies via deduplication
- [x] Link `dependencyPackageId` when dependency package exists

### Rate Limiting & Protection
- [x] Package cooldown (1 hour between fetches)
- [x] Request deduplication (no duplicate pending requests)
- [x] Retry with backoff, discard after 3 failures

</details>

<details>
<summary>Milestone 3: User Value</summary>

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

### Auth UX
- [x] Sign in button in navbar (primary, prominent)
- [x] Return to previous page after login (sessionStorage)

</details>

<details>
<summary>Milestone 4: Admin & Tags</summary>

### Role System
- [x] Backend: Check `email_verified`, reject login if false
- [x] Frontend: `/verify-email` page with link to Zitadel account management
- [x] Backend: Extract roles from id_token, include in JWT
- [x] Backend: Return `roles` array in `/login` and `/refresh` responses
- [x] Frontend: Update `AuthData` type to include `roles`
- [x] Zero: Update context type to `{ userID, roles }`
- [x] Backend: `getAuthContext()` returns full context for queries/mutators
- [x] Queries: Gate admin queries on `ctx.roles.includes("admin")`
- [x] Frontend: Show/hide admin nav based on roles
- [x] Frontend: Protect `/admin/*` routes (component-level auth check)

### Admin Requests Dashboard
- [x] `/admin/requests` route - view all requests by status
- [x] Real-time status updates (via Zero sync)
- [x] Pagination with 25 items per page
- [x] Tab counts showing total per status
- [x] Failed requests auto-retry via worker

### Tag System
- [x] `/admin/tags` - tag management (CRUD)
- [x] Assign tags to packages (admin-only controls on package detail page)
- [x] Tags visible to all users on package detail page
- [x] Admin dropdown menu in navbar (Package Requests, Tags)
- [x] Tag filtering on homepage search (multi-select dropdown with URL persistence)
- [x] Tags displayed on package cards (max 3, "+X more" overflow)
- [x] Search and tags synced to URL (`?q=react&tags=cli`)

### Navigation
- [x] Active state highlighting in navbar
- [x] Breadcrumbs with auto-generation from routes
- [x] Breadcrumb resolver for dynamic labels (UUID → name)

</details>

---

## Notes

- Homepage uses unified `ResultsGrid` component handling loading/empty/results states
- No filters → "Recently updated" (sorted by updatedAt)
- With filters → search results (sorted by upvotes)
- All filters synced to URL (`?q=...&registry=...&tags=...`)
- Package detail page at `/package/:registry/:name` with version selector
- Version selector supports exact versions, dist-tags (latest, next), and ranges
- All user-facing mutators require authentication
- Worker runs as a job (not daemon) - scheduled via Kubernetes CronJob
- Anonymous users can browse; logged-in users can request packages and upvote

---

## What's Working Well

- Zero query patterns - sections query independently
- QueryBoundary for loading/empty states - consistent pattern across pages
- CVA usage - consistent across UI components
- Storybook coverage - comprehensive stories with light/dark variants
- Accessibility - Kobalte primitives, proper ARIA
- Mutator patterns - Zod validation and auth checks
- Component hierarchy - primitives → ui → composite → feature
- Business logic in hooks - reusable patterns
