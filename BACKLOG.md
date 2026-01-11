# TechGarden - Backlog

> Items deferred from sprints. Pull into future sprints as priorities shift.

---

## Growth

- [x] JSR registry adapter (Sprint 8)
- [x] NuGet registry adapter (Sprint 8)
- [x] Docker Hub registry adapter (Sprint 8)
- [x] Homebrew registry adapter (Sprint 8)
- [x] Arch Linux registry adapter (Sprint 8)

---

## Projects

- [ ] Package.json import - upload and auto-create project with packages
- [ ] Deprecated/unmaintained package detection in projects

---

## User Discovery

- [ ] Public user profiles (`/u/username` or `/@username`)
- [ ] Display projects, contribution score, curation activity
- [ ] "Expert in" packages (from per-package contribution tracking)

---

## Curation & Discovery

- [ ] New tag proposals (allow users to suggest new tags)
- [ ] Package categories (ORM, HTTP Client, etc.) - compare packages within use cases, upvote ranking, discussion
- [ ] Follow packages/categories - notifications for new versions, discussions, replies
- [ ] Contextual discussions - comments on packages, categories, projects (no free-form posting)

---

## Polish

### UX
- [ ] Data-driven Navbar navigation - replace hardcoded links with configurable items
- [ ] Full mobile audit - layout fixes across all pages
- [ ] Edge cases: Long text tooltips for truncated names/descriptions
- [ ] Zero preloading on link hover

### Performance
- [ ] Query optimization audit

---

## Technical Debt

### Error Handling
- [ ] Surface errors to users - 16+ places log errors without user feedback
- [ ] Add error type system for worker/backend (retry-able vs permanent)

### Testing
- [ ] Unit tests for worker sync logic (process-fetch.ts, db.ts)
- [ ] Unit tests for score calculation algorithm
- [ ] Unit tests for backend auth token refresh

### Type Safety
- [ ] Fix unsafe type assertions (createUrlSignal, curation page casting)

### Code Organization
- [ ] Split large components: me/projects/detail.tsx (605 lines), navbar.tsx (455 lines)

### Ops
- [ ] Zero distributed deployment (retry - had issues with multi-replica setup)

---

## Rate Limiting

- [ ] User rate limiting (10 requests/hour) - verify current state
- [ ] Clear error messages when limit reached
