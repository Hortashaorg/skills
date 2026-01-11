# Sprint 8: UI Polish & Multi-Registry

> **Goal:** Fix display issues, expand to multi-registry support.

---

## Deleted User Display ✅

Show "Deleted User" instead of "Anonymous" for soft-deleted accounts:

- [x] Use getDisplayName() consistently across all components
- [x] Update ProjectCard, ProjectDetail, CurateTab
- [x] Update ReviewQueue, Backlog, Leaderboard, Landing

---

## Multi-Registry Support ✅

Expanded from npm-only to 6 registries:

- [x] **JSR** - Cross-registry deps (jsr/npm), separate endpoints
- [x] **NuGet** - .NET packages, paginated responses, framework dep groups
- [x] **Docker Hub** - Container images, named tags only (no deps)
- [x] **Homebrew** - macOS/Linux, runtime/build/optional deps
- [x] **Arch Linux** - Official repos, dedupe deps, filter .so provides
- [x] Registry dispatcher routing
- [x] Updated registry-adapter skill documentation
- [x] Updated VISION.md phases

---

## Tech Debt Cleanup ✅

Small improvements to code quality:

- [x] Consolidate inline icons (UserIcon, MenuIcon, CloseIcon → icon primitives)
- [x] Centralize constants (limits, timeouts, batch sizes → lib/constants.ts)
- [x] Extract reusable mutation error handler (console.error + toast pattern)

---

## Backlog (Future)

See [BACKLOG.md](./BACKLOG.md) for full list.
