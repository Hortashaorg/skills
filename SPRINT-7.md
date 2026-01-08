# Sprint 7: Zitadel Integration & Expansion

> **Goal:** Complete Zitadel webhook handlers based on logged event data, expand platform features.

---

## Zitadel Webhook Handlers

After exploring webhook payloads in Sprint 6, implement actual handlers:

- [ ] User deleted event: set deletedAt on account (zitadelId lookup)
- [ ] User created event: assign default roles for self-service deletion
- [ ] Edge case: users who delete IdP account before app account
- [ ] Other events as needed based on logged data

---

## Backlog (Future)

See [BACKLOG.md](./BACKLOG.md) for full list.
