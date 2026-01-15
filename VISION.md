# TechGarden Vision

A place for engineers to architect in public - built on concrete, linked technology data.

## Core Concept

Technology discussions are abstract. "We chose Drizzle over Prisma" is just words until you click through and understand what those things actually are, what ecosystems they belong to, how they compare.

TechGarden solves this by providing **foundational data** (packages and ecosystems) that everything else links to. When you mention a technology, you're not writing text - you're pointing at a real thing with real data.

### Two-Layer Model

**Foundation (concrete, curated):**
- **Packages** - aggregated from npm, jsr, nuget, homebrew, archlinux, dockerhub
- **Ecosystems** - product/technology identities (React, AWS, TalosOS) containing related packages

**Value layer (user-generated, links to foundation):**
- **Projects** - your stack, linked to packages and ecosystems
- **Comparisons** - "which ORM?" with concrete package references
- **Decision records** - why you chose what you chose, linked to real entities
- **Discussions** - grounded in specific packages, ecosystems, or projects

Every artifact is shareable. Every mention is a link. The more people use it, the richer the connections become.

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

- **Follow what matters**: Follow packages or ecosystems to get notified of new versions or updates. Not social following - relevant updates only.
- **Per-package leaderboards**: "Top React helper", "Top Express expert" - recognition for helping others with specific technologies
- **Contribution tracking**: Score users for curation work (tagging, voting, suggesting)
- **Public profiles**: Showcase your projects, expertise areas, and contribution history

### Project Discovery

- **Public by default**: Projects are shared - show off your stack, discover what others are building
- **Tech stack exploration**: See what packages others are using together, find projects using specific packages
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

### Phase 5: Ecosystems (Current)

- Ecosystems (React, AWS, TalosOS) - product/technology identities containing related packages
- Community-curated ecosystem suggestions and package associations
- Project-ecosystem linking (declare "I use Azure" not just individual packages)
- Per-package leaderboards (recognize package experts)

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
