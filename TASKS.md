# Sprint 4 Tasks

> **Current Sprint:** [SPRINT-4.md](./SPRINT-4.md) - CI/CD, Observability & Notifications

---

## PR Workflow

### GitHub Actions CI ✓
- [x] Create `.github/workflows/ci.yml` for PR checks
- [x] Run `pnpm check` (Biome lint + format)
- [x] Run `pnpm all typecheck` (TypeScript all workspaces)
- [x] Run `pnpm frontend test` (Storybook tests)
- [x] Fail PR if any check fails

---

## Observability

### Telemetry Instrumentation ✓
- [x] Add OpenTelemetry SDK to backend service
- [x] Add OpenTelemetry SDK to worker service
- [x] Configure OTLP exporter to Grafana (via otel-lgtm container)
- [x] Instrument key operations:
  - [x] Backend: HTTP auto-instrumentation + request metrics middleware
  - [x] Worker: Root span (worker.run), child spans (worker.packages, worker.fetch, worker.scores)
- [x] Add trace context to structured logs (via OTLP logs)
- [x] Replace console.log with structured logger (pino + OTLP)

### Metrics to Track ✓
- [x] Request latency (backend) - http.duration_ms histogram
- [x] Fetch success/failure rates (worker) - via span attributes (counters reset each run)
- [x] Registry API response times (worker) - via span durations (batch job, no histograms)
- [x] Score calculation duration (worker) - via worker.scores span

---

## User Notifications ✓

### Database Schema ✓
- [x] Create `notifications` table
  - id, accountId, type, title, message, read, relatedId, createdAt
- [x] Define notification types enum
- [x] Run migrations and generate Zero schema

### Notification Triggers ✓
- [x] `suggestion_approved` - "Your tag suggestion was approved"
- [x] `suggestion_rejected` - "Your tag suggestion was rejected"

### Frontend UI ✓
- [x] Notification bell icon in header
- [x] Unread count badge
- [x] Dropdown/panel showing recent notifications
- [x] Mark as read functionality (+ mark unread)
- [x] /me/notifications page for full list

---

## Curation UX

### Skip Functionality
Session-based skip using SolidJS signals (resets on page refresh):
- [ ] Add `skippedIds` signal (Set) to curation page state
- [ ] Add "Skip" button next to Approve/Reject in ReviewQueue
- [ ] Skip adds current suggestion ID to set, clears selection (auto-advances)
- [ ] Modify `pendingSuggestions` memo to sort skipped IDs to end of queue
- [ ] Show visual indicator on skipped suggestions when they reappear

### Structured Logging ✓
- [x] Add structured logger to backend and worker (OTLP via createLogger)
- [x] Replace console.log/error with structured logs
- [x] Include trace context in logs (correlate with OTel spans)

---

## Layout Refactoring

### Split Layout into Feature Components
Current Layout.tsx (~700 lines) handles everything. Split for testability:

- [ ] Create `components/feature/navbar/Navbar.tsx` - Desktop navigation
  - Logo, nav links, connection status, notification bell, account dropdown
  - Props: user state, connection state, notifications
- [ ] Create `components/feature/navbar/MobileNavbar.tsx` - Mobile navigation
  - Hamburger menu, collapsible sections, touch-friendly targets
  - Can evolve separately based on mobile UX needs
- [ ] Create `components/feature/navbar/NotificationBell.tsx` - Extract bell + dropdown
- [ ] Create `components/feature/navbar/AccountDropdown.tsx` - Extract account menu
- [ ] Simplify `Layout.tsx` to compose navbar components + breadcrumbs + main content

### Storybook Stories
- [ ] `Navbar.stories.tsx` - States: logged out, logged in, admin, with notifications
- [ ] `MobileNavbar.stories.tsx` - States: closed, open, various menu sections
- [ ] `NotificationBell.stories.tsx` - States: no notifications, unread count, dropdown open
- [ ] `AccountDropdown.stories.tsx` - States: regular user, admin with extra links

### Design Considerations
- Navbar components receive data via props (testable, no Zero queries inside)
- Layout.tsx owns Zero queries and passes data down
- Mobile/desktop can have different interaction patterns (hover vs tap)
- Prepare for future: dark mode toggle, search in navbar, etc.

---

## Backlog

### Future Features
- Additional suggestion types (remove_tag, link_package, set_attribute)
- Generalize curation UI to handle multiple suggestion types
- New tag proposals (currently: existing tags only)
- Complex spam detection
- Email/push notifications
- Notification preferences/settings
- Additional registry adapters (JSR, Homebrew, apt)

---

## Completed (Previous Sprints)

### Sprint 3: UX Polish + Community Curation

- Toast notification system (Kobalte Toast primitive)
- Loading states with Skeleton component
- Form consistency (Input, Textarea components)
- Community curation system (suggestions, votes, contribution scoring)
- Package page restructure with tabs (Overview, Details, Curate)
- Curation review page with leaderboard
- Worker job for contribution score aggregation
- Extensible suggestion type registry

### Sprint 2: Projects & Data Foundation

- Projects feature with CRUD operations
- Route restructure: `/packages`, `/projects`, `/me/*`
- Landing page, user profile, "Add to project" button
- AlertDialog, Breadcrumbs, IconLinkCard, Table components
- Design system consistency and dead code removal
- Privacy policy and GDPR account deletion

### Sprint 1 (Milestones 1-7)

- Core search → request → fetch → display pipeline
- Auto-queue dependencies, rate limiting
- Browsing, details, upvoting, auth UX
- Admin dashboard, tag management, role system
- Schema simplification (release channels vs all versions)
- Kubernetes deployment, CI/CD
