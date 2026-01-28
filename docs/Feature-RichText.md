# Rich Text

> Markdown editor with entity linking - enables commentary and detailed notes across the platform.

---

## Scope

### Core
- [ ] Markdown editor component (GitHub-flavored markdown)
- [ ] Entity mentions (@package, @ecosystem, @project) - clickable links
- [ ] Preview mode
- [ ] Mobile-friendly editing

### Integration Points
- [ ] Project notes (per-item notes, project description)
- [ ] Issues (question/answer content)
- [ ] User profile bio
- [ ] Comparison notes

### Future
- [ ] Image uploads
- [ ] Code syntax highlighting
- [ ] Collaborative editing

---

## User Stories

### Developer Writing

- **As a developer**, I want to write formatted text (headers, lists, code blocks), so my content is readable.
- **As a developer**, I want to @mention packages and ecosystems, so my writing links to real entities.
- **As a developer**, I want to preview before saving, so I know how it will look.

### Developer Reading

- **As a developer**, I want to click @mentions to navigate to that entity, so I can learn more.
- **As a developer**, I want code blocks to be formatted properly, so technical content is clear.

### Cross-Feature Integration

**With Projects:**
- Project description (rich text intro)
- Per-item notes (why did I choose this package?)

**With Issues:**
- Question content
- Answer content

**With User Profiles:**
- Bio section

**With Comparisons:**
- Notes per comparison item
- Overall comparison description

---

## Purpose

Rich text is **infrastructure that enables discussion** across the platform.

Instead of plain text fields, rich text allows:
- Formatted content (markdown)
- Grounded references (@mentions that link to real entities)
- Technical content (code blocks)

This is what makes "technology discussions concrete" - when you mention a package, it's a clickable link to real data, not just text.

---

## Features

### Markdown Support

**What:** GitHub-flavored markdown - headers, lists, bold/italic, code blocks, links.

**Why:** Developers already know markdown. Don't reinvent.

### Entity Mentions

**What:** Type `@` to search and insert a reference to a package, ecosystem, or project. Renders as a clickable link.

**Why:** The core value prop - grounding discussions in real entities. "I had issues with @drizzle-orm" links to the actual package.

### Preview Mode

**What:** Toggle between edit and preview while writing.

**Why:** Markdown can be hard to visualize. Preview before committing.

### Mobile Editing

**What:** Editor works on mobile devices. Toolbar accessible, text area usable.

**Why:** People browse on phones. Should be able to comment/respond.

---

## Data Model

Rich text content is stored as markdown strings in existing tables:

```
# No new tables - rich text is a field type

# Examples of where it's used:
projects.description: text (markdown)
projectPackages.note: text (markdown)
issues.content: text (markdown)
issueAnswers.content: text (markdown)
accounts.bio: text (markdown)
```

### Entity Mention Format

Mentions stored as markdown links with special format:
```markdown
Check out [@drizzle-orm](techgarden:package:npm:drizzle-orm) for a great ORM.
```

Renderer parses `techgarden:` links and makes them interactive.

---

## Additional Notes

### Design Principles

- **Markdown-native** - Store as markdown, render as HTML
- **Progressive enhancement** - Works as plain text if editor fails
- **Consistent rendering** - Same markdown renders the same everywhere
- **Lightweight** - Don't need a heavy WYSIWYG editor

### Editor Component

Likely implementation:
- Textarea with toolbar for common formatting
- Autocomplete dropdown for @mentions
- Split or toggle preview pane
- Mobile: simplified toolbar, full-screen edit mode

### Mention Resolution

When rendering, mentions need to resolve:
1. Parse `techgarden:package:npm:drizzle-orm` format
2. Look up entity (may not exist anymore)
3. Render as link with entity name, or "deleted" state if gone
