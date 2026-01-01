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

## Milestone 8: Projects Feature

**Goal:** Users can create projects and associate packages with them

### 8.1 Database & Zero Layer
- [x] Schema: `projects` table (id, name, description, accountId, createdAt, updatedAt)
- [x] Schema: `projectPackages` table (id, projectId, packageId, createdAt) - unique on (projectId, packageId)
- [x] Migration and `pnpm database zero`
- [x] Queries: `projects.mine`, `projects.byId`, `projects.list`
- [x] Mutators: `projects.create`, `projects.update`, `projects.remove`
- [x] Mutators: `projectPackages.add`, `projectPackages.remove`
- [x] Split schema into domain files (`db/schema/` folder)

### 8.2 Project Pages
- [x] `/projects` - List user's projects (requires auth)
- [x] `/projects/new` - Create project form
- [x] `/projects/:id` - Project detail with package list
- [x] Inline editing for name/description (replaced separate edit page)
- [x] Package search to add packages directly on project page
- [x] Packages grouped by tags (packages with multiple tags appear in multiple sections)
- [x] AlertDialog component for delete/remove confirmations

### 8.3 Package Integration
- [ ] "Add to project" button on package detail page
- [ ] Project selector dropdown/modal
- [x] Remove package from project on project detail page

---

## Milestone 8b: Route Restructure

**Goal:** Reorganize routes for public browsing vs user content, add landing page

### New Route Structure
```
/                  → Landing page (intro to TechGarden)
/packages          → Browse all packages (public)
/projects          → Browse all projects (public)
/me                → User profile
/me/projects       → User's own projects
```

### 8b.1 Landing Page
- [ ] Create `/` landing page with intro to TechGarden
- [ ] Hero section with value proposition
- [ ] Feature highlights (projects, packages, collaboration)
- [ ] CTAs to browse packages/projects or sign up

### 8b.2 Browse Pages
- [ ] `/packages` - Public package listing with search/filters
- [ ] `/projects` - Public project listing (all users' projects)
- [ ] Update navbar to link to browse pages

### 8b.3 User Profile & Namespace
- [ ] `/me` - User profile page (info, link to projects, settings)
- [ ] Move `/projects` → `/me/projects` (user's own projects)
- [ ] Update `/projects/new` → `/me/projects/new`
- [ ] Update all internal links and redirects

---

## Milestone 9: GDPR & Data Strategy

**Goal:** Establish patterns for user data handling before we accumulate more user content

### 9.1 Documentation
- [ ] Data inventory: what user data we store and why
- [ ] Data retention policy document
- [ ] Privacy policy page (`/privacy`)

### 9.2 User Rights
- [ ] Add settings/GDPR controls to `/me` profile page (created in 8b)
- [ ] Data export: download your data as JSON
- [ ] Account deletion flow with clear cascade behavior

### 9.3 Technical Patterns
- [ ] Anonymization strategy: replace userId with "deleted-user" or similar
- [ ] Keep contributions (tags, projects, metadata) but anonymize ownership
- [ ] Hard delete personal data (email, profile info from Zitadel)

---

## Milestone 10: Component Library

**Goal:** Clean up variant patterns, extract simple reusable components

### 10.1 CVA Variant Audit
- [ ] Audit components with Tailwind class overrides
- [ ] Convert overrides to proper CVA variants where appropriate
- [ ] Document variant patterns in component stories

### 10.2 New Components (if needed)
- [ ] Simple Table component - for admin tables (optional, current inline approach works)
- [ ] ~~Pagination component~~ - deprioritized after admin simplification

---

## Completed

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
