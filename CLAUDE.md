# Project Context

## Tech Stack
- **SolidJS** + **@solidjs/router** - Frontend
- **@rocicorp/zero** - Real-time sync
- **Hono** - Backend API
- **OAuth2** - Auth with refresh tokens

## Workspace Structure

| Package | Import Path | Purpose |
|---------|-------------|---------|
| `packages/database` | `@package/database/client` or `/server` | Schema, queries, Zero client |
| `packages/common` | `@package/common` | Shared utilities |
| `services/frontend` | `@/` alias | SolidJS app |
| `services/backend` | - | Hono API |
| `services/worker` | - | Background job processor |

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm check` | Biome lint + format |
| `pnpm all typecheck` | TypeScript all workspaces |
| `pnpm frontend dev` | Start frontend |
| `pnpm backend dev` | Start backend |
| `pnpm database zero` | Regenerate zero-schema.gen.ts |
| `pnpm database migrate` | Apply migrations |
| `pnpm frontend test` | Run Storybook tests |

## Zero Queries

```tsx
// Define: chain .where() for multiple conditions
const byNameAndRegistry = defineQuery(
  z.object({ name: z.string(), registry: z.enum(enums.registry) }),
  ({ args }) => zql.packages
    .where("name", args.name)
    .where("registry", args.registry)
    .related("versions")
);

// Use (frontend)
const [pkg] = useQuery(() => queries.packages.byNameAndRegistry({ name, registry }));
```

**ZQL supports:** `.where()` chaining, comparison operators, `IS NULL`, `.orderBy()`, `.limit()`, `.one()`, `.related()`

**Not supported:** `LIKE`, `IN` operator — filter client-side instead

## Auth Check

```tsx
const zero = useZero();
const isLoggedIn = zero().userID !== "anon";
```

## Component Tiers

| Tier | Purpose | Example |
|------|---------|---------|
| `primitives/` | Layout elements | Flex, Stack |
| `ui/` | Interactive (Kobalte + CVA) | Button, Tabs |
| `composite/` | Combined ui components | SearchInput |
| `feature/` | Domain-specific | Navbar |

## Gotchas

### Always include `updatedAt` in mutations
```tsx
await tx.mutate.table.update({ id, name, updatedAt: Date.now() }); // ✅
await tx.mutate.table.update({ id, name }); // ❌ won't sync
```

### Always `credentials: "include"` for auth
```tsx
fetch(url, { credentials: "include" }); // ✅ cookies sent
fetch(url); // ❌ refresh token missing
```

### No token = anonymous, not 401
```tsx
if (!token) return "anon"; // ✅ valid state
if (!token) return c.json({ error: "Unauthorized" }, 401); // ❌ breaks Zero
```

### Re-export new queries/mutators in index.ts
Files in `queries/` and `mutators/` folders need manual export in their index.ts.

### Run `pnpm database zero` after schema changes
Regenerates `zero-schema.gen.ts`. Never edit generated file directly.

### Don't block UI on `needs-auth`
`ConnectionStatus` handles token refresh automatically. Only handle `disconnected`.

### URL encode route params for scoped packages
```tsx
// Building URLs (handles @scope/pkg)
href={`/package/${encodeURIComponent(registry)}/${encodeURIComponent(name)}`}
// Reading params
const name = () => decodeURIComponent(params.name);
```

## Skills & References

| Resource | Purpose |
|----------|---------|
| `/component-generator` | Create UI components with Kobalte + CVA + stories |
| `/registry-adapter` | Add new package registry support to worker |
| `packages/database/CLAUDE.md` | Query/mutator patterns, timestamp helpers |

## Contributing

- No comments unless explaining non-obvious behavior
- Use workspace imports: `@package/*` for shared, `@/*` for frontend
- Components: Use `/component-generator` skill
- Registry adapters: Use `/registry-adapter` skill
- Queries/Mutators: See `packages/database/CLAUDE.md`
- After schema changes: `pnpm database zero` then `pnpm database migrate`
