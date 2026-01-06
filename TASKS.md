# Sprint 6 Tasks

> **Current Sprint:** [SPRINT-6.md](./SPRINT-6.md) - Polish, SEO & Identity

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

## Auth Cleanup

- [ ] Remove email from accounts table (after all users have zitadelId populated)
- [ ] Zitadel user sync job: anonymize accounts when IdP account deleted
- [ ] Zitadel user sync job: assign roles to new accounts for self-service deletion

---

## GDPR & Data Privacy

- [ ] Data export: individual records, not aggregates (account, projects, suggestions, votes)
- [ ] Review cookie usage (auth cookies = strictly necessary, no consent banner needed)
- [ ] Edge case: users who delete IdP account before app account (handled by sync job)

---

## Backlog

### Future Features
- Prefix vs contains match ranking for search
- Additional suggestion types (remove_tag, link_package, set_attribute)
- Generalize curation UI to handle multiple suggestion types
- New tag proposals (currently: existing tags only)
- Complex spam detection
- Email/push notifications
- Notification preferences/settings
- Additional registry adapters (JSR, Homebrew, apt)

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
