# TechGarden - Backlog

> **Current Sprint:** [SPRINT-2.md](./SPRINT-2.md) - Projects & Data Foundation

---

## Backlog

### Design System Consistency

- [x] **ProjectForm colors** - Uses gray-300/500/700 instead of design tokens (on-surface, surface, etc.)
- [x] **Hardcoded button classes** - `/me/projects/index.tsx` uses inline classes instead of `<Button>` component
- [x] **Select styling duplication** - SearchBar and home index now use Select component
- [x] **Standardize size variants** - Button md aligned to px-3/py-1.5; compact elements (Badge, UpvoteButton) stay sm/md only

### Dead Code Removal

- [x] **Remove unused Label component** - Exported but never imported anywhere
- [x] **Remove unused TextField sub-components** - TextFieldTextArea, TextFieldDescription, TextFieldErrorMessage never used

### Component Consolidation

- [x] **"Add to project" dropdown** - Now uses Kobalte Popover with animations, click-outside-to-close, and accessibility
- [x] **Input primitive created** - SearchBar, profile, and ProjectForm now use Input component instead of raw inputs
- [ ] **CVA variant audit** - Convert Tailwind class overrides to proper CVA variants where appropriate
- [x] **Reuse ProjectCard** - `/routes/projects/index.tsx` now imports ProjectCard with `showAuthor` prop
- [x] **Admin tags confirm dialog** - Now uses AlertDialog component

### Future Components

- [x] **Icon library** - Icon primitives with CVA size variants (SearchIcon, CheckIcon, ChevronDownIcon, FolderIcon, etc.)
- [x] **IconLinkCard** - Profile Quick Links now use IconLinkCard component
- [ ] **Simple Table component** - For admin tables (optional, current inline approach works)

### Form Patterns

- [x] **Standardize form components** - ProjectForm now uses Input primitive (TagForm uses TextField for labeled inputs)
- [ ] **Form validation patterns** - Unify error state handling across forms
- [x] **Use Select component** - SearchBar and home now use Kobalte-based Select component

### Code Quality

- [x] **Extract `formatDate()` utility** - Now in `@package/common` with formatDate, formatShortDate, formatDateTime, formatCompactDateTime
- [ ] **Split large components** - package/index.tsx could be broken down further
- [ ] **Update README** - Add deployment instructions

### Documentation

- [ ] **Update CLAUDE.md files** - Ensure all CLAUDE.md files reflect current patterns after backlog cleanup

---

## Investigation: WebSocket Connection Issues

**Problem:** Intermittent WebSocket timeouts. Zero client times out after 10s, connections eventually succeed on retry.

### Findings
- Zero hardcodes `CONNECT_TIMEOUT_MS = 10_000` (not configurable)
- Issue is NOT Cloudflare - reproduces via direct NodePort
- Session affinity added to view-syncers (helps with CVR ownership)
- Heavy graph may contribute to slow initial sync

### Related
- Schema simplification (Milestone 7) completed - should reduce sync payload significantly

---

## Completed

### Milestone 9: GDPR & Data Strategy

- Privacy policy page (`/privacy`)
- Account deletion with anonymization (projects reassigned to "Deleted User")
- Personal data (email, username, upvotes) deleted on account removal
- Zitadel account remains separate (user manages independently)

### Milestone 8 & 8b: Projects & Route Restructure

- Projects feature: create, edit, delete projects with package associations
- Route restructure: `/packages`, `/projects` (public browse), `/me/*` (user content)
- Landing page with WIP messaging
- User profile page with username editing
- "Add to project" button on package detail pages
- AlertDialog, Breadcrumbs components

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

### Milestone 1-6 (MVP)

| Milestone | Description |
|-----------|-------------|
| 1. Core Data Flow | Search → request → fetch → display pipeline |
| 2. Data Population | Auto-queue dependencies, rate limiting |
| 3. User Value | Browsing, details, upvoting, auth UX |
| 4. Admin & Tags | Role system, admin dashboard, tag management |
| 5. Observability | Zero telemetry, Grafana dashboards |
| 6. Deployment | Kubernetes, CI/CD, runtime config |
