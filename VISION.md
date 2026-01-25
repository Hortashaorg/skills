# TechGarden Vision

A place for engineers to architect in public - built on concrete, linked technology data.

## Core Concept

Technology discussions are abstract. "We chose Drizzle over Prisma" is just words until you click through and understand what those things actually are, what ecosystems they belong to, how they compare.

TechGarden solves this by providing **foundational data** (packages and ecosystems) that everything else links to. When you mention a technology, you're not writing text - you're pointing at a real thing with real data.

### Two-Layer Model

TechGarden separates **foundational data** from **user-generated content**. This distinction is fundamental to how the platform works.

**Foundation Layer (objective, community-curated):**

Facts about the world that engineers need to reference. Curated collaboratively through democratic consensus - no single person owns this data, everyone helps maintain it.

- **Packages** - aggregated from npm, jsr, nuget, homebrew, archlinux, dockerhub
- **Ecosystems** - product/technology identities (React, AWS, TalosOS) containing related packages
- **Standards** (future) - specifications like OpenAPI, GraphQL, JSON Schema
- **Regulations** (future) - compliance requirements like GDPR, SOC2, HIPAA that affect technology choices

Foundation data is:
- **Objective** - facts, not opinions
- **Collaboratively curated** - suggestions require community votes to be accepted
- **Carefully maintained** - quality over quantity, accuracy matters
- **Linked everywhere** - everything else references this layer

**Value Layer (subjective, user-generated):**

Content created by individuals that references foundation data. Personal expression anchored to concrete entities.

- **Projects** - your stack, linked to packages and ecosystems
- **Comparisons** - "which ORM?" with concrete package references
- **Decision records** - why you chose what you chose, linked to real entities
- **Discussions** - grounded in specific packages, ecosystems, or projects
- **Articles/Guides** (future) - tutorials and explanations referencing real packages
- **Courses** (future) - learning paths through ecosystems

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

### Phase 6: Projects & Decision History (Current)

Projects become more than a stack list - they tell the story of your technology decisions.

- **Decision records**: Document why you added or removed each package
- **Change history**: Timeline of stack evolution with reasoning
- **Shareable narratives**: "Here's my stack AND how it evolved"
- **Import with context**: Add packages from package.json, annotate decisions later

### Phase 7: Discussions & Commentary

Foster grounded technical discussion anchored to real entities.

- **Markdown editor**: GitHub-flavored markdown for rich content
- **Entity references**: @mention packages, ecosystems, projects inline - clickable links
- **Threaded replies**: Respond to specific comments, build conversations
- **Contextual placement**: Comments on packages, ecosystems, projects, decisions
- **Notifications**: Get notified when someone replies to your comments

### Phase 8: User Profiles

Click on any name to see who's behind the contribution.

- **Profile pages**: Activity feed, projects, contribution history
- **Expertise signals**: Technologies you've contributed to most
- **Public presence**: Your projects, decisions, and discussions in one place
- **Discoverability**: Find people by the technologies they work with

### Phase 9: Comparisons

- Comparisons - community-curated "which X?" pages linking to packages and ecosystems
- Voting on comparison items and quality
- Link to decision records showing real-world choices

### Phase 10: Following & Discovery

- Follow packages/ecosystems for version and update notifications
- Enhanced search with recommendations
- "Similar to" and "used together with" suggestions
- Per-package leaderboards (recognize package experts)

### Phase 11: Trust & Moderation

- Audit log for ecosystem/curation changes (who did what, when)
- Power user role for trusted contributors (frictionless contributions)
- Promotion criteria based on contribution history
- Moderation tools (review actions, revert changes, revoke privileges)

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
