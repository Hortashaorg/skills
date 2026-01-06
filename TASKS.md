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

- [x] Verify token refresh works after navbar refactoring
- [x] Proactive token refresh before expiry
- [x] Keep needs-auth as fallback
- [x] Switch to GitHub as Zitadel identity provider (remove email/password)
- [x] Store Zitadel user ID instead of email (zitadelId field added, lookup updated)
- [x] Remove email verification flow (not needed with OAuth provider)
- [x] Remove email references from UI (profile, privacy policy, project detail)
- [x] Account deletion → anonymization (null out PII, keep contributions)
- [ ] Remove email from accounts table (after all users have zitadelId populated)
- [ ] Zitadel user sync job: anonymize accounts when IdP account deleted
- [ ] Zitadel user sync job: assign roles to new accounts for self-service deletion

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

## GDPR & Data Privacy

Review data storage after switching to OAuth-only authentication.

- [x] Update privacy policy for OAuth-only flow (GitHub sign in, no email stored)
- [x] Account deletion anonymizes PII (name, email, zitadelId → null)
- [ ] Data export: individual records, not aggregates (account, projects, suggestions, votes)
- [ ] Review cookie usage (auth cookies = strictly necessary, no consent banner needed)
- [ ] Edge case: users who delete IdP account before app account (handled by sync job)

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
