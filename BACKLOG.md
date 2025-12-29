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
- [ ] Zero preloading on link hover

### Performance
- [ ] Query optimization audit
- [ ] Version list virtualization (1000+ versions)

### Code Quality
- [ ] `formatDate()` utility in `@package/common`
- [ ] Split large components (VersionSelector, package/index.tsx)
- [ ] Update README with deployment instructions

---

## Technical Debt / Ops

- [ ] Structured logging in backend and worker
- [ ] Worker metrics (requests processed, failures, duration)
- [ ] Health checks and readiness probes
- [ ] Resource limits and autoscaling config
- [ ] Database backup strategy

---

## Rate Limiting (Verify Status)

- [ ] User rate limiting (10 requests/hour) - verify if implemented
- [ ] Clear error messages when limit reached
