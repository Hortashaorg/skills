# Standards

> Voluntary specifications defined by standards bodies - technical choices packages can implement.

---

## Scope

### Core
- [ ] Standards entity (name, slug, organization, spec URL, domain)
- [ ] Package-standard relationships (implements, supports)
- [ ] Community curation via suggestion system
- [ ] Standards browsing and search

### Future
- [ ] Version tracking (ES2024, WCAG 2.2)
- [ ] Standard-to-standard relationships (OAuth 2.1 supersedes OAuth 2.0)

---

## User Stories

### Developer Searching

- **As a developer**, I want to find packages that implement OpenTelemetry, so I can add observability to my stack.
- **As a developer**, I want to see what standards a package supports, so I know its compatibility.

### Developer Filtering

- **As a developer**, I want to filter packages by WCAG support, so I can find accessible UI libraries.

### Cross-Feature Integration

**With Packages:**
- Packages link to standards they implement/support
- Package pages show standard badges

**With Ecosystems:**
- Ecosystems might relate to standards (React ecosystem implements JSX)

**With Curation:**
- Standards curated via suggestion system (like ecosystems)
- Package-standard relationships proposed and voted on

---

## Purpose

Standards are **voluntary specifications defined by standards bodies** - they're foundational but not installable.

Examples:
- **Language specs**: ECMAScript (ECMA), TypeScript (Microsoft)
- **Protocols**: HTTP (IETF), OAuth (IETF), OpenID Connect (OpenID Foundation)
- **Accessibility**: WCAG (W3C), ARIA (W3C)
- **Formats**: JSON (ECMA), OpenAPI (OpenAPI Initiative), GraphQL (GraphQL Foundation)
- **Observability**: OpenTelemetry (CNCF), OpenMetrics (CNCF)

Key characteristics:
- **Defined by a standards body** - ECMA, W3C, IETF, CNCF, etc.
- **Voluntary adoption** - You choose to implement them
- **Has a specification** - A document you can read and reference

Unlike packages (fetched from registries), standards are manually curated. The set is small but important.

Standards enable queries packages can't answer alone:
- "Which packages implement OpenTelemetry?"
- "What ORMs support the Prisma query format?"
- "Find libraries that follow WCAG guidelines"

See also: [Regulations](./Foundational-Regulations.md) for legally-enforced requirements, [Paradigms](./Foundational-Paradigms.md) for design approaches.

---

## Data Model

```
standards
  - id: uuid
  - name: string - "ECMAScript", "OpenTelemetry", "WCAG"
  - slug: string - URL-friendly identifier
  - organization: string - "ECMA International", "W3C", "CNCF"
  - organizationUrl: string - Link to standards body
  - description: string?
  - specUrl: string? - Link to spec document
  - domain: string? - "accessibility", "observability", "api_design"
  - createdAt: timestamp
  - updatedAt: timestamp

packageStandards
  - id: uuid
  - packageId: uuid (FK)
  - standardId: uuid (FK)
  - relationship: enum - implements, supports
  - createdAt: timestamp

  Unique constraint: (packageId, standardId)
```

### Relationships

```
standards
├── packageStandards (many) → packages
└── suggestions (many) - curation suggestions
```

### Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| `implements` | Core implementation of the standard | Node.js implements ECMAScript |
| `supports` | Works with / integrates with | Express supports OpenTelemetry |

---

## Additional Notes

### Why Standards Are Different from Packages

| Aspect | Packages | Standards |
|--------|----------|-----------|
| Source | Registry APIs (automated) | Manual curation |
| Installable | Yes | No |
| Versioning | SemVer | Varies (years, editions, living) |
| Governance | Maintainers | Standards bodies |

### Small, Curated Set

Standards aren't meant to be exhaustive. Focus on standards that:
- Developers actually search for
- Help differentiate packages
- Have meaningful compliance/support levels

### Curation Pattern

Same suggestion system as ecosystems:
- Suggest new standards (admin-heavy initially)
- Suggest package-standard relationships (community-driven)
- Vote to verify accuracy
