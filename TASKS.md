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

### Telemetry Instrumentation
- [x] Add OpenTelemetry SDK to backend service
- [x] Add OpenTelemetry SDK to worker service
- [x] Configure OTLP exporter to Grafana (via otel-lgtm container)
- [ ] Instrument key operations:
  - [ ] Backend: Auth flows, mutation/query handlers
  - [ ] Worker: Package fetch duration, registry API calls, score calculations
- [x] Add trace context to structured logs (via OTLP logs)
- [x] Replace console.log with structured logger (createLogger utility)

### Metrics to Track
- [ ] Request latency (backend)
- [ ] Fetch success/failure rates (worker)
- [ ] Registry API response times (worker)
- [ ] Score calculation duration (worker)

---

## User Notifications

### Database Schema
- [ ] Create `notifications` table
  - id, accountId, type, title, message, read, relatedId, createdAt
- [ ] Define notification types enum
- [ ] Run migrations and generate Zero schema

### Notification Triggers
- [ ] `suggestion_approved` - "Your tag suggestion was approved"
- [ ] `suggestion_rejected` - "Your tag suggestion was rejected"

### Frontend UI
- [ ] Notification bell icon in header
- [ ] Unread count badge
- [ ] Dropdown/panel showing recent notifications
- [ ] Mark as read functionality
- [ ] Link to relevant package/suggestion

---

## Curation UX

### Skip Functionality
- [ ] Add "Skip" button to review queue
- [ ] Track skipped suggestions per session
- [ ] Show skipped suggestions at end of queue

### Structured Logging ✓
- [x] Add structured logger to backend and worker (OTLP via createLogger)
- [x] Replace console.log/error with structured logs
- [x] Include trace context in logs (correlate with OTel spans)

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
