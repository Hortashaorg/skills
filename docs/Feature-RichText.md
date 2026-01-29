# Rich Text

> Markdown as source of truth - rendered with your brand, optionally edited with rich tooling.

---

## Scope

### Core (Renderer)
- [ ] Markdown → HTML renderer
- [ ] TechGarden styling (typography, colors, spacing)
- [ ] GitHub Flavored Markdown (tables, strikethrough, task lists)
- [ ] Syntax-highlighted code blocks
- [ ] Entity mention rendering (special styling for internal links)

### Core (Editor)
- [ ] Textarea with markdown input
- [ ] Preview mode (toggle or side-by-side)
- [ ] Toolbar for common formatting (optional, helps non-markdown users)
- [ ] Entity mention insertion (`/package`, `/ecosystem`, etc.)
- [ ] Mobile-friendly

### Extended Rendering (Future)
- [ ] Mermaid diagrams
- [ ] KaTeX math
- [ ] Custom callout blocks (`:::warning`, `:::info`)
- [ ] Image uploads

### Integration Points
- [ ] Project notes (per-item notes, project description)
- [ ] Issues (question/answer content)
- [ ] User profile bio
- [ ] Comparison notes

---

## Architecture

### Markdown-First

```
┌─────────────────────────────────────────────────────┐
│                  Markdown (stored)                   │
│  "Check out [drizzle](/package/npm/drizzle-orm)..." │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Renderer (your plugins)                 │
│  - GFM tables                                        │
│  - Syntax highlighting                               │
│  - Entity link recognition                           │
│  - Mermaid, KaTeX (future)                          │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│               HTML (displayed)                       │
│  - TechGarden typography                             │
│  - Branded code blocks                               │
│  - Interactive entity chips                          │
└─────────────────────────────────────────────────────┘
```

### Why Markdown as Source

| Benefit | Detail |
|---------|--------|
| Portable | Works everywhere, not locked to any editor |
| Readable | Raw content makes sense without rendering |
| Diffable | Git-friendly, easy to see changes |
| Extensible | Add renderer plugins anytime |
| Future-proof | Not tied to editor library's JSON format |

### The Editor is Optional

Users can:
1. Write raw markdown in a textarea (power users)
2. Use rich toolbar that generates markdown (convenience)
3. Use `/command` to insert entities without knowing URLs

All three produce the same markdown output.

---

## User Stories

### Developer Writing

- **As a developer**, I want to write markdown directly, so I have full control.
- **As a developer**, I want toolbar buttons for formatting, so I don't need to remember syntax.
- **As a developer**, I want to type `/package` and search, so I can link to entities without knowing URLs.
- **As a developer**, I want to preview before saving, so I know how it will look.

### Developer Reading

- **As a developer**, I want content styled with TechGarden branding, so it feels cohesive.
- **As a developer**, I want entity mentions to be visually distinct and clickable.
- **As a developer**, I want code blocks with syntax highlighting, so code is readable.
- **As a developer**, I want to see diagrams inline (mermaid), so technical docs are clear.

---

## Features

### Markdown Renderer

**What:** Configurable pipeline that transforms markdown → HTML with plugins.

**Plugins:**
- GitHub Flavored Markdown (tables, strikethrough, autolinks)
- Syntax highlighting for code blocks
- Entity link recognition and styling
- Mermaid diagram rendering (future)
- KaTeX math rendering (future)

**Why:** One renderer, used everywhere. Your brand, your rules.

### Entity Mentions

**What:** Standard markdown links with internal URL pattern.

```markdown
Check out [drizzle-orm](/package/npm/drizzle-orm) for a great ORM.
```

**Rendered as:** Styled chip/link with package icon, hover card with details.

**Why:** No special syntax needed. Standard links that your renderer recognizes.

### Mention Insertion (`/command`)

**What:** Type `/package`, get a search popup, select entity, markdown link inserted.

| Trigger | Searches | Inserts |
|---------|----------|---------|
| `/package` | Packages | `[name](/package/registry/name)` |
| `/ecosystem` | Ecosystems | `[name](/ecosystem/slug)` |
| `/project` | Your projects | `[name](/project/id)` |
| `/user` | Users | `[name](/user/username)` |

**Why:** Easy entity linking without knowing URLs. Keyboard-friendly.

### Editor Modes

**Textarea + Preview:**
```
┌────────────────────┬────────────────────┐
│ # My note          │ My note            │
│                    │ ═══════            │
│ Some **bold** text │ Some bold text     │
│                    │                    │
│ [Edit]             │ [Preview]          │
└────────────────────┴────────────────────┘
```

**Or toggle between edit/preview (mobile-friendly).**

### Toolbar (Optional)

For users who don't know markdown:

| Button | Inserts |
|--------|---------|
| **B** | `**selection**` |
| *I* | `*selection*` |
| `</>` | `` `selection` `` or code block |
| 🔗 | `[text](url)` |
| H1/H2 | `# ` / `## ` |
| • | `- ` |

Toolbar generates markdown, not a separate format.

---

## Data Model

Stored as plain markdown strings:

```
# No new tables - markdown is a field type

projects.description: text (markdown)
projectPackages.note: text (markdown)
issues.content: text (markdown)
issueAnswers.content: text (markdown)
accounts.bio: text (markdown)
comparisons.description: text (markdown)
comparisonItems.notes: text (markdown)
```

### Entity Link Format

Standard markdown links with internal paths:

```markdown
[drizzle-orm](/package/npm/drizzle-orm)
[React](/ecosystem/react)
[My Stack](/project/abc-123)
[@username](/user/username)
```

Renderer recognizes these patterns and applies special styling.

---

## Technical Approach

### Build vs Use

| Component | Approach | Why |
|-----------|----------|-----|
| **Markdown parser** | Use library | Solved problem, don't reinvent |
| **Renderer pipeline** | Use library | remark/rehype ecosystem is modular |
| **Syntax highlighting** | Use library | highlight.js or shiki |
| **Entity link styling** | Build | Custom to TechGarden |
| **`/command` insertion** | Build | Custom UX, simple implementation |
| **Toolbar** | Build | Simple, just inserts text |
| **Mermaid/KaTeX** | Use plugins | Existing remark plugins |

### Likely Stack

```
remark (parse markdown)
  → remark-gfm (tables, etc.)
  → remark-rehype (convert to HTML AST)
  → rehype-highlight (code highlighting)
  → rehype-stringify (output HTML)
  → custom plugin (entity link styling)
```

### Editor Component

Simple implementation:
1. `<textarea>` for input
2. Render preview with markdown pipeline
3. Toolbar buttons that insert text at cursor
4. `/command` detection + popup for entity search

No heavy editor library needed for MVP.

---

## Open Questions

**Preview style:**
- Toggle (edit or preview)?
- Side-by-side (both visible)?
- Live preview (WYSIWYG-ish)?

**Mobile editing:**
- Simplified toolbar?
- Full-screen edit mode?

**Image uploads:**
- Where to store? (Minio?)
- Paste to upload?
- Drag and drop?

---

## Design Principles

- **Markdown is the source of truth** - Never store rendered HTML
- **Renderer is brandable** - Your typography, your code theme, your entity styling
- **Editor is a convenience** - Power users can write raw markdown
- **Progressive enhancement** - Basic textarea works, rich features layer on top
- **Extensible** - Add Mermaid, KaTeX, custom blocks via plugins
