# TechGarden - Backlog

> Items deferred from sprints. Pull into future sprints as priorities shift.

---

## Comparisons

Community-curated comparisons of similar tools (ORMs, HTTP clients, state management, etc.)

- [ ] Comparison schema (id, name, slug, description, type: "ecosystem" | "package")
- [ ] Comparison items junction (comparisonId, ecosystemId | packageId)
- [ ] Comparison listing page
- [ ] Comparison detail page (side-by-side view, pros/cons, community votes)
- [ ] Suggest comparisons and comparison items

---

## Rich Text & Discussions

Enable community discussions and comments across the platform.

- [ ] Rich text editor component (markdown or structured)
- [ ] Comments schema (polymorphic: packages, ecosystems, projects, comparisons)
- [ ] Comment threads with replies
- [ ] Comment voting (helpful/not helpful)
- [ ] Moderation tools (flag, hide, delete)

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

## Registries

- [ ] ghcr.io (GitHub Container Registry) adapter - many cloud-native tools publish here (CloudNativePG, etc.)
- [ ] homebrew-cask adapter - macOS GUI applications (Discord, VS Code, 1Password, etc.)
- [ ] homebrew taps adapter - third-party formulas (fluxcd, argocd, etc.)
- [ ] AUR (Arch User Repository) adapter - Arch community packages

---

## Polish

- [ ] Zero preloading on link hover
- [ ] Query optimization audit

---

## Technical Debt

### Large Files to Split
- [ ] `routes/home/sections/ResultsGrid.tsx` (388 lines) - Extract InfiniteScroller, skeleton logic
- [ ] `routes/package/sections/Header.tsx` (382 lines) - Extract UpvoteSection, RequestSection, MetadataDisplay
- [ ] `services/backend/index.ts` (320 lines) - Extract into routes/auth.ts, routes/query.ts, middleware/
- [ ] `services/worker/db.ts` (387 lines) - Split by operation type (packages.ts, channels.ts)

### Reusable Hooks to Extract
- [ ] `createSearchResults` - Query orchestration + stabilization from home/index.tsx (70+ lines)
- [ ] `useAuthCheck` - Auth check + redirect pattern repeated in 3+ files

### Reusable Utilities to Extract
- [ ] `lib/package-grouping.ts` - groupPackagesByTag from detail.tsx
- [ ] `lib/search-items.ts` - Search item building from detail.tsx

### Component Improvements
- [ ] Create reusable Skeleton variants (ProfileSkeleton, GridSkeleton) - reduce duplication
- [ ] Split large story files (Toast 380 lines, SearchInput 375 lines)

### Error Handling
- [ ] Surface errors to users - 16+ places log errors without user feedback
- [ ] Add error type system for worker/backend (retry-able vs permanent)

### Ops
- [ ] Zero distributed deployment (retry - had issues with multi-replica setup)

---

## Rate Limiting

- [ ] User rate limiting (10 requests/hour) - verify current state
- [ ] Clear error messages when limit reached
