# Sprint 6 Tasks

> **Current Sprint:** [SPRINT-6.md](./SPRINT-6.md) - Polish, SEO & Identity

---

## Brand Color & Visual Identity

- [x] Define brand green (garden-themed accent color)
- [x] Apply to navbar: "TechGarden" with green emphasis
- [x] Use for key emphasis text, CTAs, success states
- [x] Dark mode: ensure brand green has good contrast
- [x] Favicon: simple green-themed icon (already exists)

---

## SEO & Discoverability

- [ ] Audit current SEO state
- [ ] Package pages: titles, descriptions from metadata
- [ ] Consider: sitemap, structured data

---

## Homepage & Onboarding

- [ ] Highlight curation/contribution system
- [ ] Show gamification (leaderboard preview?)
- [ ] Clearer account value prop
- [ ] Better entry points to explore

---

## Polish & UX

- [x] Infinite scroll refinements (snapshot pattern, no jumping/jerking)
- [ ] Empty state improvements
- [x] Dropdown keyboard navigation (migrated to Kobalte DropdownMenu)
- [ ] Dark mode contrast audit (WCAG AA)

---

## Auth Cleanup

- [x] Zitadel Actions 2 webhook endpoint (POST) - services/webhook
  - Handlers deferred to Sprint 7 (need to explore event payloads first)
- [x] Remove email from accounts table, make zitadelId NOT NULL

---

## GDPR & Data Privacy

- [x] Data export: GET /api/account/export (all user data as JSON)
- [x] Soft delete with deletedAt, getDisplayName shows "Deleted User"
- [x] Partial unique index on zitadelId (allows re-registration after deletion)
- [x] Export button on profile page
- [x] Review cookie usage (auth cookies = strictly necessary, no consent banner needed)

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Completed (Previous Sprints)

### Sprint 5: Search & Discovery UX

- Package search: exact match prioritization, placeholder visibility
- "Add package" card when no exact match exists
- Infinite scroll with skeleton loading, back to top button
- Full-card clickable with distinct upvote hover
- Project package dropdown: exact match first, status display, action items
- SearchInput keyboard scroll-into-view
- GitHub OAuth via Zitadel, proactive token refresh
- GDPR-compliant account deletion (anonymization)
- Privacy policy updated for OAuth-only flow

### Sprint 4: CI/CD, Observability & Notifications

- GitHub Actions CI (lint, typecheck, Storybook tests)
- OpenTelemetry instrumentation (backend + worker)
- Structured logging with OTLP export
- User notifications system (schema, triggers, UI)
- Notification bell with hover dropdown preview
- /me/notifications page with mark read/unread
- Layout refactoring (Navbar, NavLinks, ConnectionStatus, HoverDropdown)
- Storybook stories for Navbar and HoverDropdown
- Curation skip functionality (session-based)
- Hamburger menu accessibility improvements

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
