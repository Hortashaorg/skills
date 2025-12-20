# Worker Service

Background job processor that fetches package metadata from registries.

## How It Works

Runs as a CronJob - processes up to 10 pending `packageRequests`, then exits.

```
1. Query pending requests (limit 10)
2. For each request:
   - Update status → "fetching"
   - Fetch from registry (npm)
   - Upsert package record
   - Create new versions + dependencies
   - Schedule requests for unknown dependencies
   - Link previously unlinked dependencies
   - Update status → "completed" or "failed"
3. Exit
```

**Error handling:** Failed requests retry up to 3 times, then marked "discarded".

## Registry Adapters

```
registries/
├── types.ts       # Common: PackageData, VersionData, DependencyData
└── npm/
    ├── client.ts  # HTTP fetch with retry (408/429/5xx)
    ├── schema.ts  # Zod validation for API responses
    ├── mapper.ts  # Transform npm → common format
    └── index.ts   # Export getPackages(names, concurrency)
```

**To add a new registry:** Use `/registry-adapter` skill.

## Database Operations

**Mutations** (`db/mutations.ts`):
| Function | Purpose |
|----------|---------|
| `upsertPackage()` | Create or update package metadata |
| `createVersion()` | Create version record (returns ID) |
| `createDependency()` | Link version to dependency |
| `createPendingRequest()` | Schedule package for processing |
| `linkDependencies()` | Link unlinked deps to new package |
| `updateRequestStatus()` | Set status + error message |

**Queries** (`db/queries.ts`):
| Function | Purpose |
|----------|---------|
| `findPackage()` | Get by name + registry |
| `findVersion()` | Get by packageId + version |
| `findActiveRequest()` | Check for pending/fetching request |
| `getExistingVersions()` | Get Set of existing version strings |

## Key Patterns

**Always include timestamps:**
```tsx
await db.update(packages).set({
  ...data,
  updatedAt: Date.now(),  // Required!
});
```

**Request scheduling:** Only create new request if:
- Package doesn't exist in database, AND
- No active request (pending/fetching) for same package

**Sequential processing:** Requests processed one-by-one to prevent race conditions.

**Dependency linking:** After creating a package, automatically links all previously-unlinked dependencies that reference it by name.
