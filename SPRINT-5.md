# Sprint 5: Search & Discovery UX

> **Theme:** Make package search intuitive and let users work with packages immediately after requesting.

**User Feedback:**
- Exact package names don't appear at top of search results
- After requesting a package, can't find it or add it to projects
- Frustrating gap between "requested" and "available"

---

## Search Improvements

### Include Placeholder Packages in Results
Currently `search` query only returns `status: "active"`. Placeholders are invisible.

- [ ] Modify `queries.packages.search` to include `status IN ("active", "placeholder")`
- [ ] Add `status` field to search result data for UI differentiation
- [ ] Update SearchInput results to show "Pending" badge for placeholders
- [ ] Verify placeholders can be added to projects (should work - just needs packageId)

### Exact Match Prioritization
Search sorts by `upvoteCount DESC, name ASC`. Exact matches should come first.

- [ ] Add exact match detection in search query or results processing
- [ ] Sort order: 1) Exact name match, 2) upvoteCount DESC, 3) name ASC
- [ ] Works for both active and placeholder packages

---

## Request Flow Improvements

### Inline Package Request
When searching yields no exact match, offer to request it directly.

- [ ] Detect when search query doesn't match any existing package name exactly
- [ ] Show "Request '{query}' from npm?" option in dropdown
- [ ] On select: call `requestPackage` mutator → creates placeholder + pending fetch
- [ ] New placeholder immediately appears in search results
- [ ] User can add to project right away

### Visual Feedback for Pending Packages

- [ ] "Pending" badge on placeholder packages in search results
- [ ] "Pending" indicator in project package lists
- [ ] Tooltip: "This package is being fetched from the registry"
- [ ] Reactive update when worker completes (placeholder → active)

---

## Technical Notes

### Current Flow
```
User requests → Placeholder (status: "placeholder") + Fetch (status: "pending")
                          ↓
              Worker processes fetch
                          ↓
              Package updated (status: "active") + metadata populated
```

### Search Query Change
```typescript
// Before
let q = zql.packages.where("status", "active");

// After
let q = zql.packages.where("status", "IN", ["active", "placeholder"]);
```

### Exact Match Prioritization Options

**Option A: Client-side sort (simpler)**
```typescript
const sorted = results.sort((a, b) => {
  const aExact = a.name.toLowerCase() === query.toLowerCase();
  const bExact = b.name.toLowerCase() === query.toLowerCase();
  if (aExact && !bExact) return -1;
  if (!aExact && bExact) return 1;
  return 0; // preserve existing order (upvoteCount)
});
```

**Option B: Database-level (if ZQL supports CASE)**
```sql
ORDER BY
  CASE WHEN LOWER(name) = LOWER(:query) THEN 0 ELSE 1 END,
  upvote_count DESC,
  name ASC
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `packages/database/queries/packages.ts` | Include placeholders in search, add status to results |
| `services/frontend/src/components/composite/search-input/` | Show pending badge, request option |
| `services/frontend/src/routes/me/projects/detail.tsx` | Handle placeholder selection, show pending state |
| `packages/database/queries/packages.ts` (search) | Exact match prioritization |

---

## Out of Scope

- Failed package handling in search (show retry option?)
- Search relevance beyond exact match (fuzzy matching, typo tolerance)
- Registry-specific request flows (JSR, etc.)

---

## Success Criteria

1. Typing exact package name shows it first in results
2. Requesting a new package makes it immediately searchable
3. Can add placeholder packages to projects
4. Clear visual distinction between active and pending packages
5. Smooth transition when worker completes fetch
