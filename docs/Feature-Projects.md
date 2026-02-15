# Projects

> Shareable stack documentation with decision context - what you use and why.

---

## Scope

### Core (Existing - V1)
- [x] Project CRUD (create, read, update, delete)
- [x] Add packages to projects
- [x] Add ecosystems to projects
- [x] Public project sharing (URL)
- [x] Group by tags view

### V2 Rework (Parallel Development)

Building at `/projects-v2/[id]` alongside existing implementation.

**Phase 1: Schema & Basic Kanban**
- [ ] Schema: `projectStatusType` enum (`considering`, `using`, `deprecated`, `rejected`)
- [ ] Schema: `projectMemberRole` enum (`owner`, `contributor`)
- [ ] Schema: `projectStatuses` table (id, projectId, name, type, position)
- [ ] Schema: `projectMembers` table (id, projectId, accountId, role)
- [ ] Schema: Add `statusId`, `note`, `updatedAt` to `projectPackages`/`projectEcosystems`
- [ ] Migration: Seed `projectMembers` owner row from `projects.accountId` for all existing projects
- [ ] Migration: Seed default statuses for all existing projects
- [ ] Default statuses + owner member on project creation (mutator)
- [ ] V2 reads ownership from `projectMembers`, not `projects.accountId`
- [ ] New route: `/projects-v2/[id]` (parallel development)
- [ ] Kanban board layout (status columns)
- [ ] Cards with tag labels
- [ ] Drag-and-drop (desktop)
- [ ] Dropdown status change (mobile)

**Phase 2: Card Details Panel**
- [ ] Side panel on card click (desktop: slide-in, mobile: full overlay)
- [ ] View/edit decision note (markdown)
- [ ] Status dropdown in panel
- [ ] Link to package/ecosystem page

**Phase 3: Discussion & Collaboration**
- [ ] CommentThread per card
- [ ] Comment/note indicators on cards
- [ ] Roles: owner (full control), contributor (edit/comment)

**Phase 4: Filtering & Polish**
- [ ] Tag filtering
- [ ] Shareable URLs with filter state
- [ ] Search to add packages

**Phase 5: Swap & Cleanup**
- [ ] Compare with V1
- [ ] Migrate routes
- [ ] Remove V1 code
- [ ] Drop `accountId` from `projects` table (ownership fully in `projectMembers`)

### Future
- [ ] Invite system (send invite, user accepts/declines — replaces direct add)
- [ ] Custom status names (mapping to fixed types)
- [ ] Link cards to comparisons
- [ ] Package.json import
- [ ] Status change history

---

## User Stories

### Developer Documenting Stack

- **As a developer**, I want to quickly add packages/ecosystems to my project, so I can share what I use without friction.
- **As a developer**, I want to optionally add notes explaining my choices, so others understand my reasoning.
- **As a developer**, I want to set a status on each item (considering, using, deprecated, rejected), so I can show my decision landscape.

### Developer Sharing

- **As a developer**, I want to share a URL to my project, so others can see my stack.
- **As a developer**, I want to share a filtered view (e.g., only "considering" items), so the receiver sees the relevant context.
- **As a developer**, I want my project to look presentable with minimal effort, so sharing feels good.

### Developer Browsing Others' Projects

- **As a developer**, I want to see someone's project grouped by tags or status, so I understand their stack.
- **As a developer**, I want to click a card to see details (notes, links) without leaving the project view, so I stay in context.
- **As a developer**, I want to navigate to the package/ecosystem page when I need more info, so I can learn about unfamiliar tools.

### Cross-Feature Integration

**With Packages & Ecosystems:**
- Cards represent packages/ecosystems from foundation layer
- Link to package/ecosystem page available (but not the default click action)

**With Comparisons (future):**
- Cards can link to a comparison explaining the decision
- "Why React?" → see the frontend framework comparison

**With Analytics:**
- Status types enable platform-wide insights ("What % of projects have Package X as deprecated?")

---

## Purpose

Projects let developers **document and share their stack** with optional depth.

**Quick mode:** Just add packages/ecosystems, get a shareable page. Zero friction, presentable by default.

**Deep mode:** Add statuses, notes, links to comparisons. Document your decisions for yourself or others.

The depth is optional. No required fields beyond the basics. You decide what's worth explaining.

---

## Features

### Kanban Board Layout

**What:** Status columns as a drag-and-drop kanban board. Cards can be dragged between columns to change status.

**Why:** Satisfying, tactile interaction for organizing thoughts. One fluid motion to update decision state. Visual clarity of where everything stands.

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Considering │ Using       │ Phasing Out │ Rejected    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ [prisma]    │ [drizzle]   │ [express]   │ [moment]    │
│  orm,db     │  orm,db     │  api        │  dates      │
│             │ [zod]       │             │             │
│             │  validation │             │             │
│             │ [hono]      │             │             │
│             │  api        │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Cards Show Tag Labels

**What:** Each card displays its tag labels (e.g., `orm`, `database`, `api`). Tags are informational, not structural.

**Why:** See at a glance what role a package plays. Packages with same purpose visually cluster by their labels.

### Tag Filtering & Ordering

**What:** Filter to show only packages with specific tags. Within columns, cards ordered by tag so same-purpose packages group together.

**Why:** "Show me all my database packages across statuses." Quick focus without changing the board structure.

### Status Types (Fixed)

| Type | Meaning | Analytics Signal |
|------|---------|------------------|
| `considering` | Evaluating, researching | What's getting attention |
| `using` | Active, committed | Adoption metrics |
| `deprecated` | Phasing out | Churn in progress |
| `rejected` | Decided against | Final decisions |

**Why fixed types?** Enables platform analytics regardless of custom names. "40% of projects have Package X as deprecated" is a meaningful signal.

### Custom Status Names

**What:** Users can rename statuses (e.g., "In Production" instead of "Using") but each maps to a fixed type.

**Why:** Match your terminology without breaking analytics.

### Optional Notes

**What:** Each item can have a note. Note indicator icon shows when notes exist. Click to view/edit.

**Why:** "We chose Drizzle because Prisma's cold start was too slow" is more valuable than just "Drizzle". But not everyone needs to explain React.

### Card Interactions

**What:**
- **Drag card** → move to different status column (primary interaction)
- **Click card** → expand details (notes, links) in context
- **Click note icon** → view/edit notes
- **Explicit link** → navigate to package/ecosystem page

**Why:** Drag is the primary organization action. Click expands, doesn't navigate away.

### Shareable URLs

**What:** URL reflects current filters. Share a link to "only my database packages" or "only what I'm considering."

**Why:** Context-specific sharing. Recipient sees what you wanted to show them.

### Mobile-Friendly

**What:** 
- Columns stack vertically on mobile (not side-by-side)
- Status change via dropdown (alternative to drag)
- Drag-and-drop optional enhancement on larger screens

**Why:** Dragging feels natural on desktop, awkward on mobile. Dropdown works everywhere. Same functionality, different interaction.

---

## Data Model

```
projectStatuses
  - id: uuid
  - projectId: uuid (FK)
  - name: string - User-facing label ("In Production", "Evaluating")
  - type: enum - One of: considering, using, deprecated, rejected
  - position: integer - Display order
  - createdAt: timestamp
  - updatedAt: timestamp

projectPackages (existing, modified)
  - id: uuid
  - projectId: uuid (FK)
  - packageId: uuid (FK)
  - statusId: uuid (FK to projectStatuses) ← NEW
  - note: text? ← NEW (markdown decision note)
  - createdAt: timestamp
  - updatedAt: timestamp

projectEcosystems (same pattern)
  - id: uuid
  - projectId: uuid (FK)
  - ecosystemId: uuid (FK)
  - statusId: uuid (FK to projectStatuses) ← NEW
  - note: text? ← NEW (markdown decision note)
  - createdAt: timestamp
  - updatedAt: timestamp

projectMembers ← NEW
  - id: uuid
  - projectId: uuid (FK)
  - accountId: uuid (FK)
  - role: enum - owner | contributor
  - createdAt: timestamp
  - updatedAt: timestamp

commentThreads (existing, extended)
  - entityType now includes: 'projectPackage' | 'projectEcosystem'
  - Enables per-card discussions
```

### Default Statuses

New projects get one status per type:

| Name | Type |
|------|------|
| Evaluating | considering |
| Using | using |
| Phasing Out | deprecated |
| Rejected | rejected |

### Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, manage members, delete project |
| **Contributor** | Add/remove items, change statuses, edit notes, comment |

All projects are public (anyone can view). Roles control who can edit.

---

## Additional Notes

### Migration Strategy

**Ownership migration (`projects.accountId` → `projectMembers`):**

The V1 `projects` table has `accountId` directly on it. V2 introduces `projectMembers` with roles. Since V1 and V2 coexist during parallel development, we migrate ownership in two steps:

1. **Phase 1:** Create `projectMembers` table. Seed an `owner` row for every existing project from `projects.accountId`. Keep `accountId` on `projects` — V1 still reads it.
2. **Phase 5:** Once V2 is live and all ownership reads come from `projectMembers`, drop `accountId` from `projects`.

During the overlap period, project creation mutators must write to **both** `projects.accountId` (for V1) and `projectMembers` (for V2) to keep them in sync.

**Schema additions are additive and nullable:**

All new columns (`statusId`, `note`, `updatedAt` on join tables) are nullable. V1 code never reads them, so existing functionality is unaffected. No breaking changes until Phase 5 cleanup.

**Seed data in migration:**

Drizzle generates DDL only. The migration SQL must be manually extended with DML to:
- Insert `projectMembers` owner rows from `projects.accountId`
- Insert default `projectStatuses` (Evaluating, Using, Phasing Out, Rejected) for each existing project

### Design Principles

- **Presentable by default** - A project with just packages looks good without extra effort
- **Depth is optional** - Notes, statuses, links are there when you want them
- **Stay in context** - Clicking cards expands details, doesn't navigate away
- **Consistent with site** - Cards look similar to elsewhere, but interaction differs in project context
- **Mobile-first interactions** - No hover dependencies
- **Collaboration-ready** - Teams can document stacks together

### Decided

- **Layout:** Kanban board with status columns (not tag grouping as primary)
- **Tags:** Labels on cards, filtering/ordering, not structural grouping
- **Drag-and-drop:** Primary interaction for changing status (desktop)
- **Card click:** Opens side panel (desktop: slide-in from right, mobile: full overlay)
- **Discussion:** Per-card comments using existing CommentThread
- **Collaboration:** Owner/Contributor roles, all projects public
- **Development approach:** Build V2 at `/projects-v2/[id]`, compare, then swap

### Card UI

Cards display:
- Package/ecosystem name
- Brief description (truncated)
- Tags as badges
- Registry badge
- Note indicator (📝) if has decision note
- Comment count (💬 3) if has discussion
- Upvote count from the package

### Side Panel Contents

When card is clicked:
- Package/ecosystem name and description
- Status dropdown (change status without dragging)
- Decision note (markdown editor)
- Discussion thread (CommentThread component)
- Link to full package/ecosystem page

### Future Considerations

- Custom status names (mapping to fixed types for analytics)
- Status change history/timeline
- Project-level description/README
- Invite flow for contributors
