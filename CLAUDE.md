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
