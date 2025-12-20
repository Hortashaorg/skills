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

**Supported:**
```tsx
.where("field", value)              // Exact match
.where("field", "=", value)         // Explicit operator
.where("field", "!=", value)        // Not equal
.where("field", ">", value)         // Comparison operators: >, <, >=, <=
.where("field", "IS", null)         // NULL check
.where("field", "IS NOT", null)     // NOT NULL check
.where(...).where(...)              // Multiple conditions (AND)
.orderBy("field", "asc" | "desc")   // Sorting
.limit(n)                           // Limit results
.one()                              // Single result (returns T | undefined)
.related("relation")                // Include relations
.related("relation", q => q.where(...))  // Filter relations
```

**Not supported (filter client-side):**
```tsx
.where("field", "LIKE", "%foo%")    // Pattern matching
.where("field", "IN", [...])        // IN operator
.where("field", null)               // Use "IS" operator instead
```

## Query Pattern

```tsx
// queries/{entity}.ts
import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
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
import { z } from "zod";
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
// Example: packageVersions - versions are immutable once published
export const packageVersions = pgTable("package_versions", {
  id: uuid().primaryKey(),
  version: text().notNull(),
  createdAt: timestamp().notNull(),
  // No updatedAt - records never change
});
```

**Timestamp rules:**
- Regular tables: Always include `updatedAt` in mutations
- Join tables: Only `createdAt`, deleted not updated
- Immutable tables: Only `createdAt`, never update these records

## After Changes

| Change | Commands |
|--------|----------|
| Query/Mutator only | None (just re-export) |
| Schema change | `pnpm database zero && pnpm database migrate` |

## Enums

Import from `db/types.ts`:
```tsx
import { enums } from "../db/types.ts";
z.enum(enums.registry)  // ["npm", "jsr", "brew", "apt"]
```
