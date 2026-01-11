# TechGarden - Backlog

> Items deferred from sprints. Pull into future sprints as priorities shift.

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

- [ ] Zero preloading on link hover
- [ ] Query optimization audit

---

## Technical Debt

### Error Handling
- [ ] Surface errors to users - 16+ places log errors without user feedback
- [ ] Add error type system for worker/backend (retry-able vs permanent)

### Testing
- [ ] Unit tests for backend auth token refresh

### Code Organization
- [ ] Split navbar.tsx (455 lines)

### Ops
- [ ] Zero distributed deployment (retry - had issues with multi-replica setup)

---

## Rate Limiting

- [ ] User rate limiting (10 requests/hour) - verify current state
- [ ] Clear error messages when limit reached
