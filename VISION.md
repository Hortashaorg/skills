# TechGarden Vision

A place for engineers to learn, contribute, and grow - built around high-quality package data.

## Core Concept

TechGarden is a community built around the technology ecosystem. Packages are the foundation - aggregated from npm, jsr, nuget, homebrew, archlinux, dockerhub, and more - but the real value is what grows on top: engineers learning together, curating knowledge, and building their presence through meaningful contributions.

Think of it as a garden where both technology knowledge and the people cultivating it can grow.

## For Engineers

- **Learn the ecosystem**: Understand how packages relate, what tools exist for different use cases, and how technologies fit together
- **Contribute meaningfully**: Curate packages, help others in discussions, share your knowledge - work that matters beyond just code
- **Build your presence**: Your contributions are visible. Become known for the technologies you understand deeply
- **Explore projects**: Organize your own stack, see how others build theirs, discover new tools

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

- **Cultivate a learning culture**: Good engineers are open-minded, share opinions freely, ask questions comfortably, and discuss constructively without ego. Reward curiosity and helpfulness. No downvotes, no gatekeeping, no punishment mechanics.
- **Content has context**: All discussions and contributions are anchored to packages, categories, or projects. No posting into the void. This keeps the platform focused and conversations relevant.
- **Solo-first features**: Build things that work without needing other users first
- **Data quality over quantity**: Curated and validated information
- **Explore before optimizing**: Build features, see what's valuable, iterate
- **Real-time collaboration**: Zero enables live updates across users
- **Community features when there's a community**: Defer heavy engagement until there's critical mass
