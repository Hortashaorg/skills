# Sprint 5: Search & Discovery UX

> **Goal:** Make finding and adding packages frictionless.

**User Feedback:**
- Exact package names don't appear at top of search results
- After requesting a package, can't find it or add it to projects
- Popular packages drown out the one you're actually looking for
- Short/common package names impossible to find (e.g., "tai" buried under "tailwind*")

---

## Core Problem: Package Search Friction

Users struggle to find packages in these scenarios:

| Scenario | Example | Current Behavior |
|----------|---------|------------------|
| Exact name typed | "tailwindcss" | Drowns in "tailw*" results sorted by upvotes |
| Short package name | "tai" | Impossible to find among longer matches |
| New/unpopular package | "my-new-lib" | Low upvotes = buried in results |
| Recently requested | Just requested "foo" | Placeholder invisible (status != active) |
| Package doesn't exist | "nonexistent-pkg" | No guidance on what to do next |

### Success Criteria

1. Typing exact package name shows it first (or offers to request it)
2. Can find and add packages regardless of popularity
3. Recently requested packages are immediately usable
4. Clear path forward when package isn't found

---

## Tasks

### Search Results Improvements
- [ ] Exact match prioritization - if query matches a name exactly, show first
- [ ] Include placeholder packages in results (with visual distinction)
- [ ] Consider: prefix match vs contains match ranking
- [ ] Consider: showing "Request '{query}'?" when no exact match exists

### Project "Add Package" UX
- [ ] Apply same search improvements to project package dropdown
- [ ] Guidance when package not found (link to main search? inline request?)
- [ ] Handle edge case: short names that match many packages

### Visual Feedback
- [ ] "Pending" indicator for placeholder packages
- [ ] Clear distinction between active and placeholder in results
- [ ] Loading/requesting states

---

## Technical Context

### Current Search Query
```typescript
// packages/database/queries/packages.ts
let q = zql.packages.where("status", "active");  // ← Excludes placeholders

return q
  .orderBy("upvoteCount", "desc")  // ← Popular packages first
  .orderBy("name", "asc")
  .limit(args.limit)
```

### Package Status Values
- `active` - Fetched successfully, has metadata
- `placeholder` - Requested, awaiting worker fetch
- `failed` - Fetch failed (404, rate limit, etc.)

### Request Flow (already exists)
```
requestPackage mutator → creates placeholder + pending fetch
                      → worker processes → placeholder becomes active
```

---

## SEO & Discoverability

Make the site more discoverable from search engines.

- [ ] Audit current SEO state (meta tags, titles, descriptions)
- [ ] Package pages: meaningful titles, descriptions from package metadata
- [ ] Consider: sitemap generation
- [ ] Consider: structured data (JSON-LD for packages)

---

## Homepage & Onboarding

Make the homepage more compelling - guide users to explore and contribute.

- [ ] Highlight curation/contribution system ("Help improve package data")
- [ ] Show the gamification aspect (leaderboard preview? contribution stats?)
- [ ] Clearer value prop for creating an account
- [ ] Better entry points to explore (popular packages, recent activity, etc.)

---

## Branding & Polish

Establish visual identity and polish rough edges.

- [ ] Logo design (favicon, navbar, og:image)
- [ ] Color palette refinement (does current theme feel right?)
- [ ] Dark mode contrast audit - WCAG AA compliance
- [ ] Typography review
- [ ] Brand voice/tone for copy
- [ ] Consider: tagline, about page
- [ ] Empty state improvements - more helpful CTAs
- [ ] HoverDropdown keyboard navigation - account dropdown inaccessible to keyboard users

---

## Auth & Token Management

Ensure token refresh works correctly after navbar refactoring, and improve proactive refresh.

- [ ] Verify access token management still works after Sprint 4 navbar changes
- [ ] Proactive token refresh before expiry (refresh when token is about to expire, not after)
- [ ] Keep `needs-auth` connection state as fallback if proactive refresh fails
- [ ] Test auth flow end-to-end (login, token refresh, logout)

---

## Out of Scope

- Fuzzy matching / typo tolerance
- Full-text search ranking
- Registry-specific search (JSR, etc.)

---

## Notes

Solutions will emerge during implementation. These are problem areas to improve - specific implementations are flexible.
