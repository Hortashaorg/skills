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

## MVP Scope

### Phase 1: Foundation (Current)

**Focus**: Data curation - fetch, store, tag, and browse packages

**Package Sources**: npm only (validate data model before expanding)

**Package Data**:
- Basic metadata: name, description, versions, source registry
- Dependencies: enable package linking and relationship analysis

**Tagging**: Admin-only to ensure quality (transition to community tagging later)

**Features**:
- Fetch npm packages via API
- Store package metadata and dependencies
- Browse packages with search and filtering
- Tag packages (admin users only)
- View package details and dependency graphs

### Phase 2: Community Features

- User XP and contribution tracking
- Leaderboards for package experts
- Tag voting and suggestions
- Q&A system for package-specific help

### Phase 3: Insights & Discovery

- Project creation with tech stack selection
- Package recommendation engine
- Similar project discovery
- Usage pattern analysis

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
- **Community-driven growth**: Enable users to contribute and improve data
- **Simple to complex**: Start with core features, add depth over time
- **Real-time collaboration**: Zero enables live updates across users
- **Rewarding contributions**: Gamification that encourages high-quality participation
