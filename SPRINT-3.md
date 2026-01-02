# Sprint 3: UX Polish + Community Curation

> **Theme:** Fix UX gaps while building foundation for community-driven curation

---

## Goals

1. **UX Polish** - Toast notifications, loading states, form consistency
2. **Community Curation** - Suggestion/voting system for package tags with anti-gaming mechanics

---

## Tech Debt: UX Gaps

### Toast Notification System
- [ ] Create Toast component (Kobalte Toast primitive)
- [ ] Toast provider in app context
- [ ] Replace silent `console.error` catches with user-visible toasts
- [ ] Success/error/info variants

### Loading States
- [ ] Create Skeleton component
- [ ] Replace "Loading..." text on key pages (package detail, project detail, admin)
- [ ] Consistent loading patterns across app

### Form Consistency
- [ ] Convert raw inputs in `detail.tsx` to Input/Textarea components
- [ ] Audit for any remaining raw form elements

---

## Vision: Community Curation

### Data Model

**New tables:**
```
suggestions
├── id
├── type: "add_package_tag" | "remove_package_tag"
├── packageId
├── tagId
├── accountId (who suggested)
├── status: "pending" | "approved" | "rejected"
├── createdAt
├── resolvedAt

suggestionVotes
├── id
├── suggestionId
├── accountId
├── vote: "approve" | "reject"
├── createdAt

contributionScores
├── accountId (primary key)
├── score
├── updatedAt
```

### Approval Logic
- Suggestion approved when: `approveVotes >= 2` OR `adminApproved`
- Suggestion rejected when: `rejectVotes >= 2` OR `adminRejected`
- Users cannot vote on their own suggestions

### Anti-Gaming Mechanics
- **Random queue**: Users get random pending suggestions to review
- **No cherry-picking**: Cannot browse/select specific suggestions
- **No self-review**: Own suggestions excluded from queue
- **Limited skips**: Prevent gaming by skipping to find friends' suggestions

### Contribution Points
| Action | Points |
|--------|--------|
| Suggestion approved | +5 |
| Vote matches final outcome | +2 |
| Suggestion rejected | -1 |
| Suggestion marked as spam | -10 |

### UI Components

**Package Detail Page:**
- [ ] "Suggest Tag" button for logged-in users
- [ ] Show pending tag suggestions (with vote counts)

**Review Queue (`/review`):**
- [ ] Random pending suggestion display
- [ ] Approve/Reject buttons
- [ ] Skip button (limited)
- [ ] Progress indicator (reviewed today)

**Leaderboard (`/leaderboard` or section on landing):**
- [ ] Top contributors by score
- [ ] Current user's rank

---

## Tasks Summary

See [TASKS.md](./TASKS.md) for detailed task breakdown.

---

## Out of Scope

- Other suggestion types (descriptions, new packages) - future sprints
- Complex spam detection - start simple with point penalties
- Notifications for suggestion status changes - future sprint
