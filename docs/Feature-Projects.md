# Projects

> Shareable stack documentation with decision context - what you use and why.

---

## Scope

### Core (Existing)
- [x] Project CRUD (create, read, update, delete)
- [x] Add packages to projects
- [x] Add ecosystems to projects
- [x] Public project sharing (URL)
- [x] Group by tags view

### Core (Kanban Rework)
- [ ] Kanban board layout (status columns)
- [ ] Drag-and-drop to change status
- [ ] Status types (considering, using, deprecated, rejected)
- [ ] Custom status names per project (mapping to fixed types)
- [ ] Default statuses for new projects
- [ ] Tag labels displayed on cards
- [ ] Tag filtering
- [ ] Tag-based ordering within columns
- [ ] URL reflects filter state for sharing
- [ ] Card expansion (notes, details) on click

### Core (Notes)
- [ ] Notes on cards (plain text initially)
- [ ] Note indicator icon on cards

### Future
- [ ] Rich text notes (when RichText feature is available)
- [ ] Link cards to comparisons
- [ ] Package.json import

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
  - note: text? ← NEW
  - createdAt: timestamp
  - updatedAt: timestamp

projectEcosystems (same pattern)
  - id: uuid
  - projectId: uuid (FK)
  - ecosystemId: uuid (FK)
  - statusId: uuid (FK to projectStatuses) ← NEW
  - note: text? ← NEW
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Default Statuses

New projects get one status per type:

| Name | Type |
|------|------|
| Evaluating | considering |
| Using | using |
| Phasing Out | deprecated |
| Rejected | rejected |

Users can rename these. Adding/removing statuses TBD.

---

## Additional Notes

### Design Principles

- **Presentable by default** - A project with just packages looks good without extra effort
- **Depth is optional** - Notes, statuses, links are there when you want them
- **Stay in context** - Clicking cards expands details, doesn't navigate away
- **Consistent with site** - Cards look similar to elsewhere, but interaction differs in project context
- **Mobile-first interactions** - No hover dependencies

### Decided

- **Layout:** Kanban board with status columns (not tag grouping as primary)
- **Tags:** Labels on cards, filtering/ordering, not structural grouping
- **Drag-and-drop:** Primary interaction for changing status

### Open Questions

**Expand behavior:** When clicking a card, does it:
- Expand inline (accordion style)?
- Open a side panel?
- Open a modal?

**History tracking:** Do we track status changes over time? (Adds complexity, maybe future)
