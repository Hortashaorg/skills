# TechGarden - Backlog

> Concrete work items not yet scheduled. For roadmap/phases, see [VISION.md](./VISION.md).

---

## Projects

- [ ] Package.json import - upload and auto-create project with packages
- [ ] Deprecated/unmaintained package detection in projects

---

## Registries

Current: npm, jsr, nuget, dockerhub, homebrew (formulas), archlinux (official repos)

- [ ] ghcr.io (GitHub Container Registry) - cloud-native tools (CloudNativePG, etc.)
- [ ] homebrew-cask - macOS GUI applications (Discord, VS Code, etc.)
- [ ] homebrew taps - third-party formulas (fluxcd, argocd, etc.)
- [ ] AUR (Arch User Repository) - community packages (separate from archlinux official)

---

## Curation

- [ ] Curator points for auto-approved suggestions (admins: no points, curators: get points)

---

## Polish

- [ ] Zero preloading on link hover
- [ ] Query optimization audit

---

## Technical Debt

### Large Files to Split
- [ ] `routes/home/sections/ResultsGrid.tsx` (364 lines) - Extract InfiniteScroller, skeleton logic
- [ ] `routes/package/sections/Header.tsx` (502 lines) - Extract UpvoteSection, RequestSection, MetadataDisplay
- [ ] `services/backend/index.ts` (320 lines) - Extract into routes/auth.ts, routes/query.ts, middleware/
- [ ] `services/worker/db.ts` (387 lines) - Split by operation type (packages.ts, channels.ts)

### Reusable Hooks to Extract
- [ ] `createSearchResults` - Query orchestration + stabilization from home/index.tsx (70+ lines)
- [ ] `useAuthCheck` - Auth check + redirect pattern repeated in 3+ files

### Reusable Utilities to Extract
- [ ] `lib/search-items.ts` - Search item building from detail.tsx

### Component Improvements
- [ ] Create reusable Skeleton variants (ProfileSkeleton, GridSkeleton) - reduce duplication
- [ ] Split large story files (Toast 380 lines, SearchInput 375 lines)

### Error Handling
- [ ] Surface errors to users - 16+ places log errors without user feedback
- [ ] Add error type system for worker/backend (retry-able vs permanent)

### Dependencies
- [ ] Remove `as any` cast in `packages/database/server.ts` — `@rocicorp/zero` pins `postgres@3.4.7` while we need `3.4.8` for drizzle-kit migrations. When Zero upgrades its postgres dep, remove the cast at `zeroPostgresJS(schema, sqlClient as any)`

### Ops
- [ ] Zero distributed deployment (retry - had issues with multi-replica setup)

---

## Rate Limiting

- [ ] User rate limiting (10 requests/hour) - verify current state
- [ ] Clear error messages when limit reached
