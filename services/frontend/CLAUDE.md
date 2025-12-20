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
