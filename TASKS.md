# Tasks

> Current work and backlog. See [BACKLOG.md](./BACKLOG.md) for deferred items.

---

## Sprint 11: Tech Debt & DX

Dedicated sprint for code quality, developer experience, and consistency.

### Tier 1: High Impact, Low Effort ✅

#### Consolidate Duplicate Code ✅
- [x] Merge `createPackageUpvote` + `createEcosystemUpvote` into generic `createUpvote(entity, type)`
  - Created `hooks/createUpvote.ts` with shared logic
  - Wrappers remain for type-safe usage
  - ~100 LOC reduction

#### Fix Critical UX Bugs ✅
- [x] Add user feedback when auth fails in `app-provider.tsx`
  - Toast on login failure: "Sign in failed. Please try again."
  - Toast on refresh failure: "Session expired. Please sign in again."
- [x] Auto-approved suggestions show correct toast
  - Power users see "Applied" instead of "pending review"

#### Standardize Error Handling ✅
- [x] Replace direct `toast.error()` calls with `handleMutationError()`
  - Updated: `package/Header.tsx`, `ecosystem/index.tsx`, `ecosystems/index.tsx`, `curation/index.tsx`

#### Documentation Updates ✅
- [x] Update `services/frontend/CLAUDE.md` - Added Hook Reference section
- [x] Create `services/backend/CLAUDE.md` - Endpoints, auth flow, patterns
- [x] Create `services/webhook/CLAUDE.md` - Events, actions, Zitadel API
- [x] `README.md` already had database commands (no change needed)

---

### Tier 2: Quick Wins ✅

- [x] `SkeletonCard` - Shared loading card component for grids
- [x] `groupByTags<T>()` - Extracted to `lib/group-by-tags.ts`
- [x] `useVote()` - Extracted to `hooks/useVote.ts`
- [x] `useAddToProject()` + `AddToProjectPopover` - Hook + presentational component pattern
- [x] Dialog stories - Visual tests for Dialog component
- [x] CLAUDE.md updates - Emphasize presentational components, study existing patterns first

Net result: ~386 LOC removed through consolidation

---

### Tier 3: Medium Effort Improvements

#### Extract Reusable Hooks

- [x] `useModalState<T>()` - Consolidated modal open/close + data patterns
  - Created `hooks/useModalState.ts`
  - Refactored: `admin/tags/index.tsx`, `me/projects/detail.tsx`
  - Remaining files can adopt as touched

#### File Sizes (Post Tier 2)

| File | Lines | Notes |
|------|-------|-------|
| `package/sections/Header.tsx` | ~500 | Reduced with AddToProjectPopover extraction |
| `me/projects/detail.tsx` | ~510 | Reduced with groupByTags extraction |
| `ecosystem/index.tsx` | ~540 | Could shrink with useSuggestionFilters |

---

### Deferred (Not Worth Effort Now)

Investigated and determined low value:

- ~~`useSuggestionFilters()`~~ - ~35 LOC duplicated across 2 files only
- ~~SearchInput vs Input consistency~~ - Plain Input is appropriate for simple search-on-type
- ~~Button variant reduction~~ - Not causing problems
- ~~Hide "Add tag" when signed out~~ - Current toast pattern is acceptable
- ~~`useConfirmationDialog`~~ - Covered by `useModalState`
- ~~Reduce sign-in CTAs~~ - Contextually appropriate, just inconsistent implementation

---

### Completed (Sprint 11)

#### Suggestion System Architecture Overhaul
- Consolidated 6 separate mutators into 1 generic `create` mutator
- Created self-contained type definitions in `suggestions/types/` (~50 lines each)
- Each type file contains: versioned schema, display formatting, resolve logic, validation, toast messages
- Typed payloads - methods receive already-parsed data (no redundant parsing)
- Validation: entity existence, duplicates, pending suggestion checks
- Adding new suggestion type now requires only: enum + type file + registry export + frontend form
- Net result: -74 lines while adding validation and improving extensibility

#### Suggestion Submit Hook (Frontend DX)
- Created `useSuggestionSubmit` hook - handles mutation, power user detection, toast, error handling
- Colocated `toastMessages` with type definitions (single source of truth)
- Refactored 6 handlers across 3 pages: ~20 lines → ~8 lines each
- Developers can't forget power user handling - it's automatic
- Net result: ~30 lines reduced, consistent toast behavior guaranteed

#### Tier 1: High Impact, Low Effort
- Consolidated upvote hooks into generic `createUpvote()` with type-safe wrappers (~100 LOC reduced)
- Added auth failure toasts (login and refresh failures now visible to users)
- Fixed auto-approve toast (power users see "Applied" not "pending review")
- Standardized error handling with `handleMutationError()` across all mutations
- Created `services/backend/CLAUDE.md` and `services/webhook/CLAUDE.md`
- Added Hook Reference section to `services/frontend/CLAUDE.md`

#### Tier 2: Quick Wins
- `SkeletonCard` component for consistent grid loading states
- `groupByTags<T>()` utility extracted to `lib/group-by-tags.ts`
- `useVote()` hook for suggestion voting
- `useAddToProject()` hook + presentational `AddToProjectPopover` (enforced hook+component pattern)
- Dialog stories for visual test coverage
- CLAUDE.md trimmed (417→237 lines) with emphasis on studying existing patterns

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Codebase Review Summary (Sprint 11 Context)

### Scores by Area

| Area | Score | Status |
|------|-------|--------|
| Component Library | 9/10 | Excellent CVA consistency, presentational pattern enforced |
| State Patterns | 7.5/10 | Hook extraction good, modal pattern duplication remains |
| Data Layer | 9/10 | Strong Zod coverage, suggestion types self-contained |
| Documentation | 9/10 | Concise, pattern-focused, study-existing-first guidance |
| Error Handling | 8.5/10 | `handleMutationError` used consistently |
| File Organization | 9/10 | Clear structure, consolidated utilities |
| Testing | 8/10 | 497 Storybook tests, Dialog now covered |
| UX Patterns | 8.5/10 | Consistent cards, upvotes, modals |

### Key Findings

**Strengths:**
- ResourceCard → PackageCard/EcosystemCard hierarchy is clean
- Upvote, tags, add-to-project flows identical across entities
- No circular dependencies, clear module boundaries
- 40/55 components have Storybook stories (73%)
- All Zod validation in place for queries/mutators
- Suggestion system is now extensible with colocated logic

**Remaining Issues:**
- 14 modal state signals could use shared `useModalState` hook
- `useSuggestionFilters()` extraction deferred (complex typing)

---

## Completed (Previous Sprints)

### Sprint 10: Ecosystems & Code Quality

- Ecosystems feature: schema, queries, mutators, browsing, curation, projects integration
- Unified Entity Architecture: EntityFilter, EditableField, EntityPicker, SuggestionModal
- Ecosystem page redesign with packages grouped by tags
- UI consistency across package/ecosystem/project detail pages
- Auto-approve suggestions for admin/curator roles (power user pattern)
- Tag removal via suggestion system (packages + ecosystems)
- Tag removal confirmation modal with justification
- Fix aria-hidden warnings (Select portal, dialog focus)
- Dependency upgrades

### Sprint 9: Tech Debt & Polish

- Dependency upgrades (zero, hono, pino, rolldown-vite, types)
- Split webhook/index.ts, me/projects/detail.tsx, navbar.tsx
- Data-driven Navbar with role-based filtering
- Infinite scroll stabilization (no flicker, accepts deletions)
- Multiple exact matches across registries in search
- CLAUDE.md updates (UX considerations, component discipline, Zod validation)
- Tech debt backlog audit

### Sprint 8: Multi-Registry Support

- Deleted user display (getDisplayName across components)
- 6 registry adapters: npm, jsr, nuget, dockerhub, homebrew, archlinux
- Registry dispatcher routing
- Tech debt: icon consolidation, constants, mutation error handler

### Sprint 7: Zitadel Webhooks

- Zitadel webhook handlers for user lifecycle events
- User deleted: soft-delete account via zitadelId lookup
- User created (OAuth): verify email + assign ORG_USER_SELF_MANAGER role
- Fixed email verification API (v1 management API, not v2)

### Sprint 6: Polish, SEO & Identity

- Brand colors: garden-themed green accent, dark mode toggle
- SEO: @solidjs/meta, dynamic titles/descriptions, Open Graph, robots.txt
- Homepage: new value proposition, curation feature card, leaderboard preview
- Polish: infinite scroll, Dropdown component (Kobalte), dark mode contrast
- Auth: Zitadel webhook endpoint, removed email from accounts
- GDPR: data export, soft delete, re-registration support

### Sprint 5: Search & Discovery UX

- Package search: exact match prioritization, placeholder visibility
- "Add package" card when no exact match exists
- Infinite scroll with skeleton loading, back to top button
- Full-card clickable with distinct upvote hover
- Project package dropdown: exact match first, status display, action items
- SearchInput keyboard scroll-into-view
- GitHub OAuth via Zitadel, proactive token refresh
- GDPR-compliant account deletion (anonymization)
- Privacy policy updated for OAuth-only flow

### Sprint 4: CI/CD, Observability & Notifications

- GitHub Actions CI (lint, typecheck, Storybook tests)
- OpenTelemetry instrumentation (backend + worker)
- Structured logging with OTLP export
- User notifications system (schema, triggers, UI)
- Notification bell with hover dropdown preview
- /me/notifications page with mark read/unread
- Layout refactoring (Navbar, NavLinks, ConnectionStatus, HoverDropdown)
- Storybook stories for Navbar and HoverDropdown
- Curation skip functionality (session-based)
- Hamburger menu accessibility improvements

### Sprint 3: UX Polish + Community Curation

- Toast notification system (Kobalte Toast primitive)
- Loading states with Skeleton component
- Form consistency (Input, Textarea components)
- Community curation system (suggestions, votes, contribution scoring)
- Package page restructure with tabs (Overview, Details, Curate)
- Curation review page with leaderboard
- Worker job for contribution score aggregation
- Extensible suggestion type registry

### Sprint 2: Projects & Data Foundation

- Projects feature with CRUD operations
- Route restructure: `/packages`, `/projects`, `/me/*`
- Landing page, user profile, "Add to project" button
- AlertDialog, Breadcrumbs, IconLinkCard, Table components
- Design system consistency and dead code removal
- Privacy policy and GDPR account deletion

### Sprint 1 (Milestones 1-7)

- Core search → request → fetch → display pipeline
- Auto-queue dependencies, rate limiting
- Browsing, details, upvoting, auth UX
- Admin dashboard, tag management, role system
- Schema simplification (release channels vs all versions)
- Kubernetes deployment, CI/CD
