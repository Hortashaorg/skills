# Issues

> Context-rich Q&A - Stack Overflow alternative grounded in real packages and ecosystems.

---

## Scope

### Core
- [ ] Issue entity (title, content, linked entities)
- [ ] Link issues to packages/ecosystems
- [ ] Answers with voting
- [ ] Rich text content (markdown + @mentions)
- [ ] Issue browsing/search

### Future
- [ ] Gamification (points for helpful answers)
- [ ] "Solved" marking
- [ ] Issue tags/categories

---

## User Stories

### Developer Asking

- **As a developer**, I want to ask a question linked to specific packages, so respondents understand my context.
- **As a developer**, I want to describe my project context (what I'm using), so answers are relevant to my situation.
- **As a developer**, I want to @mention packages in my question, so the problem is grounded in real entities.

### Developer Answering

- **As a developer**, I want to find issues related to packages I know well, so I can help others.
- **As a developer**, I want to write detailed answers with code and @mentions, so my response is useful.
- **As a developer**, I want recognition for helpful answers, so I'm motivated to contribute.

### Developer Searching

- **As a developer**, I want to search issues by package, so I find relevant problems/solutions.
- **As a developer**, I want to see issues linked from package pages, so I discover common problems.

### Cross-Feature Integration

**With Packages & Ecosystems:**
- Issues link to packages/ecosystems (this is what makes it better than Stack Overflow)
- Package pages show related issues
- Filter issues by package/ecosystem

**With Rich Text:**
- Issue content and answers use rich text editor
- @mentions link to packages, ecosystems, projects

**With User Profiles:**
- Issues and answers attributed to users
- Answer history visible on profile
- Contribution points from helpful answers

**With Projects:**
- Optionally link issue to your project for full context
- "I'm trying to do X with this stack" → link to project

---

## Purpose

Issues are **Q&A grounded in real technology context**.

Stack Overflow problem: Questions are often abstract or missing context. "How do I do X?" without knowing what tools they're using.

TechGarden Issues:
- Every issue links to specific packages/ecosystems
- You can link to your project showing your full stack
- Answers reference real entities
- Filterable by technology

This makes questions more answerable and answers more discoverable.

---

## Features

### Linked Entities

**What:** When creating an issue, link it to relevant packages/ecosystems. These appear as tags/badges on the issue.

**Why:** Context matters. "Drizzle + Postgres + Cloudflare Workers" is more answerable than "ORM problem".

### Rich Text Content

**What:** Questions and answers support markdown with @mentions.

**Why:** Technical content needs formatting. @mentions ground the discussion.

### Answer Voting

**What:** Answers can be upvoted. Best answers rise to top.

**Why:** Surface helpful content. Incentivize quality answers.

### Package-Linked Discovery

**What:** Package pages show issues linked to that package. Issues searchable by package.

**Why:** "What problems do people have with Drizzle?" → browse issues. Common problems become discoverable.

---

## Data Model

```
issues
  - id: uuid
  - accountId: uuid (FK) - Author
  - title: string
  - content: text (markdown)
  - projectId: uuid? (FK) - Optional project for context
  - solved: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

issuePackages
  - id: uuid
  - issueId: uuid (FK)
  - packageId: uuid (FK)
  - createdAt: timestamp

issueEcosystems
  - id: uuid
  - issueId: uuid (FK)
  - ecosystemId: uuid (FK)
  - createdAt: timestamp

issueAnswers
  - id: uuid
  - issueId: uuid (FK)
  - accountId: uuid (FK) - Author
  - content: text (markdown)
  - upvoteCount: integer
  - accepted: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

issueAnswerUpvotes
  - id: uuid
  - answerId: uuid (FK)
  - accountId: uuid (FK)
  - createdAt: timestamp
```

### Relationships

```
issues
├── account - Author
├── project (optional) - Context
├── issuePackages (many) → packages
├── issueEcosystems (many) → ecosystems
└── issueAnswers (many)
    ├── account - Author
    └── issueAnswerUpvotes (many)
```

---

## Additional Notes

### Difference from Stack Overflow

| Aspect | Stack Overflow | TechGarden Issues |
|--------|---------------|-------------------|
| Context | Tags (abstract) | Linked packages (concrete) |
| Discovery | Search/browse | Also from package pages |
| User context | None | Can link to project |
| Grounding | Text-only | @mentions to real entities |

### Gamification Ideas (Future)

- Points for answers
- Bonus points for accepted answers
- "Expert" badges for packages you answer about often
- Leaderboard per package/ecosystem

### Moderation

- Author can accept an answer
- Community voting surfaces quality
- Flagging system (future if needed)
