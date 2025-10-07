# Project Context

## Tech Stack
- **SolidJS** - Reactive UI framework
- **@rocicorp/zero** - Real-time sync and data management
- **@solidjs/router** - Client-side routing
- **OAuth2** - Authentication with refresh tokens

## Architecture Patterns

### Zero + Auth Context Provider
- Use a centralized context provider for Zero instance and auth state
- Async initialization with `createResource` - show loading state until ready
- Separate concerns: auth service, state management, Zero factory
- Factory pattern for creating authenticated vs anonymous Zero instances

### OAuth Flow
- Auto-detect `?code=` in URL and exchange for tokens on app load
- Use `/login` endpoint to exchange code, `/refresh` to restore sessions
- Always use `credentials: "include"` for cookie-based refresh tokens
- OAuth callback page auto-redirects to home after processing

### Using Zero in Components
```tsx
const { z, authState, authData } = useZero();
const [data] = useQuery(() => z.query.tableName);
z.mutate.tableName.create({...});
```
