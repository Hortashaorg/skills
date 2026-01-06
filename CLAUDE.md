# Project Context

> **New here?** See [VISION.md](./VISION.md) for what we're building and why.

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
    .related("releaseChannels")
);

// Use (frontend) - destructure both data and result
const [pkg, pkgResult] = useQuery(() => queries.packages.byNameAndRegistry({ name, registry }));

// Loading state: result.type tells us query completion status
const isLoading = () => pkgResult().type !== "complete";
const isEmpty = () => pkg()?.length === 0 && pkgResult().type === "complete";
```

**ZQL supports:** `.where()` chaining, comparison operators, `IS NULL`, `LIKE`, `ILIKE`, `IN`, `.orderBy()`, `.limit()`, `.one()`, `.related()`, compound filters with `and/or/not`

**Not supported:** Column projection (always full row), `orderBy`/`limit` in junction relations

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

### Use `buildPackageUrl` for package links
```tsx
import { buildPackageUrl } from "@/lib/url";

// Building URLs (handles @scope/pkg encoding)
href={buildPackageUrl(registry, name)}
href={buildPackageUrl(registry, name, version)} // with version param

// Reading params
const name = () => decodeURIComponent(params.name);
```

## Architecture

**AppProvider** (`context/app-provider.tsx`) wraps the app with auth state + ZeroProvider. On mount: exchanges OAuth code or restores session via refresh token. ZeroProvider props are reactive - updates when auth changes.

**ConnectionStatus** monitors Zero connection and auto-refreshes tokens on `needs-auth` events.

## Skills & References

| Resource | Purpose |
|----------|---------|
| `/component-generator` | Create UI components with Kobalte + CVA + stories |
| `/registry-adapter` | Add new package registry support to worker |
| `packages/database/CLAUDE.md` | Query/mutator patterns, timestamp helpers |
| `services/frontend/CLAUDE.md` | Page structure, component tiers, Zero in sections |

## Contributing

- No comments unless explaining non-obvious behavior
- Use workspace imports: `@package/*` for shared, `@/*` for frontend
- Components: Use `/component-generator` skill
- Registry adapters: Use `/registry-adapter` skill
- Queries/Mutators: See `packages/database/CLAUDE.md`
- After schema changes: `pnpm database zero` then `pnpm database migrate`
