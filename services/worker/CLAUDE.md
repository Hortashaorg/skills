# Worker Service

Background job processor that fetches package metadata from registries.

## How It Works

Runs as a CronJob - processes up to 50 pending/failed `packageRequests`, then exits.

```
1. Query pending + failed requests (limit 50)
2. For each request:
   - Update status → "fetching"
   - Fetch from registry (npm)
   - Upsert package record with status
   - Sync release channels (diff-based: insert/update/delete)
   - Sync channel dependencies (diff-based)
   - Create placeholder packages for missing dependencies
   - Schedule requests for placeholder packages
   - Update status → "completed" or "failed"
3. Exit
```

**Error handling:** Failed requests retry up to 3 times, then marked "discarded".

## Registry Adapters

```
registries/
├── types.ts       # Common: PackageData, ReleaseChannelData, DependencyData
└── npm/
    ├── client.ts  # HTTP fetch with retry (408/429/5xx)
    ├── schema.ts  # Zod validation for API responses
    ├── mapper.ts  # Transform npm → common format (dist-tags → channels)
    └── index.ts   # Export getPackage(name)
```

**To add a new registry:** Use `/registry-adapter` skill.

## Database Operations

**Mutations** (`db/mutations.ts`):
| Function | Purpose |
|----------|---------|
| `upsertPackage()` | Create or update package metadata |
| `getOrCreatePlaceholder()` | Create placeholder for missing dependency |
| `markPackageFailed()` | Mark package as failed with reason |
| `createPendingRequest()` | Schedule package for processing |
| `updateRequestStatus()` | Set status + error message |

**Bulk Operations** (`db/bulk.ts`):
| Function | Purpose |
|----------|---------|
| `getExistingChannels()` | Get current channels for diff |
| `insertReleaseChannel()` | Create new channel |
| `updateReleaseChannel()` | Update channel version |
| `deleteReleaseChannels()` | Remove stale channels |
| `getExistingDependencies()` | Get current deps for diff |
| `insertChannelDependencies()` | Add new dependencies |
| `deleteChannelDependencies()` | Remove stale dependencies |

**Queries** (`db/queries.ts`):
| Function | Purpose |
|----------|---------|
| `findPackage()` | Get by name + registry |
| `findActiveRequest()` | Check for pending/fetching request |

## Key Patterns

**Always include timestamps:**
```tsx
await db.update(packages).set({
  ...data,
  updatedAt: Date.now(),  // Required!
});
```

**Diff-based updates:** Channels and dependencies use diff logic to minimize WAL writes:
1. Fetch existing records
2. Compare with new data
3. Only insert/update/delete what changed

**Placeholder packages:** When a dependency package doesn't exist:
1. Create placeholder with `status: "placeholder"`
2. Schedule a request to fetch it
3. Dependencies always link to a real package record

**Package status:**
- `active` - Successfully fetched
- `failed` - Fetch failed (404, rate limited, etc.)
- `placeholder` - Created as dependency reference, not yet fetched

**Sequential processing:** Requests processed one-by-one to prevent race conditions.
