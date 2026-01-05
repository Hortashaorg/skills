# Sprint 5 Tasks

> **Current Sprint:** [SPRINT-5.md](./SPRINT-5.md) - Search & Discovery UX

---

## Search Improvements

### Include Placeholder Packages in Results
- [ ] Modify `queries.packages.search` to include `status IN ("active", "placeholder")`
- [ ] Add `status` field to search result data for UI differentiation
- [ ] Update SearchInput results to show "Pending" badge for placeholders
- [ ] Verify placeholders can be added to projects

### Exact Match Prioritization
- [ ] Add exact match detection in search results processing
- [ ] Sort order: 1) Exact name match, 2) upvoteCount DESC, 3) name ASC

---

## Request Flow Improvements

### Inline Package Request
- [ ] Detect when search query doesn't match any existing package name exactly
- [ ] Show "Request '{query}' from npm?" option in dropdown
- [ ] On select: call `requestPackage` mutator
- [ ] New placeholder immediately appears in search results

### Visual Feedback for Pending Packages
- [ ] "Pending" badge on placeholder packages in search results
- [ ] "Pending" indicator in project package lists
- [ ] Tooltip explaining the pending state
- [ ] Reactive update when worker completes fetch

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
