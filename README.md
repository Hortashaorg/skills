# Skills

A modern fullstack application built with SolidJS, Zero sync engine, and OAuth2 authentication.

## Tech Stack

- **Frontend**: SolidJS with TailwindCSS 4
- **Backend**: Hono API server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time sync**: @rocicorp/zero
- **Auth**: OAuth2 with Zitadel
- **Monorepo**: pnpm workspaces

## Project Structure

```
skills/
├── packages/
│   ├── database/     # Shared database schema, queries, and mutators
│   └── common/       # Shared utilities
└── services/
    ├── frontend/     # SolidJS application
    └── backend/      # Hono API server
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL
- Docker (for local development)

### Installation

```bash
pnpm install
```

### Development

**Start all services**:
```bash
pnpm frontend dev    # Frontend dev server
pnpm backend dev     # Backend API server
```

**Code quality**:
```bash
pnpm check           # Lint and format with Biome (auto-fix)
pnpm all typecheck   # TypeScript type checking
```

**Database**:
```bash
pnpm database generate    # Generate Zero schema from Drizzle
pnpm database migrate     # Run database migrations
```

## Useful Commands

### Workspace Commands

Run commands in specific workspaces:

```bash
pnpm frontend <command>   # Frontend only
pnpm backend <command>    # Backend only
pnpm database <command>   # Database package only
pnpm all <command>        # All workspaces (parallel)
```

### Testing

```bash
pnpm frontend test        # Run component tests
pnpm frontend storybook   # Start Storybook
```

### Code Quality

```bash
pnpm check               # Lint, format, and fix issues
pnpm format              # Format code only
pnpm all typecheck       # Type check all packages
```

## Architecture

### Authentication

- OAuth2 flow with Zitadel
- httpOnly refresh tokens (6 month expiry)
- In-memory access tokens (10 min expiry)
- Automatic token refresh before expiry

### Data Sync

- Real-time sync with @rocicorp/zero
- Optimistic updates
- Offline support with automatic reconnection
- User context isolation

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development patterns and AI assistance guidelines.

## License

Private project
