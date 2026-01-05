# Sprint 5 Tasks

> **Current Sprint:** [SPRINT-5.md](./SPRINT-5.md) - Search & Discovery UX

---

## Package Search Friction

Goal: Make finding and adding packages frictionless.

### Edge Cases to Solve
- Exact name typed but drowns in popular results ("tailwindcss" buried under "tailw*")
- Short package names impossible to find ("tai" matches too many)
- Recently requested packages invisible (placeholder status)
- No guidance when package doesn't exist

### Search Results Improvements
- [ ] Exact match prioritization
- [ ] Include placeholder packages in results
- [ ] Visual distinction for placeholders ("Pending" badge)
- [ ] Consider: prefix vs contains match ranking

### Project "Add Package" UX
- [ ] Apply search improvements to project dropdown
- [ ] Guidance when package not found
- [ ] Handle short name edge cases

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

## Branding & Polish

- [ ] Logo (favicon, navbar, og:image)
- [ ] Color palette refinement
- [ ] Dark mode contrast audit (WCAG AA)
- [ ] Typography review
- [ ] Tagline / about page
- [ ] Empty state improvements
- [ ] HoverDropdown keyboard navigation

---

## Auth & Token Management

- [ ] Verify token refresh works after navbar refactoring
- [ ] Proactive token refresh before expiry
- [ ] Keep needs-auth as fallback
- [ ] Test auth flow end-to-end

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
