# TechGarden - Backlog

> Items deferred from sprints. Pull into future sprints as priorities shift.

---

## Growth

- [ ] JSR registry adapter

---

## Engagement

- [ ] User profiles (public profile page)
- [ ] Personal package lists / bookmarks
- [ ] Notifications (package ready, new version)

---

## Polish

### Accessibility
- ~Hamburger menu aria-label~ → Sprint 4
- [ ] Dark mode contrast audit - WCAG AA compliance

### UX
- [ ] Data-driven Navbar navigation - replace hardcoded links with configurable items + visibility functions
- [ ] Full mobile audit - layout fixes across all pages
- [ ] Edge cases: Long text tooltips for truncated names/descriptions
- [ ] Empty state improvements - more helpful CTAs
- [ ] Zero preloading on link hover
- ~Loading skeletons~ → Sprint 3
- ~Toast notifications~ → Sprint 3

### Performance
- [ ] Query optimization audit

## Technical Debt / Ops

- ~Structured logging in backend and worker~ → Sprint 4
- [ ] Worker metrics (requests processed, failures, duration)
- [ ] Health checks and readiness probes
- [ ] Resource limits and autoscaling config
- [ ] Database backup strategy
- [ ] Test coverage - add unit tests and e2e tests (currently Storybook only)
- ~Raw form inputs~ → Sprint 3

---

## Rate Limiting (Verify Status)

- [ ] User rate limiting (10 requests/hour) - verify if implemented
- [ ] Clear error messages when limit reached
