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

### Core (Status & Notes Rework)
- [ ] Status types (considering, using, deprecated, rejected)
- [ ] Custom status names per project (mapping to fixed types)
- [ ] Status badge on cards
- [ ] Notes on cards (optional)
- [ ] Note indicator icon on cards
- [ ] Default statuses for new projects
- [ ] View by status (alternative grouping)
- [ ] URL reflects view/filter state for sharing

### Future
- [ ] Link cards to comparisons
- [ ] Rich text notes (when editor is available)
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

### Tag-Grouped Layout (Default)

**What:** Items displayed in a grid, grouped by tags (API, Database, Infrastructure, etc.). Current design, proven to work.

**Why:** Natural way to browse a stack. "What are they using for observability?" Easy to scan.

### Status as a Property

**What:** Each item has a status (considering, using, deprecated, rejected). Displayed as a badge on the card.

**Why:** Shows decision state without changing the layout. Filter or group by status when needed.

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
- Click card → expand details (notes, links) in context
- Click status badge → change status (dropdown)
- Click note icon → view/edit notes
- Explicit "go to package" link → navigate to package/ecosystem page

**Why:** Clicking a card should keep you in the project context. Navigating away is a separate, explicit action.

### View Modes

**What:** Toggle between "group by tag" and "group by status". URL reflects current view.

**Why:** Different perspectives on same data. Share the view that makes sense for the recipient.

### Mobile-Friendly

**What:** All interactions work on mobile. No hover-dependent functionality required (hover can enhance but not required).

**Why:** Must work everywhere.

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

### Open Questions

**Expand behavior:** When clicking a card, does it:
- Expand inline (accordion style)?
- Open a side panel?
- Open a modal?

**Status grouping view:** How to display when grouped by status?
- Columns (kanban-style)?
- Collapsible sections?
- Tabs?

**History tracking:** Do we track status changes over time? (Adds complexity, maybe future)
