# Comments & Discussions

> Threaded conversations anchored to real entities - packages, ecosystems, projects.

---

## Scope

### Core ✓
- [x] Thread per entity (package, ecosystem, project)
- [x] Comments with replies (flat threading - replies to root only)
- [x] Soft delete (preserves thread structure)
- [x] Edit own comments
- [x] Markdown content with preview
- [x] Pagination (20 roots, 20 replies at a time)
- [x] Mobile-friendly layout

### Integration
- [x] Package detail page (Discussion tab)
- [ ] Ecosystem detail page
- [ ] Project detail page

### Future
- [ ] Linkable comments (URL anchors, scroll to comment)
- [ ] User profile links from avatars
- [ ] @mentions with autocomplete
- [ ] Rich entity links with hover preview
- [ ] Notification on reply
- [ ] Moderation tools (hide, flag)

---

## User Stories

### Developer Discussing

- **As a developer**, I want to comment on a package, so I can share experiences or ask questions.
- **As a developer**, I want to reply to others, so we can have focused conversations.
- **As a developer**, I want to use markdown, so I can include code snippets and formatting.
- **As a developer**, I want to edit my comments, so I can fix mistakes.

### Developer Reading

- **As a developer**, I want to see discussions on packages I'm evaluating, so I learn from others' experiences.
- **As a developer**, I want to expand/collapse reply threads, so I can focus on what's relevant.
- **As a developer**, I want to link directly to a comment, so I can share specific insights.

### Cross-Feature Integration

**With Packages/Ecosystems/Projects:**
- Each entity has a Discussion tab
- Thread auto-created on first comment

**With User Profiles (future):**
- Click avatar/name to see profile
- Comment history visible on profile

**With Rich Text:**
- Comments use MarkdownEditor
- Entity @mentions link to packages/ecosystems/projects

**With Notifications (future):**
- Notify when someone replies to your comment
- Notify when someone mentions you

---

## Architecture

### Flat Threading (Reddit-style)

Replies always attach to root comments, not to other replies. This prevents deeply nested threads that become hard to read on mobile.

```
Root Comment (Martin)
├── Reply (Alice) ← Martin
├── Reply (Bob) ← Alice (shows "← Alice" but same indent level)
└── Reply (Martin) ← Bob

Root Comment (Sarah)
└── Reply (Dave) ← Sarah
```

**Why flat?**
- Consistent indentation depth (1 level max)
- Works well on mobile
- Easier to follow conversations
- Shows who you're replying to via `← @name`

### Data Model

```
threads
  - id: uuid
  - packageId: uuid? (FK)
  - ecosystemId: uuid? (FK)
  - projectId: uuid? (FK)
  - createdAt: timestamp

comments
  - id: uuid
  - threadId: uuid (FK)
  - authorId: uuid (FK to accounts)
  - content: text (markdown)
  - replyToId: uuid? (FK to comments) - Who this replies to
  - rootCommentId: uuid? (FK to comments) - Root of thread (null if is root)
  - createdAt: timestamp
  - updatedAt: timestamp
  - deletedAt: timestamp? (soft delete)
```

### Queries

- `rootsByThreadId` - Get root comments (where `rootCommentId IS NULL`), includes hasReplies check
- `repliesByRootId` - Get replies to a root comment, ordered chronologically

### Pagination Strategy

- Load 20 root comments at a time
- "Show replies" button loads 20 replies at a time
- Load N+1 to detect if there's more (hasMore = results.length > limit)
- Replies auto-expand when user submits a reply

---

## UI Components

### CommentThread (Composite)

Orchestrates the entire discussion UI:
- New comment input (top)
- List of root comments
- Expand/collapse replies per root
- Inline reply editor

### CommentCard (Presentational)

Single comment display:
- Author name, timestamp
- Markdown content (via MarkdownOutput)
- Edit/Delete/Reply actions (conditional)
- "← @name" indicator for replies
- "(edited)" indicator when updated

### Avatar (UI)

User avatar with initials:
- Hidden on mobile (saves horizontal space)
- Size variants: md (roots), sm (replies)
- Color variants: primary (others), secondary (self), muted (deleted)

---

## Decisions Made

**Threading model:** Flat (Reddit-style). Deeply nested threads are hard to read, especially on mobile.

**Pagination:** Lazy load replies. Don't load all replies upfront - could be expensive for popular packages.

**Mobile layout:**
- Hide avatars (more content space)
- Left border indicates reply nesting
- Toolbar wraps in editor

**Soft delete:** Preserve thread structure. Deleted comments show "[deleted]" but replies remain visible.

---

## Open Questions

**Moderation:**
- Who can delete others' comments?
- Flagging system?
- Auto-hide based on flags?

**Notifications:**
- Notify on reply? On mention?
- Email or in-app only?

**Rate limiting:**
- Prevent spam?
- Cooldown between comments?
