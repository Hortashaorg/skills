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
│       └── RequestForm.tsx
└── package/
    ├── index.tsx
    ├── sections/           # UI sections of the page
    │   ├── Header.tsx
    │   └── Dependencies.tsx
    └── components/         # Page-specific reusable components
        └── DependencyItem.tsx
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
  queries.packageDependencies.byVersionId({ versionId: props.versionId })
);
```

No need to prop-drill query results - sections can query independently.

## Component Tiers

```
components/
├── primitives/   # Layout: Flex, Stack, Text, Container
├── ui/           # Interactive: Button, Card, Badge, Select, Tabs
├── composite/    # Combined: SearchInput, IconButton
└── feature/      # Domain-specific: (rare)
```

Import pattern: `import { Button } from "@/components/ui/button"`

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Module entry | lowercase | `index.tsx` |
| Components | PascalCase | `SearchBar.tsx` |
| Utilities | kebab-case | `auth-url.ts` |
| Stories | PascalCase + suffix | `Button.stories.tsx` |

## Common Patterns

**URL params with scoped packages:**
```tsx
// Building URLs (handles @scope/pkg)
href={`/package/${encodeURIComponent(registry)}/${encodeURIComponent(name)}`}

// Reading params
const params = useParams<{ registry: string; name: string }>();
const name = () => decodeURIComponent(params.name);
```

**Check auth state:**
```tsx
const zero = useZero();
if (zero().userID === "anon") {
  // Not logged in
}
```

**Readonly props from Zero:**
```tsx
// Zero returns readonly arrays - use readonly in prop types
interface Props {
  versions: readonly PackageVersion[];  // Not PackageVersion[]
}
```

## SolidJS Reactivity

### Signals Must Be Called in Reactive Contexts

```tsx
// ❌ BAD: Accessed outside reactive context - runs once, never updates
const name = signal();
const greeting = `Hello ${name()}`;

// ✅ GOOD: Wrap in function or memo
const greeting = () => `Hello ${name()}`;
const greeting = createMemo(() => `Hello ${name()}`);
```

### Route Params Need Reactive Accessors

```tsx
const params = useParams<{ id: string }>();

// ❌ BAD: Won't update on navigation
const id = params.id;

// ✅ GOOD: Create reactive accessor
const id = () => params.id;
```

### Effect Dependencies with `on()`

When using `on()` to control effect dependencies, list ALL reactive values used inside:

```tsx
// ❌ BAD: Uses sortedVersions() but doesn't track it
createEffect(
  on([pkg, urlVersion], ([p, urlV]) => {
    const versions = sortedVersions(); // Not tracked!
  })
);

// ✅ GOOD: All dependencies explicit
createEffect(
  on([pkg, urlVersion, sortedVersions], ([p, urlV, versions]) => {
    // versions is now tracked
  })
);
```

### Use Signals for State in Effects

```tsx
// ❌ BAD: Plain variable in effect - breaks reactivity model
let lastKey = "";
createEffect(() => {
  if (key() !== lastKey) {
    lastKey = key();
  }
});

// ✅ GOOD: Use signal for state
const [lastKey, setLastKey] = createSignal("");
createEffect(() => {
  if (key() !== lastKey()) {
    setLastKey(key());
  }
});
```

### Prefer Derived Signals Over Memos

```tsx
// For simple derivations - no caching overhead
const doubled = () => count() * 2;

// Use createMemo only for expensive computations or multiple subscribers
const filtered = createMemo(() =>
  items().filter(expensiveCheck)
);
```

### Don't Use Effects for Derived State

```tsx
// ❌ BAD: Effect to sync derived state
const [doubled, setDoubled] = createSignal(0);
createEffect(() => setDoubled(count() * 2));

// ✅ GOOD: Derive directly
const doubled = () => count() * 2;
```
