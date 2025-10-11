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

## Architecture

### Context Structure
- **Separate concerns**: Auth context is independent of Zero context
- **AuthProvider** (`context/auth-provider.tsx`) - Manages authentication state
- **ZeroWrapper** (`context/zero-wrapper.tsx`) - Wraps Rocicorp's ZeroProvider, reactively updates when auth changes
- **Hooks at top level** (`use-auth.ts`, `use-zero-instance.ts`) - Easy imports
- **Implementation details in subfolders** (`context/auth/`, `context/zero/`) - Colocated with consumers

### OAuth Flow
- Auto-detect `?code=` in URL and exchange for tokens on app load
- Use `/login` endpoint to exchange code, `/refresh` to restore sessions
- Always use `credentials: "include"` for cookie-based refresh tokens
- OAuth callback page (`/auth/callback`) auto-redirects to home after processing

### Using Auth and Zero in Components
```tsx
import { useAuth } from "@/context/use-auth";
import { useZeroInstance } from "@/context/use-zero-instance";
import { useQuery } from "@package/database/client";

const PostList = () => {
  const auth = useAuth();
  const zero = useZeroInstance();
  const userID = auth.authData()?.userId;

  const [posts] = useQuery(() =>
    zero.query.posts
      .where('authorId', userID)
      .related('comments')
  );

  return (
    <For each={posts()}>
      {(post) => <Post data={post} />}
    </For>
  );
};
```

## Component Architecture

Components follow a **flexibility-to-purpose spectrum**:

- **`primitives/`** - Layout & base elements (Flex, Grid, Stack, Text)
  - Maximum flexibility, minimal opinion
  - Use for one-off layouts
- **`ui/`** - Interactive components (Button, Input, Select, Dialog)
  - shadcn-inspired API
  - Accept `class` prop for composition, never override internally
- **`composite/`** - Convenient wrappers (IconButton, SearchInput)
  - Combine primitives/ui for common patterns
  - Create when pattern appears 3+ times
- **`feature/`** - Domain-specific (UserCard, ProductGrid)
  - Context-specific, less reusable
  - Enforce business logic and patterns

### Component Guidelines

- **Type-safe**: Props fully typed, use discriminated unions for variants
- **Accessible**: ARIA labels, keyboard navigation, focus management
- **Documented**: JSDoc comments explain usage and props
- **Composable**: Accept `class` for styling, children for content
- **CVA for variants**: Use `class-variance-authority` for size/color/state variants

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

/**
 * Button component with variant support
 * @example
 * <Button variant="outline" size="sm" onClick={() => alert('clicked')}>
 *   Click me
 * </Button>
 */
export const Button: Component<
  VariantProps<typeof buttonVariants> & { onClick?: () => void }
> = (props) => {
  return (
    <button
      class={buttonVariants({ variant: props.variant, size: props.size })}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
```

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
