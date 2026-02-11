# Tasks

> Current work and backlog. See [BACKLOG.md](./BACKLOG.md) for deferred items.

---

## Sprint 14: Projects Kanban Rework + Bug Fixes

See [Feature-Projects.md](./Feature-Projects.md) for full spec.

**Projects V2 (new route, parallel to existing):**

*Completed: Foundation*
- [x] New route: `/projects/:id` for V2, old route moved to `/projects-old/:id`
- [x] Kanban board layout with status columns, horizontal scroll
- [x] Drag-and-drop between columns (native HTML5 DnD API, `createDragAndDrop` hook)
- [x] Click card → side panel with status dropdown
- [x] Reusable `SidePanel` component + `createClickOutside` hook
- [x] Schema: `projectStatusEnum`, `projectMemberRoleEnum`, `projectStatuses`, `projectMembers` tables
- [x] Status column management: add/remove columns, arrow reordering (swap positions)
- [x] Idempotent seed script for existing projects (runs on `pnpm database migrate`)
- [x] Default statuses + owner member seeded on project creation
- [x] Wire kanban board to real data from `projectStatuses` table
- [x] Auth-aware: readonly for non-owners, disabled drag-and-drop
- [x] Cards with upvotes, tags, registry badge, remove button (with confirmation dialog)
- [x] Unified search to add packages and ecosystems (single SearchInput, both hooks)
- [x] Subtle status dots instead of colored bars (consistent with site design)
- [x] Ownership via `projectMembers` table, not `projects.accountId`

*Completed: Code Cleanup & V1 Removal*
- [x] Extract kanban sub-components: `kanban-card-item`, `kanban-column-header`, `add-status-popover`
- [x] Extract `BoardSection` from detail page (all board logic in `sections/BoardSection.tsx`)
- [x] Extract shared types to `routes/projects/types.ts` (`KanbanCard`, `KanbanColumn`)
- [x] Move constants to `lib/constants.ts` using database enums as source of truth
- [x] Use `QueryRowType` from Zero for type inference (no manual type duplication)
- [x] Remove V1 project detail page and `/projects-old/:id` route
- [x] Rename `detail-v2.tsx` → `detail.tsx`, `ProjectDetailV2` → `ProjectDetail`

*Completed: Tabbed Page Structure + Upvotes*
- [x] Project upvotes: `projectUpvotes` table, `upvoteCount` column, mutators, relations
- [x] `createProjectUpvote` hook + `"project"` entity type in `createUpvote`
- [x] Presentational `Header` section (name, description, upvote button, member count)
- [x] `DiscussionTab` section (reuses `useCommentThread` with `entityType: "project"`)
- [x] Tabbed layout: Board (default), Discussion, Settings (placeholder)
- [x] Route: `/projects/:id/*tab` with URL-driven tab state
- [x] Breadcrumbs work on all tabs (regex updated for optional tab suffix)
- [x] Upvote button on `/projects` browse page (matching ecosystem/package card pattern)
- [x] `ProjectCard` follows `ResourceCard` pattern (absolute link, pointer-events, data-upvote)
- [x] `.related("upvotes")` on project search/recent/exactMatch queries

```
routes/projects/
├── detail.tsx             (tab routing, data loading, upvote state, header)
├── types.ts               (KanbanCard, KanbanColumn shared types)
├── components/
│   ├── kanban-board.tsx    (board layout, composes sub-components)
│   ├── kanban-card-item.tsx
│   ├── kanban-column-header.tsx
│   ├── add-status-popover.tsx
│   └── card-panel.tsx      (side panel for card details)
└── sections/
    ├── BoardSection.tsx    (kanban board, search, card management)
    ├── DiscussionTab.tsx   (project-level comment threads)
    ├── Header.tsx          (project header with upvote)
    └── SettingsTab.tsx     (member management)
```

Remaining:
- [x] Inline editing: project name/description (pencil icon in header, edit-in-place)

*Phase 4: Card Side Panel — Decision Context*

The side panel becomes the decision record for each package/ecosystem in the project.

- [ ] Link to full package/ecosystem page from panel
- [ ] Decision note: markdown editor (per projectPackage/projectEcosystem)
  - Schema: add `note` text column to `projectPackages` and `projectEcosystems`
  - View/edit with MarkdownInput in the panel
- [ ] Simple flat comment thread per card (no nesting)
  - Schema: thread per projectPackage/projectEcosystem (new thread type or reuse existing)
  - Lightweight discussion about this specific decision
  - No reply nesting — keeps it focused on "why did we pick/drop this?"
- [ ] Note indicator on kanban cards (small icon when note exists)
- [ ] Comment count indicator on kanban cards

*Phase 5: Member Management (Settings Tab)*

- [x] List current members with roles (avatar, name, role badge)
- [x] Add members by username search (owner only)
- [x] Remove members (owner only, cannot remove last owner)
- [x] `projectMembers` mutators: add, remove (auth via projectMembers table)
- [x] Filter deleted users from account search queries
- [ ] Replace direct add with invite system (send invite, user accepts/declines)
- [ ] Role assignment: owner (full control), contributor (edit/comment)
- [ ] Contributors can: move cards, add notes, comment
- [ ] Contributors cannot: delete project, manage members, add/remove status columns

*Phase 6: Filtering & Views*

- [ ] Filter cards by name or tag across all columns
- [ ] List view: vertical cards grouped by status (collapsible sections)
- [ ] View switcher: Kanban / List toggle
- [ ] URL reflects view/filter state for sharing
- [ ] "Group by" dropdown for list view (status, tag)

*Phase 7: Cleanup (remaining)*
- [x] Compare V2 with existing implementation
- [x] Migrate `/projects/:id` to V2 (replaced old route)
- [x] Remove old project detail code
- [ ] Remove `scripts/seed-project-defaults.ts` and revert `migrate` script to plain `drizzle-kit migrate`
- [ ] Drop `accountId` from `projects` table (migration + remove column from schema)
- [ ] Update all code reading `projects.accountId` to use `projectMembers` table
- [ ] Clean up unused files (mock-data.ts, etc.)

**Bug Fixes & Polish:**
- [ ] Code module: fix dark mode color contrast for language dropdown
- [ ] Entity module: add keyboard shortcut (evaluate Ctrl+2 or alternative)
- [ ] Bold/Italic toggle: Ctrl+B/Ctrl+I should unwrap if already inside markup
- [ ] Entity token regex: validate UUID format, don't style invalid `$$type:notauuid` syntax
- [ ] Form inputs: auto-focus on modal/dialog open
- [ ] Keyboard navigation: audit tab order across flows
- [ ] Mobile toolbar: handle overflow (collapse menu, scrollable, or priority icons)
- [ ] Mobile entity popover: prevent browser context menu on long-press
- [ ] Editor state: fix text disappearing on tab switch (consider localStorage drafts)
- [ ] Loading states: investigate pages stuck in loading after navigation
- [ ] Entity tokens: wait for Zero fetch before rendering (shows ID until data loads)

**Architecture: Hook + Component Composability:**
- [ ] Audit and reorganize hooks by domain (search, byId, byIds, mutations, UI state)
- [ ] Standardize hook return signatures (data, isLoading, isError, isEmpty patterns)
- [ ] Components receive resolved data, hooks own loading/error states
- [ ] Extract reusable "data container" patterns (handle loading/error/empty uniformly)
- [ ] Document hook composition patterns in CLAUDE.md

This refactor aims to:
1. **Centralize loading state logic** - hooks return consistent `{ data, isLoading, isError }` so components don't each implement loading checks differently
2. **Make components purely presentational** - receive data, render it; no query orchestration inside
3. **Improve composability** - combine hooks predictably (e.g., search + byIds + mutations as a unit)
4. **Fix loading bugs systematically** - one pattern for "wait for data" instead of ad-hoc checks scattered everywhere

**UX Polish (Future Sprint):**
- [ ] Copy/Share: one-click copy markdown reference (`$$package:id`) or URL to clipboard
- [ ] Share menu on entities (package, ecosystem, project, user, comment)
- [ ] Toast feedback on copy actions
- [ ] Breadcrumb consistency across all detail pages
- [ ] Empty states: helpful messaging + suggested actions (not just "No results")
- [ ] Skeleton loading consistency (same patterns everywhere)
- [ ] Optimistic UI for upvotes/mutations (instant feedback before sync)
- [ ] Search: recent searches or suggestions when empty
- [ ] Keyboard shortcuts help modal (Ctrl+? or similar)
- [ ] Responsive typography audit (readable on all screen sizes)
- [ ] Hover states consistency (interactive elements should all feel clickable)
- [ ] Error boundaries with friendly recovery UI (not blank screens)
- [ ] Offline indicator when Zero disconnects
- [ ] Documentation audit: review and update all docs/ files to match current implementation

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Completed (Previous Sprints)

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
