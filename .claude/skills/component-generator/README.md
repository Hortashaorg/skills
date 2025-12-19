# SolidJS Component Generator

An interactive Claude Code skill for generating fully-functional SolidJS components following your project's architecture patterns.

## Overview

This skill guides you through creating production-ready components with:
- ✅ Full TypeScript type safety
- ✅ Kobalte accessibility primitives integration
- ✅ CVA (class-variance-authority) variants
- ✅ Comprehensive Storybook stories with themed Light/Dark variants
- ✅ Testing via Storybook (no separate test files)
- ✅ Tailwind 4 styling with theme tokens
- ✅ Biome linting/formatting validation
- ✅ One component at a time with quality assurance

## Quick Start

Simply start a conversation with Claude Code and say:

```
Create a [ComponentName] component
```

The agent will guide you through an interactive conversation to gather requirements and generate all necessary files.

## What Gets Generated

For each component, the agent creates 3 files:

```
/skills/services/frontend/src/components/{tier}/{component-name}/
├── index.ts                       # Barrel export
├── {component-name}.tsx           # Component implementation
└── {component-name}.stories.tsx   # Storybook documentation & tests
```

**No separate test files** - Storybook stories serve as both documentation and automated tests with themed Light/Dark variants.

## Example Usage

### Creating a Badge Component

```
You: Create a Badge component

Agent: I'll help you create a Badge component! Which tier should this component be in?
- ui (interactive, styled components)
- composite (combination of ui components)
- feature (domain-specific presentational components)
- primitives (layout & base elements)

You: ui

Agent: Great! What's the purpose of this Badge component?

You: A small label for displaying status, counts, or categories

Agent: Based on your description, I don't see a direct Kobalte primitive match.
Would you like to use plain HTML with Tailwind styling?

You: Yes

Agent: Perfect! What color variants would you like?
Suggested: primary, secondary, info, success, warning, danger

You: Use the suggestions

Agent: What size variants?
Suggested: sm, md

You: Just sm and md

Agent: Any additional props or behavior?

You: No, keep it simple

Agent: Excellent! Here's what I'll create:

**Badge Component Summary:**
- Tier: ui
- Base: Plain HTML (span)
- Variants:
  - Color: primary, secondary, info, success, warning, danger
  - Size: sm, md
- Files: 3 (component, index, stories)
- Testing: Storybook stories with Light/Dark themes

Shall I generate the component?

You: Yes

Agent: [Generates files, validates with biome + typecheck, runs Storybook tests]

✅ Generated Badge component successfully!

**Validation:**
✅ Biome check passed
✅ TypeScript compiled
✅ 24 Storybook tests passing
✅ Coverage: 100%

**Import usage:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" size="sm">New</Badge>
```

**Next steps:**
1. Review the generated component
2. Run `pnpm storybook` to preview in Storybook
3. Customize styling/behavior as needed
```

## Component Tiers

### `primitives/`
Maximum flexibility, minimal opinion. Use for layout and base elements.
- Examples: Flex, Grid, Stack, Text
- Pattern: Simple HTML elements with utility classes

### `ui/`
Interactive components with Kobalte primitives for accessibility.
- Examples: Button, Input, Select, Dialog, Badge
- Pattern: Kobalte primitive + CVA variants + TypeScript types
- **NO backend communication or business logic**

### `composite/`
Convenient wrappers combining ui components for common patterns.
- Examples: IconButton, SearchInput, ColorPicker
- Pattern: Composition of ui components with preset configurations
- **NO backend communication or business logic**

### `feature/`
Domain-specific presentational components.
- Examples: Navbar, Footer, UserProfileCard
- Pattern: Domain-specific layouts using ui/composite components
- **NO backend communication or business logic**
- Feature components are presentational - business logic lives in pages/features

## Critical Constraints

**Components MUST:**
- ✅ Be purely presentational (accept props, render UI, emit events)
- ✅ Contain NO backend communication or API calls
- ✅ Contain NO business logic (business logic lives in pages)
- ✅ Use Kobalte primitives for accessibility where appropriate
- ✅ Support both light and dark themes
- ✅ Pass biome linting/formatting and TypeScript checking
- ✅ Have comprehensive Storybook stories

## Kobalte Primitives

The agent has access to 30 Kobalte primitives and will intelligently suggest the best match based on your component description:

**Forms:** button, checkbox, radio-group, select, combobox, switch, slider, text-field

**Overlays:** dialog, popover, tooltip, hover-card, context-menu, dropdown-menu, alert-dialog

**Navigation:** tabs, accordion, breadcrumbs, navigation-menu

**Feedback:** progress, alert, toast

**Layout:** separator, collapsible

**And more:** link, image, toggle-button, menubar, pagination, toggle-group, toolbar

## Patterns

### Simple Component (Button-like)
- Single Kobalte primitive
- CVA variants for colors/sizes
- Type-safe props from primitive + CVA
- Example: Button, Badge, Link

### Composite Component (SearchInput-like)
- Multiple sub-components (Root, Input, Label, etc.)
- Namespace exports or single component
- Complex prop types with polymorphism
- Example: SearchInput (uses Kobalte Combobox), TextField, Select

### Primitive Component (Label-like)
- Plain HTML element
- No Kobalte primitive
- Minimal Tailwind styling
- Example: Label, Separator (custom)

## Features

### Intelligent Primitive Matching
The agent uses semantic search to suggest Kobalte primitives:
- Exact name matching (100% confidence)
- Keyword matching (70% confidence)
- Description similarity (40% confidence)

### Type Safety with Clean DX
All generated components include:
- **Explicit common props** - children, class, common interactions show first in autocomplete
- **Accessibility props** - Typed explicitly to nudge users toward best practices
- **CVA variant types** - Extracted automatically from variant config
- **Clean autocomplete** - Only show props users commonly need
- **Props still pass through** - ARIA, data-*, events work via `{...others}` spread, just don't clutter autocomplete

**Type Pattern:**
```tsx
export type BadgeProps = {
  children?: JSX.Element;
  class?: string;
  role?: "status" | "note" | "mark";  // Accessibility guidance
  "aria-label"?: string;
} & VariantProps<typeof badgeVariants>;
// NO & Omit<JSX.HTMLAttributes<...>> - keeps autocomplete clean!
```

### Themed Story Pattern
All stories use the `createThemedStories` helper to test both light and dark modes:

```tsx
const primaryBase: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
};

const primaryThemed = createThemedStories({
	story: primaryBase,
	testMode: "both", // Test in both light and dark
});

export const PrimaryLight = primaryThemed.Light;
export const PrimaryDark = primaryThemed.Dark;
```

**testMode options:**
- `"both"` - Run tests in both light and dark (default)
- `"light"` - Test only in light mode
- `"dark"` - Test only in dark mode
- `"none"` - Visual-only, no tests

### Complete Stories & Testing
Generated Storybook stories include:
- Individual themed story pair per variant (Light/Dark)
- Individual themed story pair per size (Light/Dark)
- Combined showcase story (AllVariants with both themes)
- Interactive controls (argTypes)
- Interaction tests using play functions
- Auto-generated documentation
- **Serves as both documentation AND automated tests**

## Validation

The agent performs validation at multiple stages:

**Pre-Generation:**
- Component name conflicts
- Tier directory existence
- Valid Kobalte primitive selection

**Post-Generation:**
- Biome linting and formatting check
- TypeScript compilation check
- Storybook test execution
- Test coverage verification
- Atomic file writes (all or none)

**Quality Gate:**
Only proceeds to next component when:
- ✅ Biome check passes
- ✅ TypeScript compiles
- ✅ All Storybook tests pass
- ✅ Component has adequate coverage

## Files Structure

```
/skills/.claude/skills/component-generator/
├── README.md                          # This file
├── SKILL.md                           # Skill system prompt
├── kobalte-primitives.md              # Catalog of 30+ primitives
├── accessibility-guidelines.md        # Accessibility best practices
├── color-reference.md                 # Theme color token guide (REQUIRED)
├── themed-story-pattern.md            # Themed story documentation
└── templates/
    ├── component.tsx.template         # Reference pattern (not a fill-in template)
    ├── index.ts.template              # Barrel export pattern
    └── stories.tsx.template           # Storybook themed stories pattern
```

**How templates work:**
- Templates are **reference patterns**, not fill-in-the-blanks
- Agent reads Button.tsx as PRIMARY REFERENCE and follows that structure
- Agent reads reference guides (kobalte, accessibility, colors) BEFORE generating
- Templates show the decision tree and conditional logic, not placeholders

## Customization

After generation, you can customize:
- Tailwind classes in the CVA config
- Add more variants
- Extend props with additional functionality
- Modify stories for different use cases
- Add more interaction tests in stories

## Tips

1. **Be specific in descriptions** - Helps the agent suggest the right Kobalte primitive
2. **Start simple** - You can always extend the component later
3. **Review before confirming** - The agent shows a summary before generating
4. **Preview in Storybook** - Verify visual appearance and test both themes
5. **One at a time** - Let the agent complete and validate each component before moving to the next
6. **No workarounds** - Agent fixes errors properly, never uses type assertions or ignores

## Troubleshooting

### Component already exists
The agent will detect conflicts and offer to:
- Choose a different name
- Overwrite existing component
- Cancel operation

### Validation errors
If generated code has errors, the agent will:
- Show the error message
- Fix the actual issue (no workarounds)
- Re-run validation
- Repeat until clean

### Missing Kobalte primitive
If you describe a component that doesn't match any primitive, the agent will:
- Suggest using plain HTML
- Allow you to manually specify a primitive
- Fall back to the primitive pattern

## Reference Components

Working examples in the codebase:
- **Button** (`ui/button`) - Simple Kobalte component with CVA variants
- **Badge** (`ui/badge`) - Plain HTML with CVA variants
- **SearchInput** (`composite/search-input`) - Complex Kobalte Combobox
- **Toast** (`ui/toast`) - Kobalte Toast with utility functions

View these for pattern reference:
```bash
cd /skills/services/frontend/src/components
ls -la ui/button/
ls -la composite/search-input/
```

## Next Steps

The agent is ready to use! Start creating components by simply saying:
```
Create a [YourComponent] component
```

The agent will:
1. Guide you through interactive questions
2. Generate 3 files (component, index, stories)
3. Validate with biome + typecheck
4. Run Storybook tests
5. Ensure 100% coverage before proceeding

Happy component building! 🎨
