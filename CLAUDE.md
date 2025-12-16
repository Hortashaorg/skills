# Project Context

## Tech Stack
- **SolidJS** - Reactive UI framework
- **@rocicorp/zero** - Real-time sync and data management
- **@solidjs/router** - Client-side routing
- **OAuth2** - Authentication with refresh tokens

## Workspace Structure

Monorepo using npm workspaces:

- `packages/database` - Shared database schema, types, and client exports
  - Import as: `@package/database/client` or `@package/database/server`
- `packages/common` - Shared utilities
  - Import as: `@package/common`
- `services/frontend` - SolidJS application
  - Internal imports use `@/` alias (e.g., `@/context/use-auth`)
- `services/backend` - Hono API server

## Useful Commands

**Check code quality**:
- `pnpm check` - Run Biome linter and formatter with auto-fix
- `pnpm all typecheck` - Run TypeScript type checking across all workspaces

**Development**:
- `pnpm frontend dev` - Start frontend dev server
- `pnpm backend dev` - Start backend dev server
- `pnpm database generate` - Generate Zero schema from Drizzle

**Workspace commands**:
- `pnpm all <command>` - Run command in all workspaces (parallel)
- `pnpm frontend <command>` - Run command in frontend only
- `pnpm backend <command>` - Run command in backend only
- `pnpm database <command>` - Run command in database package only

## Architecture

### Auth & Zero Integration

**Single Provider Pattern** (`context/app-provider.tsx`):
- `AppProvider` wraps entire app - combines auth state + ZeroProvider
- Initializes on mount: OAuth code exchange or refresh token restore
- ZeroProvider props are reactive - updates when auth changes
- `ConnectionStatus` nested inside monitors Zero connection state

**Auth API** (`context/auth/auth-api.ts`):
- `authApi.login(code)` - Exchange OAuth code for tokens
- `authApi.refresh()` - Restore session from httpOnly cookie
- `authApi.logout()` - Clear refresh token cookie

**Exported utilities**:
- `logout()` - Call API + update state (use instead of authApi.logout directly)
- Backend stores refresh token in httpOnly cookie (6 months)
- Frontend stores access token in memory (10 min expiry)

### OAuth Flow
- Auto-detect `?code=` in URL and exchange for tokens on app load
- Use `/login` endpoint to exchange code, `/refresh` to restore sessions
- Always use `credentials: "include"` for cookie-based refresh tokens
- Automatic token refresh when Zero fires `needs-auth` event (token expired)

### Checking Auth/Login State

**Check if user is logged in**:
```tsx
import { useZero } from "@package/database/client";

const MyComponent = () => {
  const zero = useZero();
  const userID = zero().userID; // "anon" = not logged in, otherwise actual userId

  if (userID === "anon") {
    return <LoginPrompt />;
  }

  return <AuthenticatedContent />;
};
```

**Check connection status**:
```tsx
import { useConnectionState } from "@package/database/client";

const MyComponent = () => {
  const connectionState = useConnectionState();

  // connectionState().name can be:
  // "connecting" - Initial connection attempt (up to 30s configured)
  // "connected" - Successfully connected
  // "disconnected" - Connection lost, retrying every 5s
  // "error" - Unrecoverable error
  // "needs-auth" - Token expired (handled automatically by ConnectionStatus)

  if (connectionState().name === "disconnected") {
    return <div>Offline mode - changes will sync when reconnected</div>;
  }

  return <NormalContent />;
};
```

**Important**: `needs-auth` is handled automatically by `ConnectionStatus` - it refreshes the token and reconnects. You typically don't need to handle it manually.

### Zero 0.25 Data Layer (Queries & Mutations)

**Define queries server-side** (`packages/database/queries.ts`):
```tsx
import { defineQuery, defineQueries } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "./zero-schema.gen.ts";

const myPosts = defineQuery(({ ctx: { userID } }) =>
  zql.posts.where('authorId', userID).related('comments')
);

const postById = defineQuery(
  z.object({ id: z.string() }),
  ({ args: { id } }) => zql.posts.where('id', id)
);

export const queries = defineQueries({
  posts: { myPosts, postById },
});
```

**Use queries in components** (frontend):
```tsx
import { queries, useQuery } from "@package/database/client";

const PostList = () => {
  const [posts] = useQuery(queries.posts.myPosts);
  // Or with args: useQuery(() => queries.posts.postById({ id: "123" }))

  return <For each={posts()}>{(post) => <Post data={post} />}</For>;
};
```

**Backend handlers** (follow official Zero 0.25 pattern):
```tsx
// query.ts
export async function handleQuery(c: Context) {
  const userID = await getUserID(c);
  const ctx = { userID };
  return handleQueryRequest(
    (name, args) => mustGetQuery(queries, name).fn({ args, ctx }),
    schema,
    c.req.raw
  );
}

// mutate.ts
export async function handleMutate(c: Context) {
  const userID = await getUserID(c);
  const ctx = { userID };
  return handleMutateRequest(
    dbProvider,
    (transact) => transact((tx, name, args) =>
      mustGetMutator(mutators, name).fn({ tx, args, ctx })
    ),
    c.req.raw
  );
}
```

## Component Architecture

Components follow a **flexibility-to-purpose spectrum**:

- **`primitives/`** - Layout & base elements (Flex, Grid, Stack, Text)
  - Maximum flexibility, minimal opinion
  - Use for one-off layouts
- **`ui/`** - Interactive components (Button, Input, Select, Dialog)
  - Built with Kobalte headless primitives for accessibility
  - Styled with Tailwind 4 (minimal CSS variables)
  - Accept `class` prop for composition, never override internally
- **`composite/`** - Convenient wrappers (IconButton, SearchInput)
  - Combine primitives/ui for common patterns
  - Create when pattern appears 3+ times
- **`feature/`** - Domain-specific (UserCard, ProductGrid)
  - Context-specific, less reusable
  - Enforce business logic and patterns

### Component Structure

Components are organized in **folders with colocated files**:

```
components/ui/button/
├── index.ts              # Export barrel
├── button.tsx            # Component implementation
├── button.stories.tsx    # Storybook stories
└── button.test.tsx       # Vitest tests
```

Import from folder: `import { Button } from "@/components/ui/button"`

### Component Guidelines

- **Type-safe**: Props fully typed, use discriminated unions for variants
- **Accessible**: Built on Kobalte primitives with ARIA, keyboard nav, focus management
- **Documented**: JSDoc comments explain usage and props
- **Tested**: Unit tests for logic, Storybook tests for visual/interaction
- **Composable**: Accept `class` for styling, children for content
- **CVA for variants**: Use `class-variance-authority` for size/color/state variants
- **Tailwind styling**: Direct utility classes, avoid excessive CSS variables

```tsx
// button.tsx - Component implementation with Kobalte + CVA
import * as ButtonPrimitive from "@kobalte/core/button";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-white hover:bg-zinc-800",
        outline: "border border-zinc-300 hover:bg-zinc-100",
      },
      size: { default: "h-10 px-4", sm: "h-9 px-3" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export const Button = (props) => {
  const [local, others] = splitProps(props, ["variant", "size", "class"]);
  return (
    <ButtonPrimitive.Root
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  );
};
```

## Storybook & Testing

**Purpose**: Document, test, and verify component behavior

### Storybook Stories

Stories are **colocated** with components for discoverability:

```tsx
// button.stories.tsx - Visual documentation and interaction testing
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Click me" } };
export const Outline: Story = { args: { variant: "outline", children: "Outline" } };
```

**Story guidelines**:
- Use CSF3 format with `satisfies Meta<typeof Component>`
- One story per variant/state combination
- Include all interactive controls via `argTypes`
- Tag with `"autodocs"` for auto-generated documentation
- Stories test visual appearance and user interaction

### Unit Tests

Tests verify component **logic and behavior**:

```tsx
// button.test.tsx - Unit tests for component behavior
import { render } from "@solidjs/testing-library";
import { Button } from "./button";

test("renders children", () => {
  const { getByText } = render(() => <Button>Click me</Button>);
  expect(getByText("Click me")).toBeInTheDocument();
});

test("applies variant classes", () => {
  const { container } = render(() => <Button variant="outline">Test</Button>);
  expect(container.querySelector("button")).toHaveClass("border");
});
```

**Test guidelines**:
- Test props/variants apply correctly
- Test click handlers and interactions
- Test accessibility (ARIA attributes, keyboard nav)
- Use `@solidjs/testing-library` for rendering
- Keep tests simple - Storybook handles visual regression

## Common Gotchas

### Mutators - Always Update Timestamps
```tsx
// ✅ Good - includes updatedAt
await tx.mutate.tech.update({
  id: args.id,
  name: args.name,
  updatedAt: Date.now(),  // Don't forget!
});

// ❌ Bad - missing updatedAt, data will be out of sync
await tx.mutate.tech.update({
  id: args.id,
  name: args.name,
});
```
**Why**: TypeScript enforces `createdAt`/`updatedAt` on inserts, but updates are manual. Always include `updatedAt: Date.now()` or data won't sync properly.

### Auth API Calls - Always Include Credentials
```tsx
// ✅ Good - includes credentials
await fetch(`${baseUrl}/refresh`, {
  credentials: "include",  // Required for cookies!
  // ...
});

// ❌ Bad - refresh token cookie won't be sent
await fetch(`${baseUrl}/refresh`, {
  // Missing credentials: "include"
});
```
**Why**: Refresh tokens are httpOnly cookies. Without `credentials: "include"`, cookies aren't sent/received.

### Backend Auth - Only 401 for Invalid Tokens
```tsx
// ✅ Good - no token = anonymous user
const token = c.req.header("Authorization")?.split(" ")[1];
if (!token) {
  return "anon";  // Not an error!
}

// ❌ Bad - returns 401 for missing token
if (!token) {
  return c.json({ error: "Unauthorized" }, 401);  // Triggers needs-auth incorrectly
}
```
**Why**: Missing token means anonymous user (valid). Only return 401 when token exists but is invalid/expired. This triggers Zero's `needs-auth` event correctly.

### Mutator Folder Structure - Re-export Everything
When adding new mutators to `mutators/`, remember to export in `mutators.ts`:
```tsx
// mutators.ts
import * as newMutators from "./mutators/new-table.ts";

export const mutators = defineMutators({
  // ...existing
  newTable: {
    create: newMutators.create,  // Don't forget to add!
  },
});
```
**Why**: Mutators in folders aren't automatically exported. Must manually re-export in main file.

### Zero Connection Status - Don't Block on needs-auth
```tsx
// ✅ Good - let ConnectionStatus handle it
if (connectionState().name === "disconnected") {
  return <OfflineBanner />;
}

// ❌ Bad - blocks user unnecessarily
if (connectionState().name === "needs-auth") {
  return <LoginScreen />;  // ConnectionStatus auto-refreshes!
}
```
**Why**: `needs-auth` is handled automatically by `ConnectionStatus` - it refreshes and reconnects. Don't block the UI.

## Contributing

- No comments in code unless explaining non-obvious behavior (components are the exception - use JSDoc)
- Colocate implementation details with their consumers
- Keep hooks at top level for easy importing
- Use workspace imports: `@package/*` for shared code, `@/*` for frontend internals
- Components: Start with `ui/`, move to `composite/` when patterns repeat, `feature/` for domain logic

### Contributing to CLAUDE.md

This document is a **compact reference for AI assistance** - not comprehensive documentation.

**When to update:**
- Patterns are established and repeated 3+ times
- Architecture decisions are made that affect multiple files
- You notice AI making the same mistake repeatedly

**What to include:**
- Core patterns with minimal but complete examples
- "Gotchas" that aren't obvious from code alone
- Import conventions and workspace structure

**What to avoid:**
- Implementation details (code is self-documenting)
- Repetition of obvious patterns
- Long explanations (prefer concise bullets)

**Goal:** Keep context under 150 lines. If adding, consider what to remove or condense.
