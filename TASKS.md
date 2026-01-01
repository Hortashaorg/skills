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
- Schema simplification (Milestone 7) should reduce sync payload significantly

---

## Milestone 7: Schema Simplification

**Goal:** Reduce data graph size by storing only notable versions instead of all versions

### Current Schema (heavy)
```
packages → packageVersions (100+ per package) → packageDependencies (per version)
```

### Target Schema (light)
```
packages (metadata, latestVersion, latestStableVersion)
packageReleaseChannels (1-3 per package: stable, next, beta, canary)
packageDependencies (per channel, not per version)
```

### 7.1 Schema Changes
- [ ] Add `packageReleaseChannels` table (packageId, channel, version, publishedAt)
- [ ] Update `packageDependencies` to reference channel instead of version
- [ ] Add channel enum: `stable`, `next`, `beta`, `canary`, `experimental`
- [ ] Keep `latestVersion` and add `latestStableVersion` to packages

### 7.2 Migration Strategy
- [ ] Create new tables alongside existing
- [ ] Worker: populate release channels from existing versions (extract latest per dist-tag)
- [ ] Worker: populate new dependencies from latest version deps
- [ ] Update queries to use new structure
- [ ] Update frontend to use release channels
- [ ] Drop old `packageVersions` table (after verification)

### 7.3 Worker Updates
- [ ] Fetch logic: only store notable versions (from dist-tags)
- [ ] Dependency linking: link to packages, associate with channel
- [ ] Re-fetch strategy: update channels when package is refreshed

---

## Milestone 8: Projects Feature

**Goal:** Users can create projects and associate packages with them

### 8.1 Database & Zero Layer
- [ ] Schema: `projects` table (id, name, description, userId, createdAt, updatedAt)
- [ ] Schema: `project_packages` table (id, projectId, packageId, createdAt) - unique on (projectId, packageId)
- [ ] Migration and `pnpm database zero`
- [ ] Queries: `projects.mine`, `projects.byId`, `projects.public`
- [ ] Mutators: `projects.create`, `projects.update`, `projects.delete`
- [ ] Mutators: `projectPackages.add`, `projectPackages.remove`

### 8.2 Project Pages
- [ ] `/projects` - List user's projects (requires auth)
- [ ] `/projects/new` - Create project form
- [ ] `/projects/:id` - Project detail with package list
- [ ] `/projects/:id/edit` - Edit project metadata

### 8.3 Package Integration
- [ ] "Add to project" button on package detail page
- [ ] Project selector dropdown/modal
- [ ] Remove package from project on project detail page

---

## Milestone 9: GDPR & Data Strategy

**Goal:** Establish patterns for user data handling before we accumulate more user content

### 9.1 Documentation
- [ ] Data inventory: what user data we store and why
- [ ] Data retention policy document
- [ ] Privacy policy page (`/privacy`)

### 9.2 User Rights
- [ ] Account settings page (`/settings`)
- [ ] Data export: download your data as JSON
- [ ] Account deletion flow with clear cascade behavior

### 9.3 Technical Patterns
- [ ] Anonymization strategy: replace userId with "deleted-user" or similar
- [ ] Keep contributions (tags, projects, metadata) but anonymize ownership
- [ ] Hard delete personal data (email, profile info from Zitadel)

---

## Milestone 10: Component Library

**Goal:** Extract reusable components, clean up variant patterns

### 10.1 New Components
- [ ] Table component - extract from admin pages
- [ ] Pagination component - extract from ResultsGrid + RequestsTable

### 10.2 Variant Audit
- [ ] Audit components with Tailwind class overrides
- [ ] Convert overrides to proper CVA variants where appropriate

---

## Completed

### Milestone 1-6 (MVP)

| Milestone | Description |
|-----------|-------------|
| 1. Core Data Flow | Search → request → fetch → display pipeline |
| 2. Data Population | Auto-queue dependencies, rate limiting |
| 3. User Value | Browsing, details, upvoting, auth UX |
| 4. Admin & Tags | Role system, admin dashboard, tag management |
| 5. Observability | Zero telemetry, Grafana dashboards |
| 6. Deployment | Kubernetes, CI/CD, runtime config |
