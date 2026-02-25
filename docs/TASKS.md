# Tasks

> Current work and backlog. See [BACKLOG.md](./BACKLOG.md) for deferred items.
>
> Ordered by impact/effort ratio. Dependent tasks are grouped so the most
> disruptive change comes first and related cleanup rides along.

---

## Sprint 15: Stabilization & Tech Debt

### Big Impact + Easy

- [ ] **Remove production console.log from auth flow** — ~20 console statements in `auth-api.ts`, `ConnectionStatus.tsx`, `app-provider.tsx`. Strip or gate behind `import.meta.env.DEV`
- [ ] **Remove seed script & clean up migrate** — delete `scripts/seed-project-defaults.ts`, revert `migrate` script to plain `drizzle-kit migrate`
- [ ] **Delete dead `use-entities.ts` hook** — 198-line abstraction with no imports. Verify and remove
- [ ] **Fix hardcoded localhost in CORS** — `"http://localhost:4321"` in `backend/index.ts` is unconditionally included. Gate behind `NODE_ENV`
- [ ] **Add Zod validation to `/login` endpoint** — raw `c.req.json()` without schema validation, use `zValidator` like other endpoints
- [ ] **Validate Zitadel token response shape** — `tokenResponse.id_token` accessed without checking the response, add Zod parse

### Big Impact + Medium

- [ ] **Extract generic `useEntitySearch` hook** — `usePackageSearch` (331 lines), `useEcosystemSearch` (324 lines), `useUserSearch` (434 lines) share ~900 lines of duplicated stabilization, pagination, and exact-match logic. Extract shared core, keep entity-specific config
- [ ] **Drop `accountId` from projects** — migration + schema change + update queries (`mine`, `byAccountId`), mutators (`create`), and frontend (`user/index.tsx`) to use `projectMembers`. Do this together with seed script removal above
- [ ] **Split `ecosystem/index.tsx` (855 lines)** — extract `useEcosystemSuggestions` hook (tag/package suggestion state, ~8 modal handlers) and break render into section components
- [ ] **Split `BoardSection.tsx` (660 lines)** — extract `useBoardData` (cards/columns/groups derivations) and `useBoardActions` (event handlers) hooks

### Medium Impact + Easy

- [ ] **Move hardcoded constants to config** — `COOLDOWN_MS` in worker, `REFRESH_BUFFER_MS` in ConnectionStatus, `MAX_CACHE_SIZE` and popover dimensions in markdown-output, grid `% 6` magic number
- [ ] **Standardize modal state** — ecosystem/index.tsx uses 6+ bare `createSignal<boolean>` instead of existing `useModalState` hook. Adopt everywhere
- [ ] **Use existing `useInfiniteScroll` hook** — `ecosystems/index.tsx` and `home/ResultsGrid.tsx` manually duplicate IntersectionObserver logic. Replace with the hook
- [ ] **Fix silent JSON parse failures** — `me/index.tsx` lines 110, 205: `.catch(() => ({}))` hides API errors. Add error logging or user feedback
- [ ] **Consistent error response format in backend** — auth endpoints use `c.json({ error })`, others use `HTTPException`. Pick one pattern
- [ ] **Entity token regex: validate UUID format** — don't style invalid `$$type:notauuid` syntax
- [ ] **Loading states: investigate pages stuck in loading** — after navigation, some pages stay in loading state
- [ ] **Entity tokens: wait for Zero fetch before rendering** — shows raw ID until data loads

### Big Impact + Hard

- [ ] **Add transient vs permanent error distinction in worker** — network timeouts/503s currently mark packages as permanently failed. Add retry logic for transient errors, only mark permanent for 404/schema errors
- [ ] **Fix non-atomic transaction in worker** — `process-fetch.ts:231`: package update and fetch-completed marking happen in separate transactions. If marking fails, data is inconsistent
- [ ] **Add rate limiting to auth endpoints** — `/login` and `/refresh` have no rate limiting

### Medium Impact + Medium

- [ ] **Split `package/sections/Header.tsx` (488 lines)** — extract `usePackageActions` hook for upvotes, tags, queue polling, modals
- [ ] **Split `me/index.tsx` (432 lines)** — extract sections for profile editing, account deletion, data export
- [ ] **Extract shared `usePendingSuggestions` pattern** — duplicated across ecosystem and package pages for pending tag/remove state
- [ ] **Add indexes on `projects` table** — missing indexes on `upvoteCount` and `updatedAt` despite being used for sorting/ordering
- [ ] **Share username validation** — regex in `me/index.tsx:153` should be a shared Zod schema
- [ ] **Editor state: fix text disappearing on tab switch** — consider localStorage drafts
- [ ] **Code module: fix dark mode color contrast** — language dropdown unreadable in dark mode

### Lower Priority

**Bug fixes:**
- [ ] Bold/Italic toggle: Ctrl+B/Ctrl+I should unwrap if already inside markup
- [ ] Form inputs: auto-focus on modal/dialog open
- [ ] Mobile toolbar: handle overflow (collapse menu, scrollable, or priority icons)
- [ ] Mobile entity popover: prevent browser context menu on long-press

**Architecture polish:**
- [ ] Standardize hook return signatures (`data`, `isLoading`, `isError`, `isEmpty` patterns)
- [ ] Extract reusable "data container" patterns (handle loading/error/empty uniformly)
- [ ] Add cleanup job for orphaned placeholder packages in worker
- [ ] Update outdated GDPR export comment (`gdpr-export.ts:13-14`)
- [ ] Document hook composition patterns in CLAUDE.md

**UX polish:**
- [ ] Breadcrumb consistency across all detail pages
- [ ] Empty states: helpful messaging + suggested actions
- [ ] Skeleton loading consistency (same patterns everywhere)
- [ ] Optimistic UI for upvotes/mutations
- [ ] Error boundaries with friendly recovery UI
- [ ] Hover states consistency
- [ ] Offline indicator when Zero disconnects
- [ ] Copy/Share: one-click copy markdown reference or URL
- [ ] Share menu on entities
- [ ] Toast feedback on copy actions
- [ ] Search: recent searches or suggestions when empty
- [ ] Keyboard shortcuts help modal
- [ ] Responsive typography audit
- [ ] Entity module: add keyboard shortcut (evaluate Ctrl+2 or alternative)
- [ ] Keyboard navigation: audit tab order across flows
- [ ] Documentation audit: review and update docs/ to match current implementation

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Completed (Previous Sprints)

### Sprint 14: Projects Kanban Rework

**Kanban Board:**
- Full kanban board with drag-and-drop, status columns, horizontal scroll
- Card side panel with status dropdown, comment threads, clickable titles
- Unified search to add packages and ecosystems
- Status column management: add/remove/reorder (owner only)
- Inline editing: project name/description

**Tabbed Page Structure:**
- Board, Discussion, Settings tabs with URL-driven state
- Project upvotes, `ProjectCard` on browse page
- Extracted sub-components: kanban-card-item, kanban-column-header, add-status-popover

**Member Management:**
- Owner/contributor roles with permission enforcement at mutator level
- Add/remove members, role promotion/demotion
- Cascade delete: cards → threads → comments (FK-safe ordering)
- Comment permissions: project membership required

**Views & Grouping:**
- List view with collapsible sections, reusing KanbanCardItem
- View switcher (Kanban/List) and group-by toggle (Status/Tags)
- URL-driven view state (`?view=list&group=tag`)
- Tag grouping is read-only (no drag between tags)

**Settings:**
- Default status for new cards (configurable per project)
- Status column management from Settings tab (add/remove/reorder)
- `resolveDefaultStatus` helper with server-side validation

### Sprint 13: User Profiles & Comments Expansion

**User Profiles:**
- Profile page route (`/user/:id`)
- Profile display: name, member since, contribution stats, activity timeline, projects
- Link to profile from leaderboard, comments, suggestions, projects

**Comments Expansion:**
- CommentThread on ecosystem pages
- Linkable comments (URL anchors, scroll to comment, deep link support)
- "Reply to {name}" in activity timeline with clickable author links
- Reply limit (100 per thread) with UI feedback
- Character limit (10,000) with live counter in editor
- User profile links from comment avatars

**Leaderboard UX:**
- Show empty state when monthly scores are all 0 (instead of hiding the card)
- Filter out negative scores from leaderboards

**Editor & Renderer Enhancements:**
- Replace `execCommand` insert with textarea-range editing (preserve selection + Ctrl+Z/Ctrl+Y)
- Tab/Shift+Tab indent + outdent (multi-line)
- Memoize markdown processing (LRU cache, max 100 entries)
- Mermaid diagram support in renderer
- Code block module: searchable language selection (52 languages + custom input)
- Link module: smart pre-fill based on selection (URL or text detection)

**Entity Token System:**
- Regex parsing of `$$type:id` tokens (skips code blocks)
- Styled rendering with icons (📦 Package, 👤 User, 📁 Project, 🌐 Ecosystem)
- Hover popover UI with entity details (name, description, metadata)
- Entity insertion toolbar module with type selector and search
- `EntityByIds` interface with byIds hooks for batch entity fetching
- Entity resolution for both root comments and replies
- Fixed positioning popovers (no container clipping)
- Empty description placeholder for entities without descriptions

### Sprint 12: RichText & Comments

- Markdown renderer: remark/rehype pipeline, GFM support, syntax highlighting, prose styles
- Markdown editor: MarkdownInput, MarkdownEditor composite with Write/Preview tabs
- Editor toolbar: Bold, Italic, Link, Code, Quote modules with link insertion panel
- Comments system: threads/comments tables, nested replies with `rootCommentId`
- Comment components: Avatar, CommentCard, CommentThread with useCommentThread hook
- Flat threading (Reddit-style), pagination (20 root + "Show replies"), mobile layout
- Discussion tab on package detail page
- Route lazy loading (code splitting), consistent tab patterns across pages

### Sprint 11: Tech Debt & DX

- Suggestion system architecture overhaul (6 mutators → 1 generic, extensible type definitions)
- `useSuggestionSubmit` hook with power user detection
- Consolidated hooks: `createUpvote()`, `useModalState<T>()`, `useVote()`, `useAddToProject()`
- Shared components: `SkeletonCard`, `AddToProjectPopover`
- Utilities: `groupByTags<T>()`, `handleMutationError()`
- Documentation: backend/webhook CLAUDE.md, Hook Reference section
- Badge polymorphic rendering, ecosystem SearchInput UX, reduced sign-in noise

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
