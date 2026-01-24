# Database Package

Reference for queries, mutators, and schema patterns.

## Helpers (`mutators/helpers.ts`)

```tsx
import { newRecord, now } from "./helpers.ts";

// Insert: use newRecord() for id + timestamps
const record = newRecord();
await tx.mutate.table.insert({
  id: record.id,
  ...data,
  createdAt: record.now,
  updatedAt: record.now,
});

// Update: use now() for updatedAt
await tx.mutate.table.update({
  id,
  ...data,
  updatedAt: now(),
});
```

## ZQL Query Capabilities

**Filtering:**
```tsx
.where("field", value)              // Exact match (= is default)
.where("field", "=", value)         // Explicit equals
.where("field", "!=", value)        // Not equal
.where("field", ">", value)         // Comparison: >, <, >=, <=
.where("field", "IS", null)         // NULL check
.where("field", "IS NOT", null)     // NOT NULL check
.where("field", "LIKE", "%foo%")    // Pattern matching (case-sensitive)
.where("field", "ILIKE", "%foo%")   // Pattern matching (case-insensitive)
.where("field", "IN", [...])        // Array containment
.where("field", "NOT IN", [...])    // Array exclusion
.where(...).where(...)              // Chain = AND logic
```

**Compound filters:**
```tsx
.where(({ cmp, or, and, not, exists }) =>
  or(
    cmp("status", "active"),
    and(cmp("priority", ">", 5), not(cmp("archived", true)))
  )
)
.whereExists("comments")            // Has related rows
.whereExists("comments", q => q.where("approved", true))
```

**Ordering, limiting, paging:**
```tsx
.orderBy("field", "asc" | "desc")   // Sorting (chainable)
.limit(n)                           // Limit results
.start(row)                         // Cursor pagination (after row)
.start(row, { inclusive: true })    // Include the cursor row
.one()                              // Single result (T | undefined)
```

**Relations:**
```tsx
.related("relation")                // Include related rows
.related("relation", q => q.where(...).orderBy(...).limit(...))
```

**Not supported:**
```tsx
.where("field", null)               // Use "IS" operator instead
// Column projection - always returns full row
// orderBy/limit in junction (many-to-many) relations
```

## Query Pattern

```tsx
// queries/{entity}.ts
import { defineQuery } from "@rocicorp/zero";
import { z } from "@package/common";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

// No args
export const list = defineQuery(() => zql.entity);

// With args + multiple where
export const byNameAndType = defineQuery(
  z.object({ name: z.string(), type: z.string() }),
  ({ args }) => zql.entity
    .where("name", args.name)
    .where("type", args.type)
);

// With relations
export const withRelated = defineQuery(
  z.object({ id: z.string() }),
  ({ args }) => zql.entity
    .where("id", args.id)
    .related("children", (q) => q.orderBy("createdAt", "desc"))
);

// With context (user-scoped)
export const mine = defineQuery(
  ({ ctx }) => zql.entity.where("userId", ctx.userID)
);

// Conditional where (build query dynamically)
export const search = defineQuery(
  z.object({ status: z.string().optional() }),
  ({ args }) => {
    let q = zql.entity;
    if (args.status) {
      q = q.where("status", args.status);
    }
    return q;
  }
);
```

## Mutator Pattern

```tsx
// mutators/{entity}.ts
import { defineMutator } from "@rocicorp/zero";
import { z } from "@package/common";
import { newRecord, now } from "./helpers.ts";

export const create = defineMutator(
  z.object({ name: z.string() }),
  async ({ tx, args }) => {
    const record = newRecord();
    await tx.mutate.entity.insert({
      id: record.id,
      name: args.name,
      createdAt: record.now,
      updatedAt: record.now,
    });
  }
);

export const update = defineMutator(
  z.object({ id: z.string(), name: z.string() }),
  async ({ tx, args }) => {
    await tx.mutate.entity.update({
      id: args.id,
      name: args.name,
      updatedAt: now(),  // Always include!
    });
  }
);

// Querying within a mutator (use tx.run with zql)
export const updateWithQuery = defineMutator(
  z.object({ id: z.string() }),
  async ({ tx, args }) => {
    const entity = await tx.run(zql.entity.one().where("id", "=", args.id));
    if (entity) {
      await tx.mutate.entity.update({
        id: args.id,
        count: entity.count + 1,
        updatedAt: now(),
      });
    }
  }
);
```

**Zero mutations are fire-and-forget:** Client-side `zero.mutate.*` calls are NOT promises. They apply locally immediately and sync in background:
```tsx
// ❌ WRONG: await has no effect
await zero.mutate.packages.upvote({ packageId });

// ✅ CORRECT: mutations are synchronous, no await needed
zero.mutate.packages.upvote({ packageId });
```

**Cross-table mutations:** To mutate table B from table A's mutator, register table B in mutators/index.ts (even with empty `{}`):
```tsx
export const mutators = defineMutators({
  tableA: { create: ... },
  tableB: {},  // Enables tx.mutate.tableB in tableA mutators
});
```

## Re-export in Index Files

```tsx
// queries/index.ts
import * as entityQueries from "./entity.ts";

export const queries = defineQueries({
  // ...existing
  entity: {
    list: entityQueries.list,
    byId: entityQueries.byId,
  },
});

// mutators/index.ts
import * as entityMutators from "./entity.ts";

export const mutators = defineMutators({
  // ...existing
  entity: {
    create: entityMutators.create,
    update: entityMutators.update,
  },
});
```

## Schema Conventions (`db/schema.ts`)

```tsx
// Regular tables: id + createdAt + updatedAt
export const entity = pgTable("entity", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

// Join tables: id + createdAt only (no updatedAt)
export const entityTags = pgTable("entity_tags", {
  id: uuid().primaryKey(),
  entityId: uuid().notNull().references(() => entity.id),
  tagId: uuid().notNull().references(() => tags.id),
  createdAt: timestamp().notNull(),
}, (table) => [unique().on(table.entityId, table.tagId)]);

// Immutable tables: id + createdAt only (never updated after creation)
// Example: channelDependencies - dependencies are recreated on update, not modified
export const channelDependencies = pgTable("channel_dependencies", {
  id: uuid().primaryKey(),
  channelId: uuid().notNull().references(() => packageReleaseChannels.id),
  dependencyPackageId: uuid().notNull().references(() => packages.id),
  createdAt: timestamp().notNull(),
  // No updatedAt - records are deleted and recreated on change
});
```

**Timestamp rules:**
- Regular tables: Always include `updatedAt` in mutations
- Join tables: Only `createdAt`, deleted not updated
- Immutable tables: Only `createdAt`, never update these records
- Upvote tables: Only `createdAt`, never update parent entity's `updatedAt` (upvotes shouldn't affect "Recently updated" lists)

## Suggestion Types (`suggestions/types/`)

Each suggestion type is a self-contained ~30-line definition with:
- Versioned Zod schemas for payload validation
- Display formatting (receives typed payload)
- Resolution logic (mutation when approved)
- Toast messages for frontend feedback

**Adding a new suggestion type:**

1. Add enum value to `db/schema/enums.ts`:
```tsx
export const suggestionTypeEnum = pgEnum("suggestion_type", [
  // ...existing
  "my_new_type",
]);
```

2. Create type definition in `suggestions/types/my-new-type.ts`:
```tsx
import { z } from "@package/common";
import { newRecord } from "../../mutators/helpers.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ someField: z.string() });

export const myNewType = defineSuggestionType({
  type: "my_new_type",
  label: "My new type",
  schemas: { 1: schema },  // Versioned for future evolution
  currentVersion: 1,

  toastMessages: {
    applied: "Change has been applied.",
    pending: "Your suggestion is now pending review.",
  },

  formatDescription: (payload, ctx) => payload.someField,
  formatAction: (payload) => `Do something with "${payload.someField}"`,

  resolve: async (tx, payload, ids) => {
    if (!ids.packageId) throw new Error("my_new_type requires packageId");
    const record = newRecord();
    await tx.mutate.someTable.insert({
      id: record.id,
      field: payload.someField,
      createdAt: record.now,
    });
  },
});
```

3. Export from `suggestions/types/index.ts`:
```tsx
import { myNewType } from "./my-new-type.ts";

export const suggestionTypes = {
  // ...existing
  my_new_type: myNewType,
} as const;
```

4. Use `useSuggestionSubmit` hook in frontend (see `services/frontend/CLAUDE.md`)

**Evolving a schema:** Add new version to `schemas` object, update `currentVersion`. Old suggestions use their stored version for parsing/resolution.

**Key patterns:**
- Schema can use `.transform()` to derive fields (e.g., `create_ecosystem` generates slug from name)
- Methods receive already-parsed typed payloads - no safeParse boilerplate
- Display formatting is colocated with the type - frontend just calls `formatSuggestionAction(type, payload, ctx)`

## After Changes

| Change | Commands |
|--------|----------|
| Query/Mutator only | None (just re-export) |
| Schema change | `pnpm database zero && pnpm database migrate` |

## Enums

Import from `db/types.ts`:
```tsx
import { enums } from "../db/types.ts";
z.enum(enums.registry)  // ["npm", "jsr", "nuget", "dockerhub", "homebrew", "archlinux"]
```

## User Data Tables (GDPR)

Tables containing user-specific data that must be included in GDPR data export:

| Table | Key Column | Description |
|-------|-----------|-------------|
| `account` | `id` | User account (primary) |
| `projects` | `accountId` | User's projects |
| `projectPackages` | via `projects` | Packages in user's projects |
| `packageUpvotes` | `accountId` | User's package upvotes |
| `suggestions` | `accountId` | User's curation suggestions |
| `suggestionVotes` | `accountId` | User's votes on suggestions |
| `contributionEvents` | `accountId` | User's contribution history |
| `contributionScores` | `accountId` | User's contribution scores |
| `notifications` | `accountId` | User's notifications |

**When adding new tables with `accountId`:** Update the GDPR export endpoint in `services/backend/index.ts`.
