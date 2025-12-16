# TechGarden Database Schema Design

Comprehensive schema design for MVP, informed by real-world package registry implementations.

## Research Findings

**Key patterns from npm (CouchDB) and crates.io (PostgreSQL):**
- Normalized structure: separate packages/versions/dependencies tables
- Background job queues for async tasks
- Download/usage analytics
- Extensibility: easy to add columns, hard to change relationships

**Sources:** [npm blog](https://blog.npmjs.org/post/75707294465/new-npm-registry-architecture.html), [crates.io GitHub](https://github.com/rust-lang/crates.io)

## Core Tables Summary

- **packages** - Multi-registry package metadata, fetch tracking
- **package_versions** - Version history, publish dates
- **package_dependencies** - Links with version ranges + resolved versions
- **package_requests** - User + auto-queued requests, status, rate limiting
- **tags** - Flat tag structure (name, slug, color)
- **package_tags** - Many-to-many, tracks who assigned
- **account** - No changes (roles from identity provider)

### Query Patterns

**Most common:**
- Search/browse packages (name, tag, registry)
- Package details with versions and dependencies
- User's request queue

**Write operations:**
- User: create package requests
- Worker: update requests, create packages/versions/dependencies
- Admin: manage tags

**Complex (analytics platform):**
- Transitive dependency counts
- Shared dependencies, depth analysis

## Key Design Decisions

Based on feedback and long-term vision:

### 1. Start Lean - Optimize Later
- NO denormalized fields in MVP (latest_version, dependency_count, etc.)
- Calculate from relations, let Zero's caching handle performance
- Add optimizations ONLY when pain points proven with real usage

### 2. Analytics Platform for Heavy Lifting
- Postgres + Zero for operational data (packages, requests, tags)
- DuckDB + Parquet + Polaris for complex aggregations (transitive deps, trends)
- Separate concerns: real-time operations vs analytical workloads

### 3. Platform-Specific Interaction Tracking
- Don't rely on external stats (npm downloads are biased across registries)
- Track TechGarden interactions for "even ground" comparisons
- Views, searches, requests, tag assignments = fair metrics across all registries

### 4. Simple Flat Tags for MVP
- No hierarchy (add parent_tag_id later if needed)
- Few generic, broad tags (database, frontend, testing, devops, etc.)
- Easy to extend with voting, confidence, aliases later

### 5. Version Management via Relations
- No latest_version field in packages table
- Calculate from package_versions (sort by publishedAt or semantic versioning)
- Add denormalized field only if query becomes proven bottleneck

### Technical Trade-offs Summary

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| Denormalization | Normalized, add fields when proven needed | Lean schema, flexible, maintainable |
| Complex aggregations | Analytics platform (DuckDB/Parquet) | Postgres for operations, analytics for heavy compute |
| Package stats | Track platform interactions, not external | Fair comparison across registries, unbiased |
| Dependency links | Nullable with SET NULL | Store deps before target exists (auto-queue) |
| Tags | Flat structure for MVP | Start simple, add hierarchy when needed |

### Access Patterns by Role

- **Anonymous** - Read-only: search, browse, view details, dependency graphs
- **Authenticated** - Above + create requests, view request history
- **Admin** - Above + tag management (via identity provider roles, not DB flag)
- **Worker** - Queue processing, package creation, auto-queue dependencies

## Proposed Schema

### Core Tables

#### packages

```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  registry TEXT NOT NULL CHECK (registry IN ('npm', 'jsr', 'brew', 'apt')),
  description TEXT,
  homepage TEXT,
  repository TEXT,
  last_fetch_attempt TIMESTAMP,
  last_fetch_success TIMESTAMP,
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES account(id),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,

  CONSTRAINT packages_name_registry_unique UNIQUE (name, registry)
);

-- Indexes
CREATE INDEX idx_packages_name ON packages (name);
CREATE INDEX idx_packages_registry ON packages (registry);
CREATE INDEX idx_packages_last_fetch_attempt ON packages (last_fetch_attempt);
CREATE INDEX idx_packages_created_at ON packages (created_at DESC);
CREATE INDEX idx_packages_deleted_at ON packages (deleted_at) WHERE deleted_at IS NULL; -- filter active packages
```

**Rationale:**
- `name + registry` unique constraint prevents duplicates
- `last_fetch_attempt` enables 1-hour cooldown (timestamp type)
- Soft delete: `deleted_at`, `deleted_by` for recovery
- No DB defaults (Zero incompatibility)
- Indexes support common queries: search, filter, sort
- NO denormalized fields - calculate from relations

**Future extensibility:**
- Easy to add new registries to CHECK constraint
- Can add columns: license, maintainers, keywords without breaking changes
- Platform interaction tracking via separate analytics

#### package_versions

```sql
CREATE TABLE package_versions (
  id UUID PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,

  CONSTRAINT package_versions_package_version_unique UNIQUE (package_id, version)
);

-- Indexes
CREATE INDEX idx_package_versions_package_id ON package_versions (package_id);
CREATE INDEX idx_package_versions_published_at ON package_versions (published_at DESC NULLS LAST);
```

**Rationale:**
- `package_id + version` unique prevents duplicate versions
- CASCADE delete removes versions when package deleted
- Simple structure, easy to extend (can add: yanked, checksum, size, etc.)

**Future extensibility:**
- Add columns: is_yanked, checksum, size, rust_version, etc. (like crates.io)
- Add yank_message for deprecation notes

#### package_dependencies

```sql
CREATE TABLE package_dependencies (
  id UUID PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES package_versions(id) ON DELETE CASCADE,

  -- Dependency identification
  dependency_name TEXT NOT NULL,
  dependency_package_id UUID REFERENCES packages(id) ON DELETE SET NULL,

  -- Version constraints
  dependency_version_range TEXT NOT NULL, -- e.g., "^1.0.0" (from package.json)
  resolved_version TEXT NOT NULL, -- e.g., "1.2.5" (REQUIRED - worker must resolve)
  resolved_version_id UUID REFERENCES package_versions(id) ON DELETE SET NULL,

  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('runtime', 'dev', 'peer', 'optional')),
  created_at TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_package_dependencies_package_id ON package_dependencies (package_id);
CREATE INDEX idx_package_dependencies_version_id ON package_dependencies (version_id);
CREATE INDEX idx_package_dependencies_dependency_package_id ON package_dependencies (dependency_package_id); -- reverse lookup
CREATE INDEX idx_package_dependencies_resolved_version_id ON package_dependencies (resolved_version_id); -- CVE tracking
CREATE INDEX idx_package_dependencies_dependency_name ON package_dependencies (dependency_name);
CREATE INDEX idx_package_dependencies_name_type ON package_dependencies (dependency_name, dependency_type); -- compound
CREATE INDEX idx_package_dependencies_name_resolved ON package_dependencies (dependency_name, resolved_version) WHERE resolved_version IS NOT NULL; -- CVE queries
```

**Rationale:**
- `dependency_version_range` = intent (what package.json specifies)
- `resolved_version` = reality (what was actually used) - **REQUIRED (NOT NULL)**
- `resolved_version_id` = link to actual version (nullable - may not exist in DB yet)
- Enables CVE tracking: "Find all packages using express@4.18.1"
- Worker must always resolve version from npm
- Compound indexes for common query patterns
- Reverse lookup index enables "packages using this" feature

**Future extensibility:**
- Add columns: features (Rust-style), platform-specific, is_bundled

#### package_requests

```sql
CREATE TABLE package_requests (
  id UUID PRIMARY KEY,
  package_name TEXT NOT NULL,
  registry TEXT NOT NULL CHECK (registry IN ('npm', 'jsr', 'brew', 'apt')),
  requested_by UUID REFERENCES account(id) ON DELETE SET NULL,
  source_request_id UUID REFERENCES package_requests(id) ON DELETE SET NULL,
  is_auto_queued BOOLEAN NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'fetching', 'completed', 'failed')),
  error_message TEXT,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  attempt_count INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Unique constraint: no duplicate pending/fetching requests
CREATE UNIQUE INDEX idx_package_requests_unique_pending
  ON package_requests (package_name, registry, status)
  WHERE status IN ('pending', 'fetching');

-- Indexes
CREATE INDEX idx_package_requests_requested_by_created ON package_requests (requested_by, created_at DESC);
CREATE INDEX idx_package_requests_status_created ON package_requests (status, created_at) WHERE status IN ('pending', 'fetching'); -- worker queue
CREATE INDEX idx_package_requests_is_auto_queued ON package_requests (is_auto_queued, status);
CREATE INDEX idx_package_requests_source_request_id ON package_requests (source_request_id);
```

**Rationale:**
- Partial unique index prevents duplicate pending/fetching requests
- `requested_by` nullable supports auto-queued dependencies
- `source_request_id` enables tracing request chains
- `is_auto_queued` enables filtering user vs system requests for rate limiting
- SET NULL on deletes preserves request history

**Future extensibility:**
- Add columns: priority (high for user requests, low for auto-queued)
- Add retry_after timestamp for exponential backoff
- Add metadata JSON column for extra context

#### tags

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES account(id),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_tags_slug ON tags (slug);
CREATE INDEX idx_tags_name ON tags (name);
CREATE INDEX idx_tags_deleted_at ON tags (deleted_at) WHERE deleted_at IS NULL;
```

**Rationale:**
- Separate slug for URL-friendly routing
- Color for UI consistency
- Simple flat structure for MVP (no hierarchy)
- Start with few generic, broad tags (database, frontend, testing, etc.)

**Future extensibility:**
- Add columns: icon, parent_tag_id (hierarchical tags if needed), is_official
- Add tag_aliases table for synonyms
- Add tag voting/confidence for community curation

#### package_tags

```sql
CREATE TABLE package_tags (
  id UUID PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL,

  CONSTRAINT package_tags_package_tag_unique UNIQUE (package_id, tag_id)
);

-- Indexes
CREATE INDEX idx_package_tags_package_id ON package_tags (package_id);
CREATE INDEX idx_package_tags_tag_id ON package_tags (tag_id);
CREATE INDEX idx_package_tags_created_by ON package_tags (created_by);
```

**Rationale:**
- `package_id + tag_id` unique prevents duplicate tag assignments
- `created_by` tracks contributions (enables XP system later)
- CASCADE deletes maintain referential integrity

**Future extensibility:**
- Add columns: votes (upvote/downvote), confidence_score
- Add updated_at for vote tracking
- Add is_official (admin vs community tags)

#### account (existing, no changes needed)

**Authorization via identity provider:**
- Roles provided in Zero mutation context from OAuth/JWT claims
- No database storage needed: `ctx.roles.includes('admin')`
- Cleaner: Use identity provider for access control, not database flags

**Future extensibility:**
- Add xp, level, badges columns for gamification (when implemented)
- Add contribution_stats JSON for achievements (when implemented)

## Constraints & Data Integrity

### Unique Constraints
- `packages(name, registry)` - no duplicate packages per registry
- `package_versions(package_id, version)` - no duplicate versions
- `package_requests(package_name, registry, status)` WHERE pending/fetching - no duplicate active requests
- `tags(name)` - unique tag names
- `tags(slug)` - unique URL slugs
- `package_tags(package_id, tag_id)` - no duplicate tag assignments

### Foreign Key Cascades
- `package_versions → packages`: CASCADE (delete versions with package)
- `package_dependencies → packages/versions`: CASCADE (delete deps with package/version)
- `package_dependencies → dependency_package_id`: SET NULL (preserve dep info)
- `package_tags → packages/tags`: CASCADE (delete assignments with package/tag)
- `package_requests → account`: SET NULL (preserve requests if user deleted)
- `package_requests → package_id`: SET NULL (preserve request history)

### Check Constraints
- `registry IN (...)` - only valid registries
- `status IN (...)` - only valid statuses
- `dependency_type IN (...)` - only valid dependency types

## Index Strategy Summary

Indexes organized by purpose (see table definitions for full details):
- **Search/filter:** packages(name, registry), tags(name, slug)
- **Sort:** created_at, published_at
- **Joins:** All foreign keys indexed
- **Rate limiting:** last_fetch_attempt, requested_by+created_at
- **Partial:** Unique pending/fetching requests (Postgres optimization)

## Analytics Platform Strategy

### Separation of Concerns

**Operational Database (Postgres + Zero):**
- Real-time package data (packages, versions, dependencies)
- User requests and queue processing
- Tags and relationships
- Fast reads/writes for application features

**Analytics Platform (DuckDB + Parquet + Apache Polaris):**
- Complex aggregations (transitive dependency counts, graph analysis)
- Historical trends and patterns
- Cross-package comparisons
- User interaction analytics
- Heavy computational workloads

### Why Separate?

**Avoid premature optimization:**
- Don't denormalize until pain points proven
- Don't build complex aggregation queries in Postgres if analytics platform can handle it
- Keep operational schema lean and flexible

**Platform Interaction Tracking:**
Rather than storing biased external stats (npm downloads vary by registry):
- Track TechGarden-specific interactions (views, searches, requests, tag assignments)
- Provides "even ground" comparison across all registries
- Send interaction events to analytics platform for processing
- Query aggregated results when needed (cached or API)

### Data Flow

```
User interaction → Postgres (raw events) → Analytics platform (aggregation)
                                         ↓
                            Cached results ← API query
```

**Examples:**
- Transitive dependency count → Computed in DuckDB, cached
- Shared dependencies analysis → Parquet columnar format ideal for this
- Package popularity by registry → Fair comparison using platform interactions
- User insights (most active taggers, etc.) → Analytics platform

## Zero + Analytics: Data Access Strategy

**Zero (client-side, Postgres-backed):**
- Replicate: packages, versions, dependencies, tags (based on user interest)
- Simple queries: search, filter, related data (`zql.packages.related('versions')`)
- Simple aggregations: COUNT tags, user's request count
- Don't replicate: all package requests (privacy), admin data (unless admin)

**Analytics Platform (DuckDB/Parquet):**
- Complex aggregations: transitive deps, shared deps, depth analysis
- Historical trends and patterns
- Platform interaction tracking (views, searches) for fair cross-registry metrics

**MVP approach:**
- Calculate on-demand (latest version via sort, direct deps via COUNT)
- Let Zero caching handle performance
- Add analytics platform post-MVP when needed

## Performance Notes

**Denormalization:** Only add fields when proven bottleneck. Start normalized.

**N+1 Prevention:** Use Zero's `related()` for joins: `zql.packages.related('versions')`

**Indexes:** Cover common queries (see table definitions above)

## Future Extensibility

### Easy to Add (Non-breaking)

**New columns (add when needed, not preemptively):**
- `packages.license`, `packages.maintainers`, `packages.keywords`
- `packages.latest_version` (only if proven bottleneck)
- `package_versions.is_yanked`, `package_versions.checksum`
- `package_dependencies.features`, `package_dependencies.platform`
- `tags.icon`, `tags.parent_tag_id` (if hierarchy needed)
- `account.xp`, `account.level`, `account.badges` (when gamification added)

**New tables (add when feature implemented):**
- `package_interactions` - platform-specific tracking (views, searches)
- `user_contributions` - XP tracking (future)
- `package_comparisons` - saved comparisons (future)
- `projects` - user tech stacks (future)

**New registries:**
- Add to `registry` CHECK constraint
- No schema changes needed
- Test with jsr, then brew, then apt

### Hard to Change (Breaking)

**Changing relationships:**
- Splitting `package_dependencies` into separate tables per type
- Changing `package_tags` from many-to-many to hierarchy
- Merging `packages` and `package_versions` (bad idea but would be hard)

**Changing primary keys:**
- UUID → integer (would break all foreign keys)
- Composite keys (would break Zero's expectations)

**Recommendation:** Design relationships carefully now, add columns liberally later

## Schema Evolution Plan

### Version 1 (MVP - Start Lean)
- Core tables: packages, package_versions, package_dependencies
- Request queue: package_requests
- Tagging: tags, package_tags
- User: account.isAdmin
- Basic indexes for common queries
- Foreign key constraints
- Check constraints
- NO denormalized fields (calculate from relations)

### Version 2 (Analytics Platform Integration)
- Add package_interactions table (optional - might go to analytics DB)
- Add analytics API integration
- Evaluate denormalization needs based on real usage
- Add indexes for proven slow queries

### Version 3 (Community Features)
- Add user_contributions table (if not in analytics DB)
- Add XP/badges columns to account
- Add voting columns to package_tags (if needed)
- Add tag hierarchy (parent_tag_id) if proven useful

### Version 4 (Multi-Registry)
- Add jsr to registry enum (test with real data)
- Add cross_registry_links table (link same packages across registries)
- Add brew, apt after jsr validated
- Add registry-specific metadata columns as needed

### Philosophy

**Don't add until you need it:**
- No denormalized fields until proven bottleneck
- No new tables until feature implemented
- No indexes until query performance measured
- Let analytics platform handle heavy lifting

## Performance Testing Checklist

Before finalizing schema:
- [ ] Test search query performance (EXPLAIN ANALYZE)
- [ ] Test dependency graph query (recursive CTE)
- [ ] Test tag filtering with large datasets
- [ ] Test rate limiting queries (user request count)
- [ ] Test worker queue queries (pending requests)
- [ ] Test Zero replication size with 1000+ packages
- [ ] Test pagination performance
- [ ] Test sort by popularity (downloads)

## Implementation Decisions (Confirmed)

### Drizzle Schema Requirements

**Timestamps:**
- Use `timestamp()` type (existing pattern)
- No DB defaults - Zero's local-first doesn't work with defaults
- Client sets all timestamp values (createdAt, updatedAt, deletedAt)

**Primary Keys:**
- All tables have `id: uuid()` column as primary key
- Zero requires single-column PK (no composite keys)
- Use unique constraints for business logic (e.g., `UNIQUE(packageId, tagId)`)

**Package Names:**
- Store as-is from registry (don't enforce lowercase)
- Registry dictates casing rules ("Hono" vs "hono" are different if registry says so)
- Search handles case-insensitivity at query time (not schema concern)

**Dependency Resolution:**
- `resolved_version` is NOT NULL (required field)
- Worker must always resolve version from npm
- If resolution fails, revisit strategy later (don't over-engineer now)

**Soft Deletes:**
- Add to `packages` and `tags` tables
- Fields: `deletedAt: timestamp()`, `deletedBy: uuid()`
- Enables recovery from admin mistakes (not GDPR data)
- Skip for junction/child tables (package_tags, package_dependencies, package_versions)

**Audit Trail:**
- Skip full audit log for MVP (can add later)
- Use soft delete tracking (deletedBy) for now
- Post-MVP: Consider separate audit_log table if needed

**Relations:**
- Must define all Drizzle relations (Zero schema generation uses them)
- Follow existing pattern from `techRelations`, `tagRelations`

**Indexes:**
- Keep compound indexes (cheap, helpful, often forgotten)
- Add text_pattern_ops for prefix search if needed

**Authorization:**
- Use identity provider roles (OAuth/JWT claims in context)
- No DB storage: `ctx.roles.includes('admin')`

### Migration Strategy

**Existing tables:**
- `account` - Used in frontend, keep as-is
- `technology`, `tag`, `tag_to_technology` - Can replace with new schema

**New tables:**
- Create all with proper types, constraints, indexes
- No DB defaults (Zero incompatibility)
- All timestamps client-managed

### Seed Data
1. Popular packages (React, Vue, Express, Hono, etc.)
2. Initial tags (frontend, backend, database, testing, devops, etc.)

### Testing
1. Insert test data (packages, versions, dependencies)
2. Test all queries in SCHEMA-QUERIES.md (create next)
3. Verify constraints work (try duplicate inserts)
4. Verify cascades work (delete package, check versions)
5. Test Zero schema generation
6. Test Zero queries client-side

## Next Steps

1. ✅ Research existing schemas (npm, crates.io)
2. ✅ Design schema with indexes and constraints
3. ⏭️ Define query patterns (SCHEMA-QUERIES.md)
4. ⏭️ Implement Drizzle schema
5. ⏭️ Generate Zero schema
6. ⏭️ Create migration
7. ⏭️ Test performance with realistic data

## Sources

- [npm Registry Architecture](https://blog.npmjs.org/post/75707294465/new-npm-registry-architecture.html)
- [PostgreSQL Dependency Tracking](https://www.postgresql.org/docs/current/ddl-depend.html)
- [crates.io GitHub Repository](https://github.com/rust-lang/crates.io)
