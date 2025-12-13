# SolidJS Component Generator

An interactive Claude Code skill for generating fully-functional SolidJS components following your project's architecture patterns.

## Overview

This skill guides you through creating production-ready components with:
- ✅ Full TypeScript type safety
- ✅ Kobalte accessibility primitives integration
- ✅ CVA (class-variance-authority) variants
- ✅ Comprehensive Storybook stories
- ✅ Complete Vitest test coverage
- ✅ Tailwind 4 styling

## Quick Start

Simply start a conversation with Claude Code and say:

```
Create a [ComponentName] component
```

The agent will guide you through an interactive conversation to gather requirements and generate all necessary files.

## What Gets Generated

For each component, the agent creates 4 files:

```
/skills/services/frontend/src/components/{tier}/{component-name}/
├── index.ts              # Barrel export
├── {component-name}.tsx   # Component implementation
├── {component-name}.stories.tsx  # Storybook documentation
└── {component-name}.test.tsx     # Unit tests
```

## Example Usage

### Creating a Badge Component

```
You: Create a Badge component

Agent: I'll help you create a Badge component! Which tier should this component be in?
- ui (interactive, styled components)
- composite (combination of ui components)
- feature (domain-specific components)
- primitives (layout & base elements)

You: ui

Agent: Great! What's the purpose of this Badge component?

You: A small label for displaying status, counts, or categories

Agent: Based on your description, I don't see a direct Kobalte primitive match. 
Would you like to use plain HTML with Tailwind styling?

You: Yes

Agent: Perfect! What color variants would you like?
Suggested: primary, secondary, success, danger, warning

You: Use the suggestions

Agent: What size variants?
Suggested: sm, md, lg

You: Just sm and md

Agent: Any additional props or behavior?

You: No, keep it simple

Agent: Excellent! Here's what I'll create:

**Badge Component Summary:**
- Tier: ui
- Base: Plain HTML (span)
- Variants:
  - Color: primary, secondary, success, danger, warning
  - Size: sm, md
- Files: 4 (component, index, stories, tests)

Shall I generate the component?

You: Yes

Agent: ✅ Generated Badge component successfully!

**Import usage:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" size="sm">New</Badge>
```

**Next steps:**
1. Review the generated component
2. Run `pnpm test` to verify tests pass
3. Run `pnpm storybook` to preview in Storybook
4. Customize styling/behavior as needed
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

### `composite/`
Convenient wrappers combining ui components for common patterns.
- Examples: IconButton, SearchInput, ColorPicker
- Pattern: Composition of ui components with preset configurations

### `feature/`
Domain-specific components enforcing business logic.
- Examples: UserCard, ProductGrid, OrderSummary
- Pattern: Feature-specific logic with ui/composite components

## Kobalte Primitives

The agent has access to 30 Kobalte primitives and will intelligently suggest the best match based on your component description:

**Forms:** button, checkbox, radio-group, select, combobox, switch, slider, text-field

**Overlays:** dialog, popover, tooltip, hover-card, context-menu, dropdown-menu, alert-dialog

**Navigation:** tabs, accordion, breadcrumbs, navigation-menu

**Feedback:** progress, alert

**Layout:** separator, collapsible

**And more:** link, image, toggle-button, menubar, pagination, toggle-group, toolbar

## Patterns

### Simple Component (Button-like)
- Single Kobalte primitive
- CVA variants for colors/sizes
- Type-safe props from primitive + CVA
- Example: Button, Badge, Link

### Composite Component (TextField-like)
- Multiple sub-components (Root, Input, Label, etc.)
- Namespace exports
- Complex prop types with polymorphism
- Example: TextField, Select, Dialog

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

### Comprehensive Testing
Generated tests cover:
- Rendering children
- Default variant application
- All color variants
- All size variants
- Custom class composition
- Interaction handlers (when applicable)

### Complete Stories
Generated Storybook stories include:
- Individual story per variant
- Individual story per size
- Combined showcase story (AllVariants)
- Interactive controls (argTypes)
- Auto-generated documentation

## Validation

The agent performs validation at multiple stages:

**Pre-Generation:**
- Component name conflicts
- Tier directory existence
- Valid Kobalte primitive selection

**Post-Generation:**
- TypeScript compilation check
- Import resolution verification
- Atomic file writes (all or none)

## Files Structure

```
/skills/.claude/skills/component-generator/
├── README.md                          # This file
├── agent.md                           # Agent system prompt
├── kobalte-primitives.json            # Catalog of 30 primitives
└── templates/
    ├── simple-component.tsx.template  # Simple pattern
    ├── primitive-component.tsx.template # Primitive pattern
    ├── index.ts.template              # Barrel export
    ├── stories.tsx.template           # Storybook stories
    └── test.tsx.template              # Vitest tests
```

## Customization

After generation, you can customize:
- Tailwind classes in the CVA config
- Add more variants
- Extend props with additional functionality
- Modify stories for different use cases
- Add more comprehensive tests

## Tips

1. **Be specific in descriptions** - Helps the agent suggest the right Kobalte primitive
2. **Start simple** - You can always extend the component later
3. **Review before confirming** - The agent shows a summary before generating
4. **Test immediately** - Run `pnpm test` right after generation
5. **Preview in Storybook** - Verify visual appearance with `pnpm storybook`

## Troubleshooting

### Component already exists
The agent will detect conflicts and offer to:
- Choose a different name
- Overwrite existing component
- Cancel operation

### TypeScript errors
If generated code has errors, the agent will:
- Show the error message
- Offer to regenerate with fixes
- Let you see the code for manual fixes
- Not write files until valid

### Missing Kobalte primitive
If you describe a component that doesn't match any primitive, the agent will:
- Suggest using plain HTML
- Allow you to manually specify a primitive
- Fall back to the primitive pattern

## Demo Component

A working **Badge** component has been generated as an example at:
```
/skills/services/frontend/src/components/ui/badge/
```

Run the tests to see it in action:
```bash
cd /skills/services/frontend
pnpm test badge.test.tsx
```

## Next Steps

The agent is ready to use! Start creating components by simply saying:
```
Create a [YourComponent] component
```

Happy component building! 🎨
