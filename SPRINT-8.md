# Sprint 8: UI Polish & Profiles

> **Goal:** Fix display issues, add public profiles, continue toward multi-registry.

---

## Deleted User Display ✅

Show "Deleted User" instead of "Anonymous" for soft-deleted accounts:

- [x] Use getDisplayName() consistently across all components
- [x] Update ProjectCard, ProjectDetail, CurateTab
- [x] Update ReviewQueue, Backlog, Leaderboard, Landing

---

## Public User Profiles

Make contribution data visible with public profile pages:

- [ ] Route: `/u/:username` for public profile pages
- [ ] Display: username, contribution score, member since
- [ ] Show user's public projects
- [ ] Show curation activity summary
- [ ] Link from leaderboards to profiles

---

## JSR Registry Adapter

First step toward multi-registry support:

- [ ] Create JSR adapter following npm adapter pattern
- [ ] Schema, client, mapper for JSR packages
- [ ] Registry selection in package search/browse
- [ ] Test with popular JSR packages

---

## Tech Debt Cleanup

Small improvements to code quality:

- [x] Consolidate inline icons (UserIcon, MenuIcon, CloseIcon → icon primitives)
- [x] Centralize constants (limits, timeouts, batch sizes → lib/constants.ts)
- [ ] Extract reusable mutation error handler (console.error + toast pattern)

---

## Backlog (Future)

See [BACKLOG.md](./BACKLOG.md) for full list.
