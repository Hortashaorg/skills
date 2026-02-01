# Comparisons

> User-generated technology comparisons - subjective evaluations linked to real packages and ecosystems.

---

## Scope

### Core
- [ ] Comparison entity (title, description, items)
- [ ] Link comparison items to packages/ecosystems
- [ ] Public/shareable comparisons
- [ ] User-owned (no community curation)

### Future
- [ ] Link comparisons to project cards ("why I chose this")

---

## User Stories

### Developer Evaluating Options

- **As a developer**, I want to create a comparison of ORMs I evaluated, so I can remember my reasoning and share it with others.
- **As a developer**, I want to see other people's comparisons, so I can learn from their research.

### Developer Documenting Decisions

- **As a developer**, I want to link my comparison to my project, so others can see why I chose what I chose.

### Cross-Feature Integration

**With Packages & Ecosystems:**
- Comparison items link to packages or ecosystems from the foundation layer
- Clicking an item takes you to the real entity

**With Projects (future):**
- Project cards can link to comparisons
- "Why React?" → shows the frontend framework comparison that led to the decision

---

## Purpose

Comparisons are **user-generated evaluations** - subjective content that references foundational data.

Unlike foundation layer entities (packages, ecosystems, tags), comparisons are:
- **Subjective** - your opinion, your criteria, your ranking
- **Individually owned** - you create and control your comparisons
- **Not community-curated** - no suggestions or voting on other people's comparisons

This keeps comparisons personal and low-friction. You're documenting *your* evaluation, not trying to build community consensus on which ORM is best.

Comparisons anchor abstract discussions to concrete entities. "I like Drizzle better than Prisma" becomes a structured comparison linking to real packages with your specific reasoning.

---

## Features

### Comparison Creation

**What:** Users create comparisons with a title, optional description, and items. Each item links to a package or ecosystem.

**Why:** Structure your evaluation. Instead of prose, you have linked entities with notes per item.

### Personal Ownership

**What:** Comparisons belong to the user who created them. No suggestion system, no community voting.

**Why:** Opinions are subjective. Curation works for facts (is this package in the React ecosystem?) but not for preferences (is React better than Vue?).

### Public Sharing

**What:** Comparisons have URLs. Share them in discussions, link from projects, reference in blog posts.

**Why:** Value comes from sharing. Your research helps others facing the same decision.

---

## Data Model

```
comparisons
  - id: uuid
  - accountId: uuid (FK) - Owner
  - title: string - "Frontend Framework Comparison"
  - description: string? - Optional context
  - createdAt: timestamp
  - updatedAt: timestamp

comparisonItems
  - id: uuid
  - comparisonId: uuid (FK)
  - packageId: uuid? (FK) - Link to package (if applicable)
  - ecosystemId: uuid? (FK) - Link to ecosystem (if applicable)
  - position: integer - Order in the comparison
  - notes: string? - Your thoughts on this item
  - createdAt: timestamp
  - updatedAt: timestamp

  Constraint: Must have either packageId or ecosystemId
```

### Relationships

```
comparisons
├── account - Owner
└── comparisonItems (many)
    ├── package (optional)
    └── ecosystem (optional)
```

---

## Additional Notes

### No Curation

Comparisons deliberately skip the suggestion/voting system. Reasons:
- Subjective content doesn't benefit from consensus
- Reduces friction for creating comparisons
- Keeps ownership clear

### Comparison vs Project

| Aspect | Comparison | Project |
|--------|------------|---------|
| Purpose | Evaluate options | Track what you use |
| Content | Multiple alternatives | Your chosen stack |
| Items | Packages you're considering | Packages you're using |
| Outcome | Helps you decide | Documents your decisions |

A comparison might lead to a project decision. You can link them to show the journey.
