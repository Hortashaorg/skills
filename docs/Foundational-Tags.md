# Tags

> Domain classification for packages and ecosystems - filter by what part of the stack you care about.

---

## Scope

### Core
- [x] Tag entity (name, slug, description)
- [x] Package tagging via suggestions
- [x] Ecosystem tagging via suggestions
- [x] Tag-based filtering in search
- [x] Admin tag management (create, update, delete)

### Future
- [ ] Tag usage in projects (filter project packages by tag)
- [ ] Tag usage in comparisons (compare packages within a tag)

---

## User Stories

### Developer Filtering

- **As a developer**, I want to filter packages by tags (UI, Testing, CI/CD), so I can find tools for a specific part of my stack.
- **As a developer**, I want to see what tags a package has, so I understand what domains it covers.

### Community Curator

- **As a curator**, I want to suggest adding tags to packages, so they're easier to discover.
- **As a curator**, I want to suggest removing incorrect tags, so classification stays accurate.

### Admin

- **As an admin**, I want to create new tags when new domains emerge, so the taxonomy stays current.
- **As an admin**, I want to edit tag names/descriptions, so terminology can evolve.

### Cross-Feature Integration

**With Packages:**
- Packages have many tags via `packageTags` junction
- Tag filtering on package search/browse

**With Ecosystems:**
- Ecosystems have many tags via `ecosystemTags` junction
- Ecosystem detail page groups packages by their tags

**With Curation:**
- Adding/removing tags goes through suggestion system
- See [Foundational-Curation.md](./Foundational-Curation.md)

**With Projects (future):**
- Could filter project packages by tag
- "Show me all my testing dependencies"

---

## Purpose

Tags classify packages and ecosystems by **domain** - what part of the stack or workflow they belong to.

Examples: `ui`, `testing`, `ci-cd`, `infrastructure`, `observability`, `auth`

This enables:
1. **Filtered discovery** - "Show me all testing libraries"
2. **Grouped display** - Ecosystem pages group packages by tag
3. **Cross-cutting views** - See all packages in a domain regardless of ecosystem

**Design principles:**
- **Small set** - A handful of well-defined domains, not hundreds of tags
- **Flat structure** - No hierarchy or categories (ecosystems handle grouping)
- **Minimal overlap** - Tags should be distinct, though some tools span domains (e.g., Storybook is both UI and Testing)
- **Primary purpose** - Tag based on what the tool is *for*, not what it uses internally. Loki uses storage, but its purpose is observability - so it gets the `observability` tag
- **Admin-curated** - Controlled taxonomy prevents tag sprawl

Tags answer "what part of the stack is this for?" while ecosystems answer "what product/platform does this belong to?"

---

## Data Model

```
tags
  - id: uuid
  - name: string (unique, max 50 chars) - Display name
  - slug: string (unique) - URL-friendly, auto-generated
  - description: string? (max 200 chars)
  - createdAt: timestamp
  - updatedAt: timestamp

packageTags
  - id: uuid
  - packageId: uuid (FK)
  - tagId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (packageId, tagId)

ecosystemTags
  - id: uuid
  - ecosystemId: uuid (FK)
  - tagId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (ecosystemId, tagId)
```

### Relationships

```
tags
├── packageTags (many) → packages
└── ecosystemTags (many) → ecosystems
```

---

## Additional Notes

### Admin-Only Tag Creation

Tags themselves are admin-created. This prevents tag spam and keeps the taxonomy clean. Users can only suggest adding/removing existing tags from packages/ecosystems.

### Slug Generation

When a tag is created or renamed, the slug is auto-generated:
- Lowercase
- Replace spaces with hyphens
- Remove special characters

Example: "CI/CD" → "ci-cd"
