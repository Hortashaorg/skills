# Ecosystems

> Product identities and technology platforms - containers for related packages.

---

## Scope

### Core
- [x] Ecosystem browsing and search
- [x] Packages grouped by tags on detail page
- [x] Community curation (create, add/remove packages, add/remove tags, edit description/website)
- [x] Upvoting
- [x] Project integration (add ecosystems to projects)

### Future
(None planned - will add when validated use cases emerge)

---

## User Stories

### Developer Exploring Technologies

- **As a developer**, I want to browse ecosystems (React, AWS, Kubernetes), so I can explore technology platforms holistically.
- **As a developer**, I want to see all packages in an ecosystem, so I understand what tools are available within that platform.
- **As a developer**, I want to see ecosystem packages grouped by tags, so I can find the right tool for my need (state management, testing, styling).

### Developer Declaring Stack

- **As a developer**, I want to add ecosystems to my project, so I can declare "I use AWS" without listing every AWS package.
- **As a developer**, I want to upvote ecosystems I find valuable, so the community knows what's popular.

### Community Curator

See [Foundational-Curation.md](./Foundational-Curation.md) for full curator user stories. Ecosystem-specific:

- **As a curator**, I want to suggest new ecosystems, so emerging platforms get recognized.
- **As a curator**, I want to suggest adding/removing packages from ecosystems, so collections stay accurate.

### Cross-Feature Integration

**With Packages:**
- Ecosystems contain packages (many-to-many)
- Packages can belong to multiple ecosystems (React package in both "React" and "Frontend" ecosystems)

**With Tags:**
- Ecosystems have tags for categorization
- Packages within ecosystems are grouped by their tags on the ecosystem detail page

**With Projects:**
- Users add ecosystems to projects alongside individual packages
- "I use the AWS ecosystem" is a meaningful project declaration

**With Comparisons (future):**
- Comparisons might reference ecosystems, not just packages
- "React ecosystem vs Vue ecosystem" as a comparison

---

## Purpose

Ecosystems are **product identities** - they represent technologies that are more than the sum of their packages.

React isn't just `react` on npm. It's a platform with:
- Core libraries (react, react-dom)
- State management (redux, zustand, jotai)
- Routing (react-router, tanstack-router)
- Meta-frameworks (next.js, remix)
- Testing tools (react-testing-library)
- And hundreds more

Ecosystems capture this reality. They let users:

1. **Discover related tools** - "What state management options exist in the React ecosystem?"
2. **Declare platform choices** - "My project uses AWS" without listing 50 packages
3. **Explore holistically** - Browse a technology as a unified concept

Some ecosystems aren't even packages themselves. "Kubernetes" is a platform with many CLI tools, operators, and utilities - but no single "kubernetes" package to point at.

---

## Features

### Ecosystem Browsing

**What:** Users can browse all ecosystems, search by name, and filter by tags.

**Why:** Discovery at the platform level. "Show me all cloud provider ecosystems" is useful alongside package-level search.

### Packages Grouped by Tags

**What:** On an ecosystem detail page, packages are displayed grouped by their tags (e.g., "State Management", "Routing", "Testing").

**Why:** Large ecosystems have hundreds of packages. Grouping makes them navigable. Users can find "React testing libraries" without scrolling through everything.

### Community Curation

**What:** Ecosystems are entirely community-curated through the suggestion system. Users can suggest new ecosystems, add/remove packages, add/remove tags, and edit descriptions/websites.

**Why:** No single person knows every ecosystem. Community knowledge is aggregated through democratic voting. Prevents gatekeeping - anyone can contribute.

See [Foundational-Curation.md](./Foundational-Curation.md) for how the suggestion and voting system works.

### Upvoting

**What:** Logged-in users can upvote ecosystems. Count displayed and used for sorting.

**Why:** Surfaces popular platforms. "Most upvoted ecosystems" helps new developers find established technologies.

### Project Integration

**What:** Users can add ecosystems to their projects, just like packages.

**Why:** "I use AWS" is a meaningful declaration. Projects can show both individual packages and the broader platforms they're built on.

---

## Data Model

```
ecosystems
  - id: uuid
  - name: string - Display name ("React", "AWS", "Kubernetes")
  - slug: string - URL-friendly identifier ("react", "aws", "kubernetes")
  - description: string? - Markdown description of the ecosystem
  - website: string? - Official website URL
  - upvoteCount: integer - Denormalized for fast sorting
  - createdAt: timestamp
  - updatedAt: timestamp

  Unique constraint: slug
  Index: upvoteCount (for sorting)

ecosystemPackages
  - id: uuid
  - ecosystemId: uuid (FK)
  - packageId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (ecosystemId, packageId)

ecosystemTags
  - id: uuid
  - ecosystemId: uuid (FK)
  - tagId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (ecosystemId, tagId)

ecosystemUpvotes
  - id: uuid
  - ecosystemId: uuid (FK)
  - accountId: uuid (FK to account)
  - createdAt: timestamp

  Unique constraint: (ecosystemId, accountId)

projectEcosystems
  - id: uuid
  - projectId: uuid (FK)
  - ecosystemId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (projectId, ecosystemId)
```

### Relationships

```
ecosystems
├── ecosystemPackages (many) → packages - Contained packages
├── ecosystemTags (many) → tags - Categorization
├── ecosystemUpvotes (many) → account - Who upvoted
├── projectEcosystems (many) → projects - Which projects use this
└── suggestions (many) - Pending curation suggestions
```

---

## Curation

Ecosystems are entirely community-curated. See [Foundational-Curation.md](./Foundational-Curation.md) for the full curation system.

### Ecosystem Suggestion Types

| Type | Purpose |
|------|---------|
| `create_ecosystem` | Create new ecosystem |
| `add_ecosystem_package` | Add package to ecosystem |
| `remove_ecosystem_package` | Remove package from ecosystem |
| `add_ecosystem_tag` | Add tag to ecosystem |
| `remove_ecosystem_tag` | Remove tag from ecosystem |
| `edit_ecosystem_description` | Change description |
| `edit_ecosystem_website` | Change website URL |

---

## Additional Notes

### Ecosystems vs Packages

| Aspect | Packages | Ecosystems |
|--------|----------|------------|
| Source | Registry APIs (automated) | Community curation (manual) |
| Identity | Single installable unit | Product/platform identity |
| Examples | `react`, `express`, `lodash` | React, AWS, Kubernetes |
| Contains | Dependencies | Related packages |

### Slug Generation

When creating an ecosystem, the slug is auto-generated from the name:
- Lowercase
- Trim whitespace
- Remove special characters
- Replace spaces with hyphens

Example: "React Native" → "react-native"

### Upvote Behavior

Like packages, ecosystem upvotes do NOT update `ecosystem.updatedAt`. This prevents "Recently Updated" lists from jumping when users upvote.

### Search Behavior

Ecosystem search uses `ILIKE` on name. Tag filtering requires ALL specified tags (AND logic).
