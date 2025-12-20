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

## Query Pattern

```tsx
// queries/{entity}.ts
import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

// No args
export const list = defineQuery(() => zql.entity);

// With args
export const byId = defineQuery(
  z.object({ id: z.string() }),
  ({ args }) => zql.entity.where("id", args.id)
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
// Tables always have: id, createdAt, updatedAt (except join tables)
export const entity = pgTable("entity", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  // ... fields
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

// Join tables: id + createdAt only
export const entityTags = pgTable("entity_tags", {
  id: uuid().primaryKey(),
  entityId: uuid().notNull().references(() => entity.id),
  tagId: uuid().notNull().references(() => tags.id),
  createdAt: timestamp().notNull(),
}, (table) => [unique().on(table.entityId, table.tagId)]);

// Relations
export const entityRelations = relations(entity, ({ many }) => ({
  tags: many(entityTags),
}));
```

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
