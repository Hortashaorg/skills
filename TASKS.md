# TechGarden - Task Tracker

> **Current Sprint:** [SPRINT-2.md](./SPRINT-2.md) - Projects & Data Foundation

---

## Investigation: WebSocket Connection Issues

**Problem:** Intermittent WebSocket timeouts through Cloudflare Tunnel. Zero client times out after 10s, connections eventually succeed on retry.

### Test Scenarios
- [ ] Local frontend → Production (through Cloudflare) - add `localhost:4321` to backend CORS
- [ ] NodePort bypass - expose Zero directly, skip Cloudflare entirely
- [ ] Minimal WebSocket test service - isolate Zero vs raw WebSocket behavior

### Findings
- Zero hardcodes `CONNECT_TIMEOUT_MS = 10_000` (not configurable)
- Internal cluster connections work perfectly
- "context canceled" errors suggest Cloudflare edge aborting before completion

---

## Milestone 7: Projects Feature

**Goal:** Users can create projects and associate packages with them

### 7.1 Database & Zero Layer
- [ ] Schema: `projects` table (id, name, description, userId, createdAt, updatedAt)
- [ ] Schema: `project_packages` table (id, projectId, packageId, createdAt) - unique on (projectId, packageId)
- [ ] Migration and `pnpm database zero`
- [ ] Queries: `projects.mine`, `projects.byId`, `projects.public`
- [ ] Mutators: `projects.create`, `projects.update`, `projects.delete`
- [ ] Mutators: `projectPackages.add`, `projectPackages.remove`

### 7.2 Project Pages
- [ ] `/projects` - List user's projects (requires auth)
- [ ] `/projects/new` - Create project form
- [ ] `/projects/:id` - Project detail with package list
- [ ] `/projects/:id/edit` - Edit project metadata

### 7.3 Package Integration
- [ ] "Add to project" button on package detail page
- [ ] Project selector dropdown/modal
- [ ] Remove package from project on project detail page

---

## Milestone 8: GDPR & Data Strategy

**Goal:** Establish patterns for user data handling before we accumulate more user content

### 8.1 Documentation
- [ ] Data inventory: what user data we store and why
- [ ] Data retention policy document
- [ ] Privacy policy page (`/privacy`)

### 8.2 User Rights
- [ ] Account settings page (`/settings`)
- [ ] Data export: download your data as JSON
- [ ] Account deletion flow with clear cascade behavior

### 8.3 Technical Patterns
- [ ] Anonymization strategy: replace userId with "deleted-user" or similar
- [ ] Keep contributions (tags, projects, metadata) but anonymize ownership
- [ ] Hard delete personal data (email, profile info from Zitadel)

---

## Milestone 9: Component Library

**Goal:** Extract reusable components, clean up variant patterns

### 9.1 New Components
- [ ] Table component - extract from admin pages
- [ ] Pagination component - extract from ResultsGrid + RequestsTable

### 9.2 Variant Audit
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
