# User Profiles

> Public presence - showcase your projects, contributions, and expertise.

---

## Scope

### Core
- [ ] Profile page (username, bio, avatar)
- [ ] Projects list (user's public projects)
- [ ] Contribution history (curation activity)
- [ ] Activity feed (recent actions)

### Future
- [ ] Expertise signals (technologies contributed to most)
- [ ] Issue answer history
- [ ] Comparisons authored
- [ ] Social links (GitHub, Twitter, etc.)
- [ ] Follower/following (maybe)

---

## User Stories

### Developer Building Presence

- **As a developer**, I want a public profile page, so I can showcase my work.
- **As a developer**, I want to display my projects, so others can see what I build with.
- **As a developer**, I want my curation contributions visible, so I get recognition for helping.
- **As a developer**, I want to write a bio, so visitors understand who I am.

### Developer Browsing Others

- **As a developer**, I want to click on someone's name and see their profile, so I can learn more about them.
- **As a developer**, I want to see what projects someone has, so I can discover interesting stacks.
- **As a developer**, I want to see someone's expertise areas, so I know who to follow or ask for help.

### Recruiter/Employer (Secondary)

- **As a recruiter**, I want to see a developer's technology decisions, so I understand their experience.
- **As a hiring manager**, I want to see how someone documents decisions, so I assess their communication.

### Cross-Feature Integration

**With Projects:**
- Profile shows list of user's projects
- Projects link back to author profile

**With Curation:**
- Contribution score displayed on profile
- History of suggestions made, votes cast

**With Issues (future):**
- Questions asked, answers given
- Helpful answer count

**With Comparisons (future):**
- Comparisons authored
- Decision-making visible

---

## Purpose

Profiles make **contributions visible and people discoverable**.

Currently, you can contribute to curation but there's no public presence. Profiles change that:
- Your projects showcase your stack
- Your curation work shows you help the community
- Your answers (future) show your expertise
- Everything links together

This creates incentives: recognition for contributing, a portfolio to share, a way to find interesting people.

---

## Features

### Profile Page

**What:** Public page at `/user/{username}` showing bio, avatar, and content.

**Why:** Identity. Click any name → see who they are.

### Projects List

**What:** User's public projects displayed on profile.

**Why:** Showcase what you build with. Projects are the primary content.

### Contribution History

**What:** Curation activity - suggestions made, votes cast, contribution score.

**Why:** Recognition for community work. Shows you're an active participant.

### Activity Feed

**What:** Recent activity - projects created, packages added, suggestions approved.

**Why:** See what someone's been up to. Fresh content.

### Bio (Rich Text)

**What:** Markdown bio section with @mentions support.

**Why:** Introduce yourself. Link to technologies you care about.

---

## Data Model

Most data already exists, profile is a view layer:

```
accounts (existing, maybe add fields)
  - id: uuid
  - username: string (for URL)
  - displayName: string?
  - bio: text? (markdown) ← NEW
  - avatarUrl: string? ← NEW
  - createdAt: timestamp
  - updatedAt: timestamp

# Contribution score already exists:
contributionScores
  - accountId: uuid
  - monthlyScore: integer
  - allTimeScore: integer

# Projects already linked to accounts:
projects
  - accountId: uuid
  - ...

# Activity could be derived from existing data or new table:
# Option A: Query existing tables (suggestions, projects, etc.)
# Option B: Explicit activity log table
```

### Profile Data Aggregation

Profile page queries:
- Account info (username, bio, avatar)
- Projects where accountId = user
- ContributionScore for user
- Recent suggestions by user
- (Future) Issues and answers by user

---

## Additional Notes

### Privacy Considerations

- Profiles are public by default (you're building presence)
- Could add "private mode" later if needed
- Activity is only public actions (not votes on others' suggestions?)

### Design Principles

- **Lightweight to start** - Username, bio, projects, contribution score
- **Grows with features** - Add sections as issues, comparisons ship
- **Portfolio-ready** - Something worth putting on a CV

### Username

Currently accounts may not have usernames. Need to:
- Add username field
- Handle uniqueness
- Migration for existing users (prompt to set username?)

### Avatar

Options:
- Upload custom avatar
- Pull from GitHub/OAuth provider
- Generated from username (like GitHub's identicons)

Start simple - OAuth provider avatar or generated.
