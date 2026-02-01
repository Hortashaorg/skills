# Packages

> Software packages aggregated from multiple registries - the atomic units of the foundation layer.

---

## Scope

### Core
- [x] Multi-registry aggregation (npm, jsr, nuget, dockerhub, homebrew, archlinux)
- [x] Async fetching with placeholder pattern
- [x] Release channels (latest, next, beta, etc.)
- [x] Cross-registry dependency tracking
- [x] Community tagging via suggestions
- [x] Upvoting

### Future
- [ ] Package.json import for bulk requests
- [ ] Additional registries (ghcr.io, homebrew-cask, AUR)

---

## User Stories

### Developer Searching for Tools

- **As a developer**, I want to search for packages by name, so I can find tools I've heard about.
- **As a developer**, I want to filter packages by registry (npm, jsr, nuget, etc.), so I can find packages for my tech stack.
- **As a developer**, I want to see package metadata (description, homepage, repository), so I can evaluate if it fits my needs.
- **As a developer**, I want to see what version is latest and when it was published, so I know if the package is actively maintained.

### Developer Discovering Tools

- **As a developer**, I want to browse packages by tags (frontend, testing, cli), so I can discover tools in a category.
- **As a developer**, I want to see which packages are popular (upvotes), so I can find community favorites.
- **As a developer**, I want to see a package's dependencies, so I understand what I'm pulling into my project.

### Developer Requesting Packages

- **As a developer**, I want to request a package that isn't in the database yet, so it gets fetched and available for everyone.
- **As a developer**, I want to see the status of my request (pending, completed, failed), so I know when the package is ready.

### Community Curator

See [Foundational-Curation.md](./Foundational-Curation.md) for full curator user stories. Package-specific:

- **As a curator**, I want to suggest tags for packages, so they're easier to discover.

### Cross-Feature Integration

**With Ecosystems:**
- Packages can belong to multiple ecosystems (React ecosystem, Node.js ecosystem)
- Ecosystem pages show their member packages grouped by tags

**With Projects:**
- Users add packages to their projects
- Project boards show packages as cards with status (considering, using, deprecated, rejected)

**With Tags:**
- Packages have tags for categorization
- Tags are community-curated through the suggestion system (see [Foundational-Curation.md](./Foundational-Curation.md))

**With Comparisons (future):**
- Comparisons reference specific packages
- "React vs Vue vs Solid" links to actual package entities

---

## Purpose

Packages are the **atomic units** of the foundation layer. Everything else references them.

TechGarden aggregates package metadata from multiple registries into a unified format. This gives users:

1. **One place to search** across npm, jsr, nuget, dockerhub, homebrew, archlinux
2. **Consistent data model** regardless of source registry
3. **Community curation** layered on top (tags, ecosystems, upvotes)
4. **Dependency visibility** - see what a package pulls in

Packages are objective data - facts about what exists in the world. The value layer (projects, comparisons) adds subjective meaning on top.

---

## Features

### Multi-Registry Aggregation

**What:** Packages are fetched from 6 registries: npm, jsr, nuget, dockerhub, homebrew, archlinux.

**Why:** Developers work across ecosystems. A full-stack developer might use npm packages, Docker images, and Homebrew tools. One search covers all.

### Async Fetching with Placeholders

**What:** When a package is requested, a placeholder is created immediately. A background worker fetches the full metadata. Status tracks progress: `placeholder` → `active` (or `failed`).

**Why:** Users get instant feedback. The UI shows "fetching..." rather than blocking. Failed fetches are visible in admin dashboard for debugging.

### Release Channels

**What:** Each package tracks release channels (latest, next, beta, canary) with version and publish date per channel.

**Why:** Many packages have multiple release streams. Showing only "latest" hides important information for developers tracking pre-releases.

### Cross-Registry Dependencies

**What:** Dependencies track their target registry. An npm package can depend on a jsr package.

**Why:** The JavaScript ecosystem spans registries. JSR packages often depend on npm packages. Tracking this accurately shows the real dependency graph.

### Community Tagging

**What:** Users suggest tags for packages via the curation system. Community votes approve or reject. Approved tags appear on the package.

**Why:** Registry metadata is often sparse. Community curation adds discoverability. Tags like "testing", "cli", "web-framework" help users find tools.

See [Foundational-Curation.md](./Foundational-Curation.md) for how suggestions and voting work.

### Upvoting

**What:** Logged-in users can upvote packages. Upvote count is displayed and used for sorting.

**Why:** Surfaces community favorites. "Most upvoted" is a useful discovery mechanism alongside "most recent".

---

## Data Model

```
packages
  - id: uuid
  - name: string - Package name (e.g., "express", "@tanstack/react-query")
  - registry: enum - npm, jsr, nuget, dockerhub, homebrew, archlinux
  - status: enum - active, failed, placeholder
  - failureReason: string? - Error message if status is failed
  - description: string? - From registry metadata
  - homepage: string? - Package homepage URL
  - repository: string? - Git repository URL
  - latestVersion: string? - Latest version string
  - distTags: jsonb? - All dist-tags (e.g., {"latest": "1.2.3", "next": "2.0.0-beta"})
  - upvoteCount: integer - Denormalized for fast sorting
  - lastFetchAttempt: timestamp? - When we last tried to fetch
  - lastFetchSuccess: timestamp? - When fetch last succeeded
  - createdAt: timestamp
  - updatedAt: timestamp

  Unique constraint: (name, registry)
  Index: upvoteCount (for sorting)

packageReleaseChannels
  - id: uuid
  - packageId: uuid (FK)
  - channel: string - Channel name ("latest", "next", "beta")
  - version: string - Version for this channel
  - publishedAt: timestamp? - When this version was published
  - createdAt: timestamp
  - updatedAt: timestamp

  Unique constraint: (packageId, channel)

channelDependencies
  - id: uuid
  - channelId: uuid (FK to packageReleaseChannels)
  - dependencyPackageId: uuid (FK to packages)
  - dependencyVersionRange: string - Semver range (e.g., "^1.2.0")
  - dependencyType: enum - runtime, dev, peer, optional
  - createdAt: timestamp

  Unique constraint: (channelId, dependencyPackageId, dependencyType)

packageFetches
  - id: uuid
  - packageId: uuid (FK)
  - status: enum - pending, completed, failed
  - errorMessage: string? - Error details if failed
  - createdAt: timestamp
  - completedAt: timestamp?

  Index: (status, createdAt) for pending fetch queries

packageTags
  - id: uuid
  - packageId: uuid (FK)
  - tagId: uuid (FK to tags)
  - createdAt: timestamp

  Unique constraint: (packageId, tagId)

packageUpvotes
  - id: uuid
  - packageId: uuid (FK)
  - accountId: uuid (FK to account)
  - createdAt: timestamp

  Unique constraint: (packageId, accountId)
```

### Relationships

```
packages
├── releaseChannels (many) - Version streams
│   └── dependencies (many) - What this channel depends on
├── packageTags (many) → tags - Categorization
├── packageUpvotes (many) → account - Who upvoted
├── fetches (many) - Fetch job history
├── ecosystemPackages (many) → ecosystems - Which ecosystems contain this
├── projectPackages (many) → projects - Which projects use this
└── suggestions (many) - Pending curation suggestions
```

### Package Status States

| Status | Meaning |
|--------|---------|
| `placeholder` | Created on request, awaiting fetch |
| `active` | Successfully fetched, has valid metadata |
| `failed` | Fetch failed, error stored in failureReason |

### Dependency Types

| Type | Meaning |
|------|---------|
| `runtime` | Required to run the package |
| `dev` | Only needed during development |
| `peer` | Consumer must install themselves |
| `optional` | Can be installed but not required |

### Supported Registries

| Registry | Type | Notes |
|----------|------|-------|
| `npm` | JavaScript/TypeScript | Most common, handles scoped packages |
| `jsr` | JavaScript/TypeScript | Deno's registry, requires scoped names |
| `nuget` | .NET/C# | NuGet.org packages |
| `dockerhub` | Container images | Image tags as release channels |
| `homebrew` | macOS CLI tools | Formulas from Homebrew |
| `archlinux` | Linux packages | Official Arch repos |

---

## Additional Notes

### Worker Processing Flow

1. User requests package → placeholder created, pending fetch queued
2. Worker picks up pending fetches (batch of 50)
3. For each fetch:
   - Check cooldown (don't re-fetch active packages within 1 hour)
   - Call registry adapter → get PackageData
   - Upsert package metadata
   - Ensure placeholder packages exist for all dependencies
   - Sync release channels (create/update/delete)
   - Sync dependencies per channel (atomic transaction)
   - Mark fetch completed
4. On error: mark package failed, store error message

### Registry Adapter Pattern

Each registry has a consistent structure:
- `index.ts` - Exports `getPackages(registry, names)`
- `client.ts` - HTTP calls to registry API
- `mapper.ts` - Transform API response → common PackageData format
- `schema.ts` - Zod validation for API responses

Adding a new registry means implementing these 4 files.

### Denormalized Upvote Count

`upvoteCount` is stored directly on packages for fast sorting. Updated in same transaction as upvote create/delete. Upvotes do NOT update `package.updatedAt` to prevent "Recently Updated" lists from jumping.

### Cooldown Period

Active packages won't be re-fetched for 1 hour. Prevents thrashing and respects rate limits.
