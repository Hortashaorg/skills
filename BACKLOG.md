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
- [ ] Hamburger menu aria-label
- [ ] Dark mode contrast audit - WCAG AA compliance

### UX
- [ ] Full mobile audit - layout fixes across all pages
- [ ] Edge cases: Long text tooltips for truncated names/descriptions
- [ ] Empty state improvements - more helpful CTAs
- [ ] Loading skeletons - replace "Loading..." text with proper skeleton/spinner states
- [ ] Error feedback - toast notifications for failed mutations instead of silent failures
- [ ] Zero preloading on link hover

### Performance
- [ ] Query optimization audit

## Technical Debt / Ops

- [ ] Structured logging in backend and worker
- [ ] Worker metrics (requests processed, failures, duration)
- [ ] Health checks and readiness probes
- [ ] Resource limits and autoscaling config
- [ ] Database backup strategy
- [ ] Test coverage - add unit tests and e2e tests (currently Storybook only)
- [ ] Raw form inputs - `detail.tsx` uses raw `<input>`/`<textarea>` instead of Input component

---

## Rate Limiting (Verify Status)

- [ ] User rate limiting (10 requests/hour) - verify if implemented
- [ ] Clear error messages when limit reached
