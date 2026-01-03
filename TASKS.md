# Sprint 3 Tasks

> **Current Sprint:** [SPRINT-3.md](./SPRINT-3.md) - UX Polish + Community Curation

---

## UX Polish

### Toast Notification System
- [x] Create Toast component using Kobalte Toast primitive
- [x] Create ToastProvider in app context (ToastRegion in Layout)
- [x] Define toast variants: success, error, info, warning
- [x] Replace `console.error` catches with user-visible toasts
  - [x] `admin/tags/index.tsx` - tag delete/save failures
  - [x] `me/projects/detail.tsx` - project update failures
  - [x] `me/projects/new.tsx` - project create failure
  - [x] `me/index.tsx` - username update, account delete
  - [x] `package/sections/Header.tsx` - add to project failure
  - [x] `package/sections/PackageTags.tsx` - add/remove tag failures

### Loading States
- [x] Create Skeleton component (animated placeholder)
- [x] Project list page - skeleton grid
- [x] Project detail page - skeleton for project data
- [x] Profile page - skeleton for account info
- [x] Package detail page - skeleton for header, tags, channels, dependencies
- [x] Admin tags page - skeleton for tags list

### Form Consistency
- [x] Create Textarea component (primitives tier)
- [x] Convert raw inputs in `detail.tsx` to Input/Textarea components
- [x] Convert raw textarea in `ProjectForm.tsx` to Textarea component
- [x] Audit complete - no remaining raw form elements in routes

---

## Community Curation

### Database Schema
- [x] Create `suggestions` table
  - id, packageId, accountId, type, version, payload (JSON), status, createdAt, updatedAt, resolvedAt
- [x] Create `suggestionVotes` table
  - id, suggestionId, accountId, vote (approve/reject), createdAt
- [x] Create `contributionEvents` table (event log - source of truth)
  - id, accountId, type, points, suggestionId, createdAt
- [x] Create `contributionScores` table (cache - computed by worker)
  - id, accountId, monthlyScore, allTimeScore, lastCalculatedAt
- [x] Remove unused `audit_log` table and related enums
- [x] Security fix: Add ownership check to `packageUpvotes.remove`
- [x] Run migrations and generate Zero schema

### Package Page Restructure
- [x] Create tabbed layout for package pages
  - [x] `/packages/:reg/:name` → Overview (tags, channels, dependencies)
  - [x] `/packages/:reg/:name/details` → Full details (all info + fetch history)
  - [x] `/packages/:reg/:name/curate` → Community curation tab
- [x] Move existing sections appropriately
- [x] Add tab navigation component

### Suggestion System
- [x] Define Zod payload schemas (versioned)
  - [x] `add_tag_v1`: `{ tagId: string }`
  - [ ] Future: `remove_tag_v1`, `link_package_v1`, etc.
- [x] Create suggestion mutators
  - [x] `suggestions.createAddTag` - suggest adding a tag to a package
  - [x] `suggestions.adminResolve` - manual admin resolution with points
- [x] Create suggestion queries
  - [x] `suggestions.forPackage` - all suggestions for a package
  - [x] `suggestions.pendingForPackage` - pending for specific package
  - [x] `suggestions.pending` - all pending (for review queue)
  - [x] `suggestions.pendingExcludingUser` - exclude own suggestions
  - [x] `suggestions.byId` - single suggestion with relations
- [x] Curate tab UI (currently tag-focused, extensible architecture)
  - [x] Display current tags
  - [x] "Suggest Tag" form (logged-in users, select from available tags)
  - [x] Show pending suggestions with approve/reject vote counts
  - [x] Vote buttons for logged-in users (hidden for own suggestions)
  - [ ] Future: Generalize UI to render different suggestion types

### Voting System
- [x] Create vote mutators
  - [x] `suggestionVotes.vote` - cast approve/reject vote
- [x] Auto-resolve logic (threshold: 3 votes same direction)
  - [x] Apply tag when approved
  - [x] Dismiss suggestion when rejected
  - [x] Award/deduct points on resolution
- [x] Validation rules
  - [x] Block self-voting
  - [x] Block duplicate votes
  - [x] Block voting on resolved suggestions

### Curation Review Page (`/curation`)
- [x] Create page layout with queue + leaderboard sidebar
- [x] Review queue section
  - [x] Pending suggestion (exclude own)
  - [x] Package context (name, registry, description)
  - [x] Approve / Reject buttons with vote counts
  - [x] Auto-advance on vote (realtime query updates)
- [x] Leaderboard sidebar
  - [x] Toggle: Monthly / All-time
  - [x] Top 50 contributors
  - [x] Current user's rank + points (if not in top 50)

### Contribution Scoring
- [x] Point awards (applied on suggestion resolution)
  - [x] +5 to suggester when approved
  - [x] -1 to suggester when rejected
  - [x] +1 to voters who matched outcome
- [x] Create contribution queries
  - [x] `contributionScores.leaderboardMonthly` - top 50 monthly
  - [x] `contributionScores.leaderboardAllTime` - top 50 all-time
  - [x] `contributionScores.forUser` - specific user's scores
- [x] Worker job to aggregate contributionEvents → contributionScores
  - [x] Incremental all-time score calculation
  - [x] Monthly score: incremental within month, recalculates on UTC month change
  - [x] Uses max(event.createdAt) as lastCalculatedAt marker

---

## Out of Scope (Future Sprints)

- Additional suggestion types (remove_tag, link_package, set_attribute)
- Generalize curation UI to handle multiple suggestion types
- New tag proposals (currently: existing tags only)
- Complex spam detection
- Notifications for suggestion status changes

---

## Completed (Previous Sprints)

### Sprint 2: Projects & Data Foundation

- Projects feature with CRUD operations
- Route restructure: `/packages`, `/projects`, `/me/*`
- Landing page, user profile, "Add to project" button
- AlertDialog, Breadcrumbs, IconLinkCard, Table components
- Design system consistency and dead code removal
- Privacy policy and GDPR account deletion

### Sprint 1 (Milestones 1-7)

- Core search → request → fetch → display pipeline
- Auto-queue dependencies, rate limiting
- Browsing, details, upvoting, auth UX
- Admin dashboard, tag management, role system
- Schema simplification (release channels vs all versions)
- Kubernetes deployment, CI/CD
