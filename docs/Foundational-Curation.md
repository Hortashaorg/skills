# Curation

> Community-driven quality control through suggestions, voting, and contribution tracking.

---

## Scope

### Core
- [x] Suggestion system with type registry
- [x] Community voting (3 approvals / 2 rejections threshold)
- [x] Contribution scoring (monthly + all-time)
- [x] Power user auto-approval (admin/curator roles)
- [x] Notifications for suggestion outcomes
- [x] Skip functionality for review queue
- [x] Leaderboard

### Future
- [ ] Additional suggestion types for new foundational entities (standards)

---

## User Stories

### Community Curator

- **As a curator**, I want to suggest changes to packages and ecosystems, so I can help improve data quality.
- **As a curator**, I want to vote on other people's suggestions, so the community decides what's accurate.
- **As a curator**, I want to see my contribution score, so I'm recognized for helping.
- **As a curator**, I want to see a leaderboard, so I can see top contributors and be motivated to contribute.

### Power User (Admin/Curator Role)

- **As a power user**, I want my suggestions to apply immediately, so I can curate efficiently without waiting for votes.
- **As a power user**, I want to review the suggestion backlog, so I can help clear pending items.

### Regular User

- **As a user**, I want to be notified when my suggestion is approved or rejected, so I know the outcome.
- **As a user**, I want to skip suggestions I'm not qualified to judge, so I only vote on things I understand.

### Cross-Feature Integration

**With Packages:**
- `add_tag` and `remove_tag` suggestions modify package tags
- Suggestions reference packages via `packageId`

**With Ecosystems:**
- 7 suggestion types modify ecosystems (create, add/remove package, add/remove tag, edit description/website)
- Suggestions reference ecosystems via `ecosystemId`

**With Future Entities:**
- The type registry pattern is extensible
- New suggestion types can target new entities (standards, comparisons, etc.)

---

## Purpose

Curation enables **democratic quality control** without gatekeeping.

The problem: Registry metadata is often sparse or inaccurate. Tags are missing. Ecosystems need organizing. But no single person has complete knowledge.

The solution: Anyone can suggest changes. The community votes. Approved suggestions apply automatically. Contributors are rewarded.

Key principles:
1. **No gatekeeping** - Anyone can suggest, anyone can vote
2. **Democratic consensus** - Thresholds prevent single-person decisions
3. **Spam prevention** - Can't duplicate pending suggestions
4. **Recognition** - Contribution scores reward helpful behavior
5. **Efficiency** - Power users can bypass voting for trusted changes

---

## Features

### Suggestion System

**What:** Users submit suggestions to modify packages or ecosystems. Each suggestion has a type, payload, and optional justification.

**Why:** Structured change proposals that can be validated, voted on, and applied automatically.

### Type Registry

**What:** Each suggestion type is a self-contained module defining:
- Schema (Zod validation for payload)
- Validation (business rules, duplicate prevention)
- Display formatting (human-readable action text)
- Resolution (how to apply when approved)

**Why:** Extensible pattern. Adding new suggestion types means adding one file, not touching core logic.

### Voting

**What:** Community members vote approve or reject on pending suggestions. Thresholds trigger resolution.

**Why:** Democratic consensus. No single person decides - the community collectively maintains quality.

**Thresholds:**
- 3 approvals → approved and applied
- 2 rejections → rejected
- Admin vote → immediate resolution (bypasses threshold)

### Contribution Scoring

**What:** Users earn points for:
- Suggestion approved: +5 points
- Suggestion rejected: -1 point
- Vote matched outcome: +1 point

Two scores tracked: monthly (resets each month) and all-time (cumulative).

**Why:** Recognition motivates contribution. Leaderboards show top curators. Negative points discourage spam.

### Power User Auto-Approval

**What:** Users with `admin` or `curator` roles have suggestions immediately approved and applied.

**Why:** Trusted contributors shouldn't wait for votes. Reduces friction for high-quality curators.

### Notifications

**What:** Users are notified when their suggestions are approved or rejected.

**Why:** Feedback loop. Users know the outcome without checking manually.

### Skip Functionality

**What:** When reviewing suggestions, users can skip ones they're not qualified to judge.

**Why:** Reduces bad votes. "I don't know React" → skip React-related suggestions.

---

## Suggestion Types

| Type | Target | Effect |
|------|--------|--------|
| `add_tag` | Package | Add tag to package |
| `remove_tag` | Package | Remove tag from package |
| `create_ecosystem` | None | Create new ecosystem |
| `add_ecosystem_package` | Ecosystem | Add package to ecosystem |
| `remove_ecosystem_package` | Ecosystem | Remove package from ecosystem |
| `add_ecosystem_tag` | Ecosystem | Add tag to ecosystem |
| `remove_ecosystem_tag` | Ecosystem | Remove tag from ecosystem |
| `edit_ecosystem_description` | Ecosystem | Update ecosystem description |
| `edit_ecosystem_website` | Ecosystem | Update ecosystem website URL |

### Adding New Types

Each type is a file in `packages/database/suggestions/types/` implementing:

```typescript
SuggestionTypeDefinition<TPayload> {
  type: string                      // Machine name
  label: string                     // Display name
  schemas: Record<number, ZodType>  // Versioned payload schemas
  currentVersion: number            // Latest schema version
  targetEntity: "package" | "ecosystem" | "none"
  toastMessages: { applied, pending }
  formatDisplay(payload, context)   // → human-readable action
  resolve(tx, payload, ids)         // Apply the change
  validate?(tx, payload, ids)       // Pre-creation validation
}
```

Register in `types/index.ts` and the system handles the rest.

---

## Data Model

```
suggestions
  - id: uuid
  - packageId: uuid? (FK) - Target package (if applicable)
  - ecosystemId: uuid? (FK) - Target ecosystem (if applicable)
  - accountId: uuid (FK) - Who submitted
  - type: enum - Suggestion type (add_tag, create_ecosystem, etc.)
  - version: integer - Schema version for payload
  - payload: jsonb - Type-specific data
  - justification: text? - Optional reason for suggestion
  - status: enum - pending, approved, rejected
  - createdAt: timestamp
  - updatedAt: timestamp
  - resolvedAt: timestamp? - When approved/rejected

  Indexes: packageId, ecosystemId, status, accountId

suggestionVotes
  - id: uuid
  - suggestionId: uuid (FK)
  - accountId: uuid (FK)
  - vote: enum - approve, reject
  - createdAt: timestamp

  Unique constraint: (suggestionId, accountId)

contributionScores
  - id: uuid
  - accountId: uuid (FK, unique)
  - monthlyScore: integer
  - allTimeScore: integer
  - lastCalculatedAt: timestamp - For incremental processing

  Indexes: monthlyScore, allTimeScore

contributionEvents
  - id: uuid
  - accountId: uuid (FK)
  - type: enum - suggestion_approved, suggestion_rejected, vote_matched
  - points: integer
  - suggestionId: uuid? (FK)
  - createdAt: timestamp

  Indexes: accountId, createdAt

notifications
  - id: uuid
  - accountId: uuid (FK)
  - type: enum - suggestion_approved, suggestion_rejected
  - title: text
  - message: text
  - read: boolean
  - relatedId: uuid? - Usually suggestionId
  - createdAt: timestamp
  - updatedAt: timestamp

  Indexes: accountId, createdAt
```

### Relationships

```
suggestions
├── package (optional) - Target package
├── ecosystem (optional) - Target ecosystem
├── account - Submitter
└── votes (many) - Community votes

suggestionVotes
├── suggestion
└── account - Voter

contributionScores
└── account (one-to-one)

contributionEvents
├── account
└── suggestion (optional)

notifications
└── account
```

---

## Processing Flows

### Suggestion Creation

1. User calls `mutators.suggestions.create({ type, payload, packageId?, ecosystemId?, justification? })`
2. Validate payload against type's schema
3. Run type-specific validation (entity exists, no duplicates)
4. Check if power user (admin/curator role)
5. If power user:
   - Insert with status=approved, resolvedAt=now
   - Call `typeDef.resolve()` immediately
6. If regular user:
   - Insert with status=pending
7. Return suggestion ID

### Voting Flow

1. User calls `mutators.suggestionVotes.vote({ suggestionId, vote })`
2. Validate:
   - User logged in
   - Suggestion is pending
   - User hasn't voted already
   - User isn't suggester (unless admin)
3. Insert vote
4. Count approvals and rejections
5. Check thresholds:
   - Admin vote → immediate resolution
   - 3+ approvals → approved
   - 2+ rejections → rejected
6. If resolved:
   - Update suggestion status and resolvedAt
   - If approved: call `typeDef.resolve()`
   - Create contribution event for suggester (+5 or -1)
   - Create notification for suggester
   - Award +1 to voters who matched outcome

### Score Calculation (Worker CronJob)

1. Find accounts with unprocessed contribution events
2. For each account (in transaction):
   - Get existing score record (or create)
   - Sum points from new events since lastCalculatedAt
   - Check if month changed (UTC)
   - If same month: add to existing monthly
   - If new month: recalculate monthly from scratch
   - Update allTimeScore (always additive)
   - Set lastCalculatedAt to max event timestamp
3. Return counts for logging

---

## Additional Notes

### Validation Rules

All suggestion types enforce:
- Required entities exist (tag, package, ecosystem)
- No duplicate pending suggestions for same action
- Business logic (can't remove tag that's not there)

Errors are user-friendly and caught by error boundaries.

### Display Resolution

Suggestions store IDs in payloads. For display, a backend endpoint batch-resolves:
1. Collect all referenced IDs (tags, packages, ecosystems)
2. Fetch entities in parallel
3. Build context map
4. Call `formatDisplay()` for each suggestion
5. Return with human-readable action text and links

### Asymmetric Thresholds

Rejecting is easier (2 votes) than approving (3 votes). This prioritizes community consensus - if two people think something is wrong, it probably is.

### Monthly Score Reset

Monthly scores use UTC month boundaries. When the month changes, the score is recalculated from all events in the new month (not just reset to zero).

### Power User Roles

Currently: `admin` and `curator`. The `isPowerUser()` function checks JWT roles. Easy to extend with new role types.
