# Worker Service

Background job processor that fetches package metadata from registries.

## How It Works

Runs as a CronJob - processes up to 50 pending `packageFetches`, then exits.

```
1. Schedule fetches for placeholder packages without pending fetches
2. Query pending fetches (limit 50)
3. For each fetch:
   - Check cooldown (skip if recently updated)
   - Fetch from registry (npm)
   - Upsert package record
   - Sync release channels (diff-based: insert/update/delete)
   - Sync channel dependencies (diff-based)
   - Batch create placeholder packages for missing dependencies
   - Mark fetch as completed or failed
4. Exit
```

**Two-step flow:** Scheduler creates fetches for placeholders, processor handles fetching. Placeholders get fetches on next run.

## Registry Adapters

```
registries/
├── types.ts       # Common: PackageData, ReleaseChannelData, DependencyData
└── npm/
    ├── client.ts  # HTTP fetch with retry (408/429/5xx)
    ├── schema.ts  # Zod validation for API responses
    ├── mapper.ts  # Transform npm → common format (dist-tags → channels)
    └── index.ts   # Export getPackages(names)
```

**To add a new registry:** Use `/registry-adapter` skill.

## Database Operations (`db.ts`)

**Package Operations:**
| Function | Purpose |
|----------|---------|
| `findPackage()` | Get by name + registry |
| `loadPackageNames()` | Load all package names for registry into Map |
| `upsertPackage()` | Create or update package metadata |
| `bulkCreatePlaceholders()` | Batch create placeholders, returns name → id map |
| `markPackageFailed()` | Mark package as failed with reason |

**Fetch Operations:**
| Function | Purpose |
|----------|---------|
| `markFetchCompleted()` | Mark fetch as completed |
| `markFetchFailed()` | Mark fetch as failed with error |
| `bulkInsertPendingFetches()` | Batch insert pending fetches |

**Release Channel Operations:**
| Function | Purpose |
|----------|---------|
| `getExistingChannels()` | Get current channels for diff |
| `insertReleaseChannel()` | Create new channel |
| `updateReleaseChannel()` | Update channel version |
| `deleteReleaseChannels()` | Remove stale channels |
| `getExistingDependencies()` | Get current deps for diff |
| `insertChannelDependencies()` | Add new dependencies |
| `deleteChannelDependencies()` | Remove stale dependencies |

## Key Patterns

**Diff-based updates:** Channels and dependencies use diff logic to minimize WAL writes:
1. Fetch existing records
2. Compare with new data
3. Only insert/update/delete what changed

**Batch placeholder creation:** Missing dependencies are collected across all channels, then created in a single batch insert with `ON CONFLICT DO NOTHING`.

**Package status:**
- `active` - Successfully fetched
- `failed` - Fetch failed (404, rate limited, etc.)
- `placeholder` - Created as dependency reference, not yet fetched

**Sequential processing:** Fetches processed one-by-one to prevent race conditions.
