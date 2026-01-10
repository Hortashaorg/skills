# Sprint 7: Profiles, JSR & Zitadel

> **Goal:** Add public user profiles, expand to JSR registry, complete Zitadel webhook handlers.

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

## Zitadel Webhook Handlers

Complete webhook integration based on logged event data:

- [ ] User deleted event: set deletedAt on account (zitadelId lookup)
- [ ] User created event: assign default roles for self-service deletion
- [ ] Edge case: users who delete IdP account before app account

---

## Tech Debt Cleanup

Small improvements to code quality:

- [ ] Consolidate inline icons (UserIcon, MenuIcon, CloseIcon → icon primitives)
- [ ] Centralize constants (limits, timeouts, batch sizes → config module)
- [ ] Extract reusable mutation error handler (console.error + toast pattern)

---

## Backlog (Future)

See [BACKLOG.md](./BACKLOG.md) for full list.
