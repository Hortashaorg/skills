# TechGarden Vision

A place for engineers to architect in public - built on concrete, linked technology data.

> **Detailed documentation:** Feature specifications, data models, and implementation status are in this folder.

## Core Concept

Technology discussions are abstract. "We chose Drizzle over Prisma" is just words until you click through and understand what those things actually are, what ecosystems they belong to, how they compare.

TechGarden solves this by providing **foundational data** (packages and ecosystems) that everything else links to. When you mention a technology, you're not writing text - you're pointing at a real thing with real data.

### Two-Layer Model

TechGarden separates **foundational data** from **user-generated content**. This distinction is fundamental to how the platform works.

**Foundation Layer (objective, community-curated):**

Facts about the world that engineers need to reference. Curated collaboratively through democratic consensus - no single person owns this data, everyone helps maintain it.

- **[Packages](./Foundational-Packages.md)** - aggregated from npm, jsr, nuget, homebrew, archlinux, dockerhub
- **[Ecosystems](./Foundational-Ecosystems.md)** - product/technology identities (React, AWS, TalosOS) containing related packages
- **[Tags](./Foundational-Tags.md)** - domain classification (UI, Testing, CI/CD, Observability)
- **[Curation](./Foundational-Curation.md)** - suggestion system, voting, contribution scoring
- **[Standards](./Foundational-Standards.md)** (future) - voluntary specifications (OpenAPI, ECMA, WCAG)
- **[Regulations](./Foundational-Regulations.md)** (future) - legal requirements (GDPR, HIPAA, SOC2)
- **[Paradigms](./Foundational-Paradigms.md)** (future) - design approaches (Functional, OOP, Reactive)

Foundation data is:
- **Objective** - facts, not opinions
- **Collaboratively curated** - suggestions require community votes to be accepted
- **Carefully maintained** - quality over quantity, accuracy matters
- **Linked everywhere** - everything else references this layer

**Value Layer (subjective, user-generated):**

Content created by individuals that references foundation data. Personal expression anchored to concrete entities.

- **[Projects](./Feature-Projects.md)** - your stack, linked to packages and ecosystems
- **[Comparisons](./Feature-Comparisons.md)** - "which ORM?" with concrete package references
- **[Rich Text](./Feature-RichText.md)** (future) - markdown editor with entity mentions
- **[Issues](./Feature-Issues.md)** (future) - Q&A grounded in packages and ecosystems
- **[User Profiles](./Feature-UserProfiles.md)** (future) - public presence, activity, expertise signals

Value layer content is:
- **Subjective** - opinions, experiences, choices
- **Individually owned** - you create and control your content
- **Anchored to foundation** - always references concrete entities
- **Shareable** - every artifact has a URL worth sharing

The foundation makes the value layer meaningful. "We chose Drizzle" is just text. "We chose @drizzle from the @typescript ecosystem because..." is grounded, clickable, discoverable.

## For Engineers Who Architect in Public

- **Share your stack**: Create a project, link your packages and ecosystems, share the URL
- **Document decisions**: "We chose @drizzle over @prisma because..." - concrete, clickable, always current
- **Curate ecosystems**: "Here's everything in the @kubernetes ecosystem" - help others navigate complexity
- **Compare options**: Build comparisons others can reference when making their own choices
- **Build your presence**: Your contributions are visible. Become known for the technologies you understand deeply

You don't need a community to get value. Create something useful, share the link. The platform grows through artifacts worth sharing.

## Key Features

### Package Curation

- **Multi-source aggregation**: Fetch packages from npm, jsr, nuget, homebrew, archlinux, dockerhub, and other registries
- **Rich metadata**: Version history, descriptions, dependencies, maintainers, download stats, publish dates
- **Ecosystem context**: See which ecosystem a package belongs to and discover related packages across registries
- **Dependency mapping**: Visualize and analyze package relationships

### Tagging & Ecosystems

- **Community tagging**: Label packages with professional areas like "frontend", "backend", "tooling", "testing", "design"
- **Ecosystems**: Product/technology identities (React, AWS, Kubernetes, TalosOS) containing related packages, plugins, adapters, and tools - not always packages themselves
- **Quality control**: Voting system for suggestions to ensure accuracy
- **Multi-dimensional classification**: Packages can have tags AND belong to ecosystems

### Community & Engagement

- **Grounded discussions**: Comment on packages, ecosystems, projects - always anchored to real entities
- **Public profiles**: Showcase your projects, decisions, and contribution history
- **Contribution tracking**: Score users for curation work (tagging, voting, suggesting)
- **Follow what matters**: Follow packages or ecosystems for version and update notifications

### Projects & Decisions

- **Public by default**: Projects are shared - show off your stack, discover what others are building
- **Decision history**: Document why you added or removed packages - your reasoning preserved
- **Stack evolution**: See how projects change over time, not just current state
- **Import your stack**: Upload package.json to instantly visualize and categorize your existing projects

## Phases

### Phase 1: Foundation ✅

- Package search, browsing, and details (npm)
- User authentication (OAuth via Zitadel)
- Package requests with auto-queue dependencies
- Upvoting system
- Admin dashboard (tags, request management)
- Worker processing packages continuously

### Phase 2: Projects & Curation ✅

- Project creation and management
- Associate packages with projects
- Community curation system (suggestions, votes, contribution scoring)
- Curation leaderboard
- GDPR-compliant user data handling (deletion, anonymization)

### Phase 3: Identity & Discovery ✅

- Brand identity (TechGarden green accent, visual polish)
- SEO and discoverability (meta tags, sitemap, structured data)
- Homepage improvements (entry points, value proposition)

### Phase 4: Multi-Registry ✅

- Additional package sources: jsr, nuget, dockerhub, homebrew, archlinux
- Registry adapter pattern for easy expansion
- Cross-registry dependencies (jsr packages can depend on npm)

### Phase 5: Ecosystems ✅

- Ecosystems (React, AWS, TalosOS) - product/technology identities containing related packages
- Community-curated ecosystem suggestions and package associations
- Project-ecosystem linking (declare "I use Azure" not just individual packages)

### Phase 6: Projects Rework (Current)

Projects become decision visualization tools, not just stack lists.

- **Status types**: considering, using, deprecated, rejected - with custom display names
- **Optional notes**: Add context to any card using rich text with entity mentions
- **View modes**: Filter and group by status, ecosystem, or other properties
- **Quick and deep modes**: Add packages fast, or take time to document decisions
- **Shareable URLs**: URL reflects view state for sharing specific perspectives

### Phase 7: Rich Text & Entity Mentions

Foundational infrastructure for content across the platform.

- **Markdown editor**: GitHub-flavored markdown for notes, descriptions, issues
- **Entity mentions**: @package, @ecosystem, @project - clickable links to real entities
- **Preview mode**: See rendered content before saving
- **Mobile-friendly**: Touch-friendly editing experience

### Phase 8: Issues

Context-rich Q&A grounded in packages and ecosystems.

- **Package-linked questions**: "How do I do X with @drizzle?" - grounded, discoverable
- **Multiple answers**: Community provides solutions, best answers surface
- **Entity context**: Issues link to relevant packages and ecosystems
- **Better than Stack Overflow**: Questions automatically connected to technology data

### Phase 9: User Profiles

Public presence built from contributions.

- **Profile pages**: Activity feed, projects, contribution history
- **Expertise signals**: Technologies you've contributed to most
- **Public presence**: Your projects, issues, and curation work in one place

### Phase 10: Comparisons

User-generated technology comparisons - personal evaluations, not community-curated.

- **Personal comparisons**: Create your own "which ORM?" evaluations
- **Linked to packages**: Each comparison item references real packages/ecosystems
- **Shareable**: Share your research with others facing the same decision
- **Project integration**: Link comparisons to project cards to show your reasoning

## Technical Architecture

- **Frontend**: SolidJS + @rocicorp/zero for real-time sync
- **Backend**: Hono API server
- **Auth**: OAuth2 via Zitadel with refresh tokens
- **Database**: PostgreSQL with Zero's real-time queries/mutations
- **Data sources**: npm API (expandable to other registries)
- **Infra**: Kubernetes with OpenTelemetry observability

## Design Principles

- **Grounded in data**: Every mention links to a real entity. No abstract discussions - concrete references to packages, ecosystems, projects.
- **Solo-first value**: Build things that work without needing other users. One person creates, shares a link, others benefit.
- **Non-hostile by design**: Prevent toxicity through system design, not moderation.
  - No downvotes, no gatekeeping, no punishment mechanics
  - Curators don't choose what to review - random presentation prevents targeting
  - "Skip" option removes pressure to judge unfamiliar topics
  - Democratic consensus through voting, not individual power users
  - Gamify contribution to reward helpfulness, not criticism
- **Cultivate learning**: Good engineers are open-minded, share opinions freely, ask questions comfortably.
- **Content has context**: All contributions are anchored to packages, ecosystems, or projects. No posting into the void.
- **Data quality over quantity**: Curated and validated information through democratic review.
- **Explore before optimizing**: Build features, see what's valuable, iterate.
- **Real-time collaboration**: Zero enables live updates across users.
- **Community features when there's a community**: Defer heavy engagement until there's critical mass.
