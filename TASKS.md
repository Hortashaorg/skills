# TechGarden - Task Tracker

> **Current Sprint:** [SPRINT-2.md](./SPRINT-2.md) - Projects & Data Foundation

---

## Investigation: WebSocket Connection Issues

**Problem:** Intermittent WebSocket timeouts. Zero client times out after 10s, connections eventually succeed on retry.

### Findings
- Zero hardcodes `CONNECT_TIMEOUT_MS = 10_000` (not configurable)
- Issue is NOT Cloudflare - reproduces via direct NodePort
- Session affinity added to view-syncers (helps with CVR ownership)
- Heavy graph may contribute to slow initial sync

### Related
- ✅ Schema simplification (Milestone 7) completed - should reduce sync payload significantly

---

## Milestone 10: Component Library

**Goal:** Clean up variant patterns, extract simple reusable components

### 10.1 CVA Variant Audit
- [ ] Audit components with Tailwind class overrides
- [ ] Convert overrides to proper CVA variants where appropriate
- [ ] Document variant patterns in component stories
- [ ] Standardize size variants across components (Button, UpvoteButton, Badge, etc. should have consistent `sm`/`md`/`lg` definitions)

### 10.2 New Components (if needed)
- [ ] Simple Table component - for admin tables (optional, current inline approach works)
- [ ] ~~Pagination component~~ - deprioritized after admin simplification

---

## Completed

### Milestone 9: GDPR & Data Strategy

- Privacy policy page (`/privacy`)
- Account deletion with anonymization (projects reassigned to "Deleted User")
- Personal data (email, username, upvotes) deleted on account removal
- Zitadel account remains separate (user manages independently)

---

### Milestone 8 & 8b: Projects & Route Restructure

- Projects feature: create, edit, delete projects with package associations
- Route restructure: `/packages`, `/projects` (public browse), `/me/*` (user content)
- Landing page with WIP messaging
- User profile page with username editing
- "Add to project" button on package detail pages
- AlertDialog, Breadcrumbs components

---

### Milestone 7: Schema Simplification

Reduced data graph by storing release channels instead of all versions.

**Schema Changes:**
- `packageReleaseChannels` table (1-3 per package vs 100+ versions)
- `channelDependencies` linked to channels, not versions
- `packageFetches` replaced `packageRequests` for simpler fetch tracking
- Package status: `active`, `failed`, `placeholder`

**Worker Improvements:**
- Single LEFT JOIN query for placeholder scheduling
- Batch placeholder creation with `ensurePackagesExist`
- Efficient dependency resolution: O(deps) not O(all packages)
- Cooldown marks fetches as failed, not completed

**Frontend Updates:**
- Fetch history section on package pages
- Status/version badges integrated into PackageCard
- Admin dashboard: top 25 pending fetches, failed packages grid
- Backend stats endpoint for accurate pending count

---

### Milestone 1-6 (MVP)

| Milestone | Description |
|-----------|-------------|
| 1. Core Data Flow | Search → request → fetch → display pipeline |
| 2. Data Population | Auto-queue dependencies, rate limiting |
| 3. User Value | Browsing, details, upvoting, auth UX |
| 4. Admin & Tags | Role system, admin dashboard, tag management |
| 5. Observability | Zero telemetry, Grafana dashboards |
| 6. Deployment | Kubernetes, CI/CD, runtime config |
