# Regulations

> Legally-enforced requirements - compliance constraints for projects.

---

## Scope

### Core
- [ ] Regulations entity (name, authority, jurisdiction, specUrl)
- [ ] Package-regulation relationships (complies, helps_comply)
- [ ] Project-regulation relationships (must_comply)
- [ ] Community curation via suggestion system
- [ ] Regulations browsing and search

### Future
- [ ] Jurisdiction-based recommendations ("You're in Norway, these apply")
- [ ] Applicability rules (public sector, healthcare, finance)

---

## User Stories

### Developer with Compliance Requirements

- **As a developer**, I want to mark my project as needing GDPR compliance, so I track this constraint.
- **As a developer**, I want to find packages that help with GDPR compliance, so I can meet requirements.
- **As a developer**, I want to see what regulations a package is compliant with, so I know it fits my constraints.

### Developer Discovering Requirements

- **As a developer**, I want to browse regulations by jurisdiction, so I know what applies to my situation.
- **As a developer**, I want to understand what a regulation requires, so I can evaluate if it applies to me.

### Cross-Feature Integration

**With Packages:**
- Packages link to regulations they comply with or help comply with
- "Auth0 complies with SOC2", "this GDPR library helps you comply"

**With Projects:**
- Projects can declare regulation constraints
- "This project must comply with GDPR" - a hard requirement, not optional

**With Comparisons:**
- "I chose X over Y because X is SOC2 compliant"

**With Curation:**
- Regulations curated via suggestion system
- Package-regulation relationships community-verified

---

## Purpose

Regulations are **legally-enforced requirements** - they're not optional if they apply to you.

Examples:
- **Privacy**: GDPR (EU), CCPA (California), PIPEDA (Canada)
- **Healthcare**: HIPAA (USA), HITECH (USA)
- **Finance**: PCI-DSS (global), SOX (USA)
- **Accessibility**: ADA (USA), Universell Utforming (Norway)
- **Security**: SOC2, ISO 27001, FedRAMP (USA)

Key characteristics:
- **Enforced by an authority** - Government, regulatory body
- **Jurisdiction-specific** - GDPR applies in EU, HIPAA in USA
- **Mandatory when applicable** - Not a choice, a legal requirement
- **Has a specification** - Legal text you can read

Unlike standards (voluntary adoption), regulations carry legal weight. Your project might be *required* to comply.

This enables valuable queries:
- "My project is for Norwegian public sector - what must I comply with?"
- "Find authentication packages that are SOC2 compliant"
- "What regulations apply to healthcare apps in the USA?"

See also: [Standards](./Foundational-Standards.md) for voluntary specifications, [Paradigms](./Foundational-Paradigms.md) for design approaches.

---

## Data Model

```
regulations
  - id: uuid
  - name: string - "GDPR", "HIPAA", "SOC2"
  - slug: string - URL-friendly identifier
  - authority: string - "European Union", "U.S. Department of HHS"
  - authorityUrl: string - Link to authority
  - description: string?
  - specUrl: string? - Link to legal text or summary
  - jurisdiction: string? - "EU", "USA", "Norway", "Global"
  - applicability: string? - "healthcare", "finance", "public_sector", "consumer_data"
  - createdAt: timestamp
  - updatedAt: timestamp

packageRegulations
  - id: uuid
  - packageId: uuid (FK)
  - regulationId: uuid (FK)
  - relationship: enum - complies, helps_comply
  - createdAt: timestamp

  Unique constraint: (packageId, regulationId)

projectRegulations
  - id: uuid
  - projectId: uuid (FK)
  - regulationId: uuid (FK)
  - createdAt: timestamp

  Unique constraint: (projectId, regulationId)
```

### Relationships

```
regulations
├── packageRegulations (many) → packages
├── projectRegulations (many) → projects
└── suggestions (many) - curation suggestions
```

### Relationship Types (Package)

| Type | Meaning | Example |
|------|---------|---------|
| `complies` | Package itself is certified/compliant | Auth0 complies with SOC2 |
| `helps_comply` | Package helps you achieve compliance | GDPR consent library helps comply with GDPR |

---

## Additional Notes

### Regulations vs Standards

| Aspect | Standards | Regulations |
|--------|-----------|-------------|
| Defined by | Standards bodies | Governments/Authorities |
| Adoption | Voluntary | Mandatory (when applicable) |
| Enforcement | None | Legal penalties |
| Scope | Technical | Legal/Compliance |

### Jurisdiction Complexity

Some regulations apply globally (PCI-DSS for payment processing), some are jurisdiction-specific (GDPR in EU), some have overlapping applicability. The data model is intentionally simple - complex jurisdiction logic is future work.

### Project Constraints

When a project declares "must comply with GDPR", this is a **constraint** - not the same as adding a package or ecosystem. It affects what choices are valid for that project.
