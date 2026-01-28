# Paradigms

> Design approaches and thinking patterns - how software is structured and built.

---

## Scope

### Core
- [ ] Paradigms entity (name, slug, description)
- [ ] Package-paradigm relationships (uses, enables)
- [ ] Community curation via suggestion system
- [ ] Paradigms browsing

### Future
- [ ] Paradigm relationships (FP is subset of Declarative)
- [ ] Language associations (Haskell → Functional, Java → OOP)

---

## User Stories

### Developer Exploring

- **As a developer**, I want to find packages that embrace functional programming, so I can build in a style I prefer.
- **As a developer**, I want to see what paradigm a framework encourages, so I know if it fits my team.

### Team Lead Hiring

- **As a team lead**, I want to describe our codebase's paradigm, so candidates understand what we value.
- **As a team lead**, I want to find developers experienced in reactive programming, so they fit our architecture.

### Cross-Feature Integration

**With Packages:**
- Packages link to paradigms they use or enable
- "RxJS enables Reactive", "Ramda uses Functional"

**With Projects:**
- Projects could declare paradigm preferences (less concrete than regulations)

**With Comparisons:**
- "I chose Zustand over Redux because it's less opinionated about paradigm"

---

## Purpose

Paradigms are **design approaches** - ways of thinking about and structuring software.

Examples:
- **Programming paradigms**: Functional, Object-Oriented, Procedural, Declarative, Imperative
- **Architectural patterns**: Reactive, Event-Driven, Actor Model
- **Design philosophies**: Domain-Driven Design, Clean Architecture, Hexagonal

Key characteristics:
- **Conceptual** - Not a spec you implement, a style you follow
- **Influences tool choice** - FP developers prefer different tools than OOP developers
- **Team culture** - "We're a functional programming team" is meaningful

This is the fuzziest of the three new entity types. Unlike standards (has a spec) and regulations (has legal text), paradigms are more about style and philosophy. They may prove less useful - that's okay, we can drop them if so.

Potential value:
- "Find state management libraries that embrace functional programming"
- "What paradigm does this framework encourage?"
- "We're hiring for a reactive programming role"

See also: [Standards](./Foundational-Standards.md) for voluntary specifications, [Regulations](./Foundational-Regulations.md) for legal requirements.

---

## Data Model

```
paradigms
  - id: uuid
  - name: string - "Functional Programming", "Object-Oriented", "Reactive"
  - slug: string - URL-friendly identifier
  - description: string?
  - createdAt: timestamp
  - updatedAt: timestamp

packageParadigms
  - id: uuid
  - packageId: uuid (FK)
  - paradigmId: uuid (FK)
  - relationship: enum - uses, enables
  - createdAt: timestamp

  Unique constraint: (packageId, paradigmId)
```

### Relationships

```
paradigms
├── packageParadigms (many) → packages
└── suggestions (many) - curation suggestions
```

### Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| `uses` | Package is built using this paradigm | Ramda uses Functional |
| `enables` | Package helps you work in this paradigm | RxJS enables Reactive |

---

## Additional Notes

### Why This Might Not Work

Paradigms are subjective. Is React functional? Object-oriented? Both? People disagree.

Unlike standards ("implements OAuth" is verifiable) and regulations ("complies with GDPR" is auditable), paradigm associations are opinion-based.

If curation becomes contentious or the data isn't useful, this entity type can be dropped.

### Small, Curated Set

Keep the paradigm list small:
- Functional Programming
- Object-Oriented Programming  
- Reactive Programming
- Event-Driven
- Declarative
- Domain-Driven Design

Avoid getting too granular (no need for "Monadic Programming" as separate from Functional).

### Validation Signal

If after implementation:
- People find paradigm filters useful → keep it
- Curation is contentious or data is sparse → drop it

This is explicitly experimental compared to Standards and Regulations.
