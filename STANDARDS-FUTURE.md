# Standards Support (Future Consideration)

## The Problem

TechGarden focuses on installable packages (npm, jsr, brew, apt-get), but developers also work with **standards** that aren't installable:

- **Language specs**: ECMAScript, TypeScript
- **Protocols**: HTTP, WebSocket, TLS, OAuth
- **Accessibility**: WCAG, ARIA
- **Formats**: JSON, XML, YAML, OpenAPI
- **Observability**: OpenTelemetry, OpenMetrics
- **Standards bodies**: IEEE, IETF, W3C, TC39, CNCF

These are foundational to understanding technology relationships but don't fit the package model.

## Why Standards Are Different

| Aspect | Packages (npm, brew) | Standards (ECMAScript, WCAG) |
|--------|---------------------|------------------------------|
| **Source** | Registry APIs (automated) | Community curation (manual) |
| **Versioning** | SemVer, sequential releases | Spec versions, edition years |
| **Dependencies** | Other packages | Other standards (sometimes) |
| **Installable** | Yes | No (implemented by tools) |
| **Governance** | Maintainers | Standards bodies (TC39, W3C) |

## Proposed Data Model

### Standards Table

Core entity for specifications and standards:

```typescript
{
  id: string;                    // "ecmascript", "wcag", "opentelemetry"
  name: string;                  // "ECMAScript", "WCAG", "OpenTelemetry"

  // Governing body
  organization: string;          // "TC39", "W3C", "CNCF", "IETF", "IEEE"
  organizationUrl?: string;

  // Metadata
  type: "language" | "protocol" | "accessibility" | "format" | "other";
  description: string;
  specUrl?: string;              // Link to spec document

  // Versioning (flexible - some use years, some use numbers)
  currentVersion?: string;       // "ES2024", "WCAG 2.2", "1.0"
  versioningScheme?: "year" | "semver" | "custom" | "living";

  // Relationships
  relatedStandards?: string[];   // IDs of other standards

  createdAt: number;
  updatedAt: number;
}
```

### Standard Versions (Optional)

For standards with meaningful version tracking:

```typescript
{
  id: string;                    // "ecmascript-2020", "wcag-2.2"
  standardId: string;            // Foreign key to standards
  version: string;               // "2020", "2.2", "3.1"
  releaseDate?: number;
  specUrl?: string;
  deprecated?: boolean;

  createdAt: number;
  updatedAt: number;
}
```

### Package-Standard Relationships

Many-to-many linking with relationship types:

```typescript
{
  packageId: string;             // "express", "nodejs"
  standardId: string;            // "ecmascript"
  standardVersionId?: string;    // "ecmascript-2020" (if specific)

  // Relationship type
  relationship:
    | "implements"               // Node.js implements ECMAScript
    | "supports"                 // Express supports OpenTelemetry
    | "complies"                 // Axe-core complies with WCAG 2.2
    | "uses"                     // Hono uses HTTP/2

  // Community curation
  confidence?: "verified" | "claimed" | "inferred";
  votes?: number;

  createdAt: number;
  updatedAt: number;
}
```

## Example Data

**ECMAScript Standard:**
```json
{
  "id": "ecmascript",
  "name": "ECMAScript",
  "organization": "TC39",
  "organizationUrl": "https://tc39.es/",
  "type": "language",
  "description": "JavaScript language specification",
  "currentVersion": "ES2024",
  "versioningScheme": "year",
  "specUrl": "https://tc39.es/ecma262/"
}
```

**Specific Version:**
```json
{
  "id": "ecmascript-2020",
  "standardId": "ecmascript",
  "version": "2020",
  "releaseDate": 1591660800000,
  "specUrl": "https://262.ecma-international.org/11.0/"
}
```

**Package Relationship:**
```json
{
  "packageId": "nodejs-20",
  "standardId": "ecmascript",
  "standardVersionId": "ecmascript-2020",
  "relationship": "implements",
  "confidence": "verified"
}
```

## Use Cases Enabled

### Discovery
- "Show me all packages that implement ECMAScript 2020"
- "Find packages that comply with WCAG 2.2"
- "Which packages support OpenTelemetry?"

### Package Pages
- Display badges: "Implements ECMAScript 2022", "Complies with WCAG 2.1"
- Show standard relationships alongside dependencies

### Ecosystem Analysis
- "Node.js 20 supports ES2022, Node.js 18 supports ES2021"
- Track standard adoption across packages
- Identify compliance gaps

### Search & Filtering
- Filter packages by standard support
- Find all accessibility-compliant UI libraries
- Discover observability-ready frameworks

## Key Design Principles

**1. Manual Curation**
- Small, high-value set (< 200 standards realistically)
- Community/admin contributors add standards
- Quality over quantity

**2. Flexible Versioning**
- Some standards have versions (ECMAScript, WCAG)
- Some don't (HTML living standard)
- Version tracking is optional

**3. Community-Driven Relationships**
- Users claim "Express supports OpenTelemetry"
- Community votes to verify accuracy
- Confidence levels track verification state

**4. Governance Transparency**
- Link to standards bodies
- Link to spec documents
- Show current version and history

## Implementation Phases

**Phase 1 (MVP):** Skip entirely
- Use tags like `standard:ecmascript` if needed
- Focus on package curation

**Phase 2-3:** Core standards support
- Add `standards` table
- Add `package_standards` relationships
- Admin-only curation

**Phase 4:** Community curation
- User-submitted standard relationships
- Voting and verification
- Standard version tracking

## Why Later, Not Now

1. **MVP focuses on packages** - validate core model first
2. **Standards are manually curated** - need community infrastructure
3. **Relationship quality matters** - requires voting/verification system
4. **Small but important set** - can be added incrementally

## Integration Points

Standards layer naturally on top of existing architecture:
- **Tags**: Can promote structural tags to standards later
- **Packages**: Add relationships via new table (non-breaking)
- **Community**: Leverage existing voting/contribution system
- **Search**: Extend filters to include standard compliance

## Future Considerations

- **Standard dependencies**: Some standards build on others (CSS imports HTML)
- **Browser/runtime compatibility**: Which versions support which standards
- **Compliance tooling**: Link to validators, linters, testing tools
- **Standard evolution**: Track proposals, draft stages, deprecated versions
