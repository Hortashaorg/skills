# Sprint 3: UX Polish + Community Curation

> **Status:** Complete
> **Theme:** Fix UX gaps while building foundation for community-driven curation

---

## Goals

1. **UX Polish** - Toast notifications, loading states, form consistency
2. **Community Curation** - Suggestion/voting system for package tags with contribution tracking

---

## Completed: UX Polish

### Toast Notification System
- [x] Toast component using Kobalte Toast primitive
- [x] ToastProvider in app context (ToastRegion in Layout)
- [x] Variants: success, error, info, warning
- [x] Replaced all `console.error` catches with user-visible toasts

### Loading States
- [x] Skeleton component (animated placeholder)
- [x] Applied to: project list, project detail, profile, package detail, admin tags

### Form Consistency
- [x] Textarea component (primitives tier)
- [x] All raw inputs/textareas converted to components
- [x] Audit complete - no remaining raw form elements

---

## Completed: Community Curation

### Data Model

**Tables created:**
```
suggestions
├── id, packageId, accountId
├── type: "add_tag" (extensible via payload)
├── version: 1 (for schema evolution)
├── payload: JSON (e.g., { tagId: "..." })
├── status: "pending" | "approved" | "rejected"
├── createdAt, updatedAt, resolvedAt

suggestionVotes
├── id, suggestionId, accountId
├── vote: "approve" | "reject"
├── createdAt

contributionEvents (source of truth)
├── id, accountId, suggestionId
├── type: "suggestion_approved" | "suggestion_rejected" | "vote_matched"
├── points, createdAt

contributionScores (computed cache)
├── id, accountId
├── monthlyScore, allTimeScore
├── lastCalculatedAt
```

### Approval Logic
- Approved when: 3 approve votes OR admin approves
- Rejected when: 2 reject votes OR admin rejects
- Users cannot vote on their own suggestions (admins can)

### Contribution Points
| Action | Points |
|--------|--------|
| Suggestion approved | +5 |
| Suggestion rejected | -1 |
| Vote matches outcome | +1 |

### Package Page Structure
- `/packages/:reg/:name` → Overview (tags, channels, dependencies)
- `/packages/:reg/:name/details` → Full details + fetch history
- `/packages/:reg/:name/curate` → Suggest tags, vote on pending suggestions

### Curation Review Page (`/curation`)
- Review queue showing pending suggestions (excludes own)
- Package context with name, registry, description
- Approve/Reject buttons with current vote counts
- Auto-advances to next suggestion after voting
- Leaderboard sidebar (monthly/all-time toggle, top 50 + user rank)

### Extensible Architecture
- Suggestion type registry in `packages/database/suggestions/`
- Versioned Zod payload schemas
- Centralized resolution handlers
- Adding new suggestion types requires changes in one place

### Worker Integration
- Score calculation job runs after package processing
- Incremental all-time scores
- Monthly scores recalculate on UTC month boundary
- Uses `max(event.createdAt)` as cursor to avoid double-counting

---

## Out of Scope (Future Sprints)

- Additional suggestion types (remove_tag, link_package, set_attribute)
- New tag proposals (currently: select from existing tags only)
- Complex spam detection
- Notifications for suggestion status changes
- Skip functionality in review queue

---

## Technical Notes

- Removed unused `audit_log` table and related enums
- Added ownership check to `packageUpvotes.remove` (security fix)
- Package page uses tabbed layout with shared state
