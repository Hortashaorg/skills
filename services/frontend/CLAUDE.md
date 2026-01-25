# Frontend Service

SolidJS application with Zero for real-time sync.

## Page Structure

Pages use folder-per-page pattern with sections:

```
routes/
├── home/
│   ├── index.tsx           # State + composition (lowercase)
│   └── sections/
│       ├── SearchBar.tsx   # PascalCase components
│       ├── ResultsGrid.tsx
│       └── EntityFilter.tsx
└── package/
    ├── index.tsx
    └── sections/           # UI sections of the page
        ├── Header.tsx
        ├── ChannelSelector.tsx
        └── Dependencies.tsx
```

**Conventions:**
- `index.tsx` - lowercase (module entry), holds state (signals), composes sections
- Sections - PascalCase, receive props from parent, can make own Zero queries
- Components - PascalCase, page-specific reusables (use `components/ui/` for cross-page)

## Zero Queries in Sections

Zero queries share a local SQLite cache. Same query in multiple components stays in sync automatically:

```tsx
// In Dependencies.tsx section - makes its own query
const [dependencies] = useQuery(() =>
  queries.channelDependencies.byChannelId({ channelId: props.channelId })
);
```

No need to prop-drill query results - sections can query independently.

## Query Loading States

Zero's `useQuery` returns a tuple: `[data, result]`. Use `result().type` for loading/complete states:

```tsx
// result.type values:
// - "unknown"  = local data only, server not confirmed
// - "complete" = server has responded, data is authoritative
// - "error"    = query failed
```

**Recommended pattern - use result.type:**
```tsx
const [pkg, pkgResult] = useQuery(() => queries.packages.byNameWithChannels({ name, registry }));

// Loading: not yet complete
const isLoading = () => pkgResult().type !== "complete";

// Empty: no data AND confirmed from server (avoids 404 flicker)
const isEmpty = () => !pkg() && pkgResult().type === "complete";
```

**Single-query pages - use QueryBoundary:**
```tsx
import { QueryBoundary } from "@/components/composite/query-boundary";

const [pkg, pkgResult] = useQuery(() => queries.packages.byNameWithChannels({ name, registry }));

<QueryBoundary
  data={pkg()}
  isLoading={pkgResult().type !== "complete"}
  hasData={!!pkg()}
  emptyFallback={<NotFound />}
>
  {(p) => <PackageDetails pkg={p} />}
</QueryBoundary>
```

**Multi-query pages:**
```tsx
const [dataA, resultA] = useQuery(() => queries.a());
const [dataB, resultB] = useQuery(() => queries.b());

const isLoading = () =>
  resultA().type !== "complete" || resultB().type !== "complete";
```

**When to use which:**
- `QueryBoundary` = Primary data with empty state handling (package detail, search results)
- `<Show>` = Multiple queries feeding one UI, no distinct empty state needed

## Components

**CRITICAL: Components are purely presentational.**
- ✅ Accept props, render UI, emit events via callbacks
- ✅ Stories render with mock data (no Zero/auth needed)
- ❌ NO imports from `@package/database` - move to hooks

Pattern: `useHook` (data/logic) + `Component` (presentation)
```tsx
const addToProject = useAddToProject(() => ({ entityType: "package", entityId }));
<AddToProjectPopover projects={addToProject.projects()} onAdd={addToProject.onAdd} />
```

## Icons

Use named icon components from `@/components/primitives/icon`:

```tsx
import { ChevronDownIcon, SearchIcon, PlusIcon } from "@/components/primitives/icon";

<ChevronDownIcon size="sm" />
<SearchIcon size="md" title="Search" />
```

Available icons: `ArrowUpIcon`, `BellIcon`, `CheckIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `DocumentIcon`, `ExternalLinkIcon`, `FolderIcon`, `MenuIcon`, `MoonIcon`, `PackageIcon`, `PencilIcon`, `PlusIcon`, `SearchIcon`, `SettingsIcon`, `SpinnerIcon`, `SunIcon`, `TrashIcon`, `TrophyIcon`, `UserIcon`, `UsersIcon`, `XCircleIcon`, `XIcon`

**Adding new icons:**
1. Add to `components/primitives/icon/icons.tsx`
2. Follow the pattern: wrap `<Icon>` with SVG path children
3. Export from the index file

## Breadcrumbs

Breadcrumbs are defined in `lib/breadcrumbs.ts`. **Update when adding new routes.**

```tsx
// Pattern with optional suffix (for tabbed pages)
{ pattern: /^\/package\/([^/]+)\/([^/]+)(\/.*)?$/, segments: [...] }

// Dynamic labels from params
{ label: (p) => decodeURIComponent(p.name ?? "") }

// With resolver for Zero queries (tag/package/project names)
{ label: (p) => p.id ?? "", resolve: { type: "project", param: "id" } }
```

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Module entry | lowercase | `index.tsx` |
| Components | PascalCase | `SearchBar.tsx` |
| Utilities | kebab-case | `auth-url.ts` |
| Stories | PascalCase + suffix | `Button.stories.tsx` |

## Utilities & Hooks

```
lib/           # Pure utilities (stateless, no app context)
├── utils.ts   # cn() for class merging
├── url.ts     # buildPackageUrl()
└── registries.ts

hooks/         # Reusable business logic (uses Zero, auth, mutators)
└── createPackageUpvote.ts
```

**When to use which:**
- `lib/` = Pure functions, no dependencies on Zero/auth/context
- `hooks/` = Factory functions that use `useZero()`, mutators, or other app context

## Hook Reference

| Hook | Purpose |
|------|---------|
| `createUrlSignal(key, parse, serialize)` | Sync signal with URL query param |
| `createUrlStringSignal(key)` | URL param as string signal |
| `createUrlArraySignal(key)` | URL param as string array signal |
| `useInfiniteScroll(options)` | Pagination with auto-load sentinel |
| `useDarkMode()` | Theme toggle with localStorage |
| `createUpvote(entity, type)` | Generic upvote state and toggle |
| `createPackageUpvote(pkg)` | Package upvote (wrapper) |
| `createEcosystemUpvote(ecosystem)` | Ecosystem upvote (wrapper) |
| `createPackageRequest(options)` | Submit package request with loading |
| `createPolledValue(fetcher, interval)` | Poll REST endpoint periodically |
| `useSuggestionSubmit(options)` | Submit suggestions with auto toast |
| `useVote()` | Vote on suggestions (approve/reject) |
| `useAddToProject(options)` | Add entity to project (for popover) |
| `useModalState<T>()` | Modal open/close + optional data |

## Common Patterns

**Readonly props from Zero:**
```tsx
// Zero returns readonly arrays - use readonly in prop types
interface Props {
  channels: readonly ReleaseChannel[];  // Not ReleaseChannel[]
}
```

## SolidJS Reactivity Gotchas

```tsx
// ❌ Accessed outside reactive context - won't update
const greeting = `Hello ${name()}`;
// ✅ Wrap in function
const greeting = () => `Hello ${name()}`;

// ❌ Route params - won't update on navigation
const id = params.id;
// ✅ Create accessor
const id = () => params.id;

// ❌ Effect to sync derived state
createEffect(() => setDoubled(count() * 2));
// ✅ Derive directly
const doubled = () => count() * 2;
```

## UX Considerations

- Mobile: Touch targets min 44px, adapt layout (don't just squish)
- Grouping: Related actions together, obvious hierarchy
- Flows: First-time user friendly, minimal steps, important info visible

When in doubt about UX decisions, ask the user.

## Component Discipline

**Before writing any component code:**
1. **Study existing implementations first** - Read 2-3 similar components to understand patterns
2. Check if a component already exists in `components/ui/` or `components/composite/`
3. If similar functionality exists, extend it rather than duplicating
4. If you need variants, add to the existing component's CVA variants

**After creating/modifying components:**
1. Stories are REQUIRED - every component needs `{name}.stories.tsx`
2. Run `pnpm frontend test` to verify all visual tests pass (MANDATORY)
3. If props changed, check all usages still work

**Warning signs you're doing it wrong:**
- Component imports from `@package/database` - move to a hook
- Stories fail or don't exist - component is incomplete
- Copying JSX from an existing component instead of importing it
- Adding one-off styles that duplicate what a component provides
