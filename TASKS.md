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
- [ ] Run migrations and generate Zero schema

### Package Page Restructure
- [ ] Create tabbed layout for package pages
  - [ ] `/packages/:reg/:name` → Overview (header, description, quick stats)
  - [ ] `/packages/:reg/:name/details` → Full details (channels, deps, fetch history)
  - [ ] `/packages/:reg/:name/curate` → Community curation tab
- [ ] Move existing sections appropriately
- [ ] Add tab navigation component

### Suggestion System
- [ ] Define Zod payload schemas (versioned)
  - [ ] `add_tag_v1`: `{ tagId: string }`
  - [ ] Future: `remove_tag_v1`, `link_package_v1`, etc.
- [ ] Create suggestion mutators
  - [ ] `suggestions.create` - create suggestion with validated payload
  - [ ] `suggestions.resolve` - auto-resolve when threshold reached
- [ ] Create suggestion queries
  - [ ] `suggestions.forPackage` - all suggestions for a package
  - [ ] `suggestions.pending` - pending suggestions (for review queue)
- [ ] Curate tab UI
  - [ ] Display current tags
  - [ ] "Suggest Tag" button (logged-in users)
  - [ ] Show pending suggestions with vote counts

### Voting System
- [ ] Create vote mutators
  - [ ] `suggestionVotes.vote` - cast approve/reject vote
- [ ] Auto-resolve logic (threshold: 3 votes same direction)
  - [ ] Apply tag when approved
  - [ ] Dismiss suggestion when rejected
  - [ ] Award/deduct points on resolution
- [ ] Validation rules
  - [ ] Block self-voting
  - [ ] Block duplicate votes
  - [ ] Block voting on resolved suggestions

### Curation Review Page (`/curation`)
- [ ] Create page layout with queue + leaderboard sidebar
- [ ] Review queue section
  - [ ] Random pending suggestion (exclude own)
  - [ ] Package context (name, registry, current tags)
  - [ ] Approve / Reject / Skip buttons
  - [ ] Load next on action
- [ ] Leaderboard sidebar
  - [ ] Toggle: Monthly / All-time
  - [ ] Top 50 contributors
  - [ ] Current user's rank + points (if not in top 50)

### Contribution Scoring
- [ ] Point awards (applied on suggestion resolution)
  - [ ] +5 to suggester when approved
  - [ ] -1 to suggester when rejected
  - [ ] +1 to voters who matched outcome
- [ ] Update both monthly and all-time scores
- [ ] Monthly score reset (future: cron job or on-read reset)

---

## Out of Scope (Future Sprints)

- Additional suggestion types (remove_tag, link_package, set_attribute)
- New tag proposals (currently: existing tags only)
- Complex spam detection
- Notifications for suggestion status changes
- Monthly score auto-reset cron

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
