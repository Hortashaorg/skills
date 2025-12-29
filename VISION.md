# TechGarden Vision

A community-driven technology ecosystem built on high-quality, curated package data.

## Core Concept

TechGarden aggregates package metadata from multiple sources (npm, jsr, brew, apt-get, etc.) and enables community-driven curation through tagging, linking, and insights. Think of it as a living garden where technology knowledge grows naturally through good foundational data.

## Key Features

### Package Curation

- **Multi-source aggregation**: Fetch packages from npm, jsr, brew, apt-get, and other registries
- **Rich metadata**: Version history, descriptions, dependencies, maintainers, download stats, publish dates
- **Cross-registry linking**: Connect equivalent packages across sources (e.g., "hono" on npm = "@hono/hono" on jsr)
- **Dependency mapping**: Visualize and analyze package relationships

### Tagging & Organization

- **Community tagging**: Label packages with categories like "database", "frontend", "styling", "devops"
- **Quality control**: Voting system for tag suggestions to ensure accuracy
- **Multi-dimensional classification**: Packages can have multiple tags for nuanced discovery

### Community & Gamification

- **XP system**: Earn experience points by solving community issues, tagging packages, and helping others
- **Leaderboards**: "For this package, this person has solved the most community issues"
- **Contribution tracking**: "This user has helped tag 100+ packages"
- **High-quality Q&A**: Stack Overflow-style but with better quality control

### Project Discovery

- **Tech stack comparison**: Define your project's technologies and find similar projects for inspiration
- **Package recommendations**: "People who use this package are also 67% likely to use this other package"
- **Ecosystem insights**: Analyze patterns across projects and package usage

## Why TechGarden?

- **Better data quality**: Curated, linked, and validated by community experts
- **Cross-ecosystem insights**: See connections between npm, jsr, brew, and more in one place
- **Reward contributors**: Recognize and gamify knowledge sharing
- **Discover hidden gems**: Find packages through relationships, not just search keywords

## Phases

### Phase 1: Foundation ✅

**Status**: Complete - [tech-garden.dev](https://tech-garden.dev) is live

- Package search, browsing, and details (npm)
- User authentication (OAuth)
- Package requests with auto-queue dependencies
- Upvoting system
- Admin dashboard (tags, request management)
- Worker processing packages continuously

### Phase 2: Projects (Current)

**Focus**: Explore what value emerges from letting users create projects with package selections

- Project creation and management
- Associate packages with projects
- Discover what metadata/relations become useful through experimentation
- GDPR-compliant user data handling

This phase is exploratory - build the foundation and iterate based on what we learn.

### Phase 3: Engagement (Deferred)

**Requires**: Active user base to be meaningful

- User XP and contribution tracking
- Leaderboards for package experts
- Tag voting and suggestions
- Q&A system for package-specific help

Deferred until there's a community to engage with these features.

### Phase 4: Expansion

- Additional package sources (jsr, brew, apt-get)
- Cross-registry package linking
- Advanced analytics and visualizations
- API for third-party integrations

## Technical Architecture

- **Frontend**: SolidJS + @rocicorp/zero for real-time sync
- **Backend**: Hono API server
- **Auth**: OAuth2 with refresh tokens
- **Database**: PostgreSQL with Zero's real-time queries/mutations
- **Data sources**: npm API (expandable to other registries)

## Design Principles

- **Data quality over quantity**: Curated and validated information
- **Explore before optimizing**: Build features, see what's valuable, iterate
- **Solo-first features**: Build things that work without needing other users first
- **Real-time collaboration**: Zero enables live updates across users
- **Community features when there's a community**: Defer gamification until there's critical mass
