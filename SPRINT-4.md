# Sprint 4: CI/CD, Observability & Notifications

> **Status:** In Progress
> **Theme:** Production hardening with CI checks, telemetry, and user notifications

---

## Goals

1. **PR Workflow** - Automated checks on pull requests
2. **Observability** - Telemetry instrumentation for backend and worker
3. **User Notifications** - Keep users informed about their interactions

---

## PR Workflow

### GitHub Actions CI
- [ ] Create `.github/workflows/ci.yml` for PR checks
- [ ] Run `pnpm check` (Biome lint + format)
- [ ] Run `pnpm all typecheck` (TypeScript all workspaces)
- [ ] Run `pnpm frontend test` (Storybook tests)
- [ ] Fail PR if any check fails

---

## Observability

### Telemetry Instrumentation
- [ ] Add OpenTelemetry SDK to backend service
- [ ] Add OpenTelemetry SDK to worker service
- [ ] Configure OTLP exporter to Grafana (via otel-lgtm container)
- [ ] Instrument key operations:
  - [ ] Backend: Auth flows, mutation/query handlers
  - [ ] Worker: Package fetch duration, registry API calls, score calculations
- [ ] Add trace context to structured logs
- [ ] Replace console.log with structured logger (pino/winston)

### Metrics to Track
- Request latency (backend)
- Fetch success/failure rates (worker)
- Registry API response times (worker)
- Score calculation duration (worker)

---

## User Notifications

### Database Schema
- [ ] Create `notifications` table
  - id, accountId, type, title, message, read, relatedId, createdAt
- [ ] Define notification types enum

### Notification Types
- [ ] `suggestion_approved` - "Your tag suggestion was approved"
- [ ] `suggestion_rejected` - "Your tag suggestion was rejected"
- [ ] `vote_matched` - "Your vote matched the outcome" (optional, might be noisy)

### Backend/Worker
- [ ] Create notifications when suggestions are resolved
- [ ] Batch notification creation in vote resolution

### Frontend
- [ ] Notification bell icon in header
- [ ] Unread count badge
- [ ] Dropdown/panel showing recent notifications
- [ ] Mark as read functionality
- [ ] Link to relevant package/suggestion

---

## Out of Scope (Future)

- Email notifications
- Push notifications
- Notification preferences/settings
- Additional suggestion types (remove_tag, link_package)
- Skip functionality in curation queue

---

## Technical Notes

- Grafana stack already available via `otel-lgtm` container in docker-compose
- OTLP endpoint: `http://otel:4317` (gRPC) or `http://otel:4318` (HTTP)
- Zero handles real-time sync for notifications automatically
