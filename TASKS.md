# Sprint 8 Tasks

> **Current Sprint:** [SPRINT-8.md](./SPRINT-8.md) - UI Polish & Profiles

---

## Deleted User Display ✅

- [x] Use getDisplayName() consistently across all components
- [x] Update ProjectCard, ProjectDetail, CurateTab
- [x] Update ReviewQueue, Backlog, Leaderboard, Landing

---

## Public User Profiles

- [ ] Route: `/u/:username` for public profile pages
- [ ] Display: username, contribution score, member since
- [ ] Show user's public projects
- [ ] Show curation activity summary
- [ ] Link from leaderboards to profiles

---

## JSR Registry Adapter

- [ ] Create JSR adapter following npm adapter pattern
- [ ] Schema, client, mapper for JSR packages
- [ ] Registry selection in package search/browse
- [ ] Test with popular JSR packages

---

## Tech Debt Cleanup

- [ ] Consolidate inline icons (UserIcon, MenuIcon, CloseIcon → icon primitives)
- [x] Centralize constants (limits, timeouts, batch sizes → lib/constants.ts)
- [ ] Extract reusable mutation error handler (console.error + toast pattern)

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Completed (Previous Sprints)

### Sprint 7: Zitadel Webhooks

- Zitadel webhook handlers for user lifecycle events
- User deleted: soft-delete account via zitadelId lookup
- User created (OAuth): verify email + assign ORG_USER_SELF_MANAGER role
- Fixed email verification API (v1 management API, not v2)

### Sprint 6: Polish, SEO & Identity

- Brand colors: garden-themed green accent, dark mode toggle
- SEO: @solidjs/meta, dynamic titles/descriptions, Open Graph, robots.txt
- Homepage: new value proposition, curation feature card, leaderboard preview
- Polish: infinite scroll, Dropdown component (Kobalte), dark mode contrast
- Auth: Zitadel webhook endpoint, removed email from accounts
- GDPR: data export, soft delete, re-registration support

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
