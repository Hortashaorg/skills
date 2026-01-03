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
- [ ] Create Skeleton component (animated placeholder)
- [ ] Package detail page - replace loading text with skeleton
- [ ] Project detail page - skeleton for project data
- [ ] Admin tags page - skeleton for tags list
- [ ] Consistent loading patterns across app

### Form Consistency
- [ ] Convert raw inputs in `detail.tsx` to Input/Textarea components
- [ ] Audit for any remaining raw form elements

---

## Community Curation

### Database Schema
- [ ] Create `suggestions` table
  - id, type, packageId, tagId, accountId, status, createdAt, resolvedAt
- [ ] Create `suggestionVotes` table
  - id, suggestionId, accountId, vote, createdAt
- [ ] Create `contributionScores` table
  - accountId (PK), score, updatedAt
- [ ] Run migrations
- [ ] Generate Zero schema

### Suggestion System
- [ ] Create suggestion mutators
  - [ ] `suggestions.create` - create tag suggestion
  - [ ] `suggestions.resolve` - admin approve/reject
- [ ] Create suggestion queries
  - [ ] `suggestions.pendingForPackage` - pending suggestions for a package
  - [ ] `suggestions.randomPending` - random pending for review queue
- [ ] Package detail UI
  - [ ] "Suggest Tag" button (logged-in users only)
  - [ ] Show pending tag suggestions with vote counts

### Voting System
- [ ] Create vote mutators
  - [ ] `suggestionVotes.vote` - cast approve/reject vote
- [ ] Voting queries
  - [ ] `suggestionVotes.bySuggestion` - votes for a suggestion
  - [ ] `suggestionVotes.userVote` - user's vote on a suggestion
- [ ] Auto-resolve logic
  - [ ] Approve when `approveVotes >= 2`
  - [ ] Reject when `rejectVotes >= 2`
- [ ] Prevent self-voting (cannot vote on own suggestions)

### Review Queue
- [ ] Create `/review` page
- [ ] Random pending suggestion display (no cherry-picking)
- [ ] Approve/Reject buttons
- [ ] Skip button with limit tracking
- [ ] Exclude user's own suggestions
- [ ] Progress indicator (reviewed today count)

### Contribution Scoring
- [ ] Create score mutators
  - [ ] `contributionScores.adjust` - add/subtract points
- [ ] Point triggers
  - [ ] +5 when suggestion approved
  - [ ] +2 when vote matches final outcome
  - [ ] -1 when suggestion rejected
  - [ ] -10 when suggestion marked as spam
- [ ] Leaderboard query
  - [ ] `contributionScores.leaderboard` - top contributors

### Leaderboard UI
- [ ] Create leaderboard section (landing page or `/leaderboard`)
- [ ] Top contributors by score
- [ ] Current user's rank display

---

## Out of Scope (Future Sprints)

- Other suggestion types (descriptions, new packages)
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
