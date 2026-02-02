# Tasks

> Current work and backlog. See [BACKLOG.md](./BACKLOG.md) for deferred items.

---

## Sprint 12: RichText & Comments

Focus: Markdown infrastructure, editor, and threaded comments system.

### RichText: Markdown Renderer ✓

Build the renderer first - it's needed everywhere.

- [x] Set up remark/rehype pipeline
- [x] GitHub Flavored Markdown (tables, strikethrough, task lists)
- [x] Syntax highlighting for code blocks (rehype-highlight)
- [x] TechGarden typography and styling (prose styles, brand colors)

### RichText: Markdown Editor ✓

- [x] MarkdownInput component with styling
- [x] MarkdownEditor composite (Write/Preview tabs, toolbar)
- [x] insertAtCursor helper (uses execCommand for native undo support)
- [x] Basic toolbar modules (Bold, Italic, Link, Code, Quote)
- [x] Link insertion panel (text + URL fields, responsive)
- [x] Mobile-friendly layout (toolbar wraps, link panel stacks)

### Comments System ✓

Database and UI for threaded discussions on packages, ecosystems, and projects.

- [x] Database: `threads` table (per entity), `comments` table with `replyToId`
- [x] Queries: `byThreadId` (with nested replies), `byId`, `byAuthorId`
- [x] Mutators: `create` (auto-creates thread), `update`, `remove` (soft delete)
- [x] Avatar component (ui tier) with size/variant props
- [x] CommentCard component (presentational, avatar-less)
- [x] CommentThread component (orchestrates edit/reply modes)
- [x] useCommentThread hook (Zero queries/mutations wrapper)
- [x] Flat threading with `rootCommentId` (Reddit-style, replies don't nest deeply)
- [x] Pagination: 20 root comments, "Show replies" loads 20 at a time
- [x] Mobile layout: avatars hidden, left border for reply indentation
- [x] Integrate CommentThread on package detail page (Discussion tab)

### UX Improvements ✓

- [x] Route lazy loading (code splitting, prevents loading unused dependencies)
- [x] Package page: removed card wrapper, full-width underline tabs
- [x] Project page: same tab pattern for consistency
- [x] Tab hierarchy: page-level uses `line` variant, nested uses `pills` variant

---

## Sprint 13: User Profiles & Comments Expansion

### User Profiles

- [ ] Schema: extend `account` with bio, avatar URL, social links
- [ ] Profile page route (`/user/:id` or `/u/:username`)
- [ ] Profile display: name, avatar, bio, contribution stats
- [ ] Link to profile from comments, leaderboard, suggestions
- [ ] Profile editing (own profile only)

### Comments Expansion

- [ ] Integrate CommentThread on ecosystem pages
- [ ] Integrate CommentThread on project pages
- [ ] Linkable comments (URL anchors, scroll to comment)
- [ ] User profile links from comment avatars

### Leaderboard UX ✓

- [x] Show empty state when monthly scores are all 0 (instead of hiding the card)
- [x] Filter out negative scores from leaderboards

### Editor & Renderer Enhancements

- [ ] Code block language dropdown (select language for syntax highlighting)
- [ ] Textarea behavior overrides (Tab for indent, auto-close brackets)
- [ ] Entity link syntax (e.g., `@package:lodash` or similar)
- [ ] Entity link autocomplete (search popup on trigger)
- [ ] Entity link recognition in renderer (`/package/*`, `/ecosystem/*`, etc.)
- [ ] Entity link styling (chips, icons, distinct from regular links)
- [ ] Rich hover preview for entity links (package/ecosystem/project details)

---

## Sprint 14: Projects Kanban Rework

See [Feature-Projects.md](./Feature-Projects.md) for full spec.

- [ ] Schema: `projectStatuses` table (id, projectId, name, type, position)
- [ ] Schema: Add `statusId`, `note` to `projectPackages` and `projectEcosystems`
- [ ] Default statuses on project creation
- [ ] Kanban board layout (status columns)
- [ ] Drag-and-drop between columns
- [ ] Mobile: dropdown fallback for status change
- [ ] Tag labels on cards
- [ ] Tag filtering
- [ ] Card expansion (notes, details)
- [ ] Shareable URLs with filter state

---

## Backlog

See [BACKLOG.md](./BACKLOG.md) for full list.

---

## Completed (Previous Sprints)

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
