# Webhook Service

Handles Zitadel identity events and actions.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/zitadel/events` | Zitadel event webhooks |
| POST | `/zitadel/actions` | Zitadel action interceptors |

## Events

Events are fired after something happens in Zitadel.

| Event | Handler |
|-------|---------|
| `user.removed` | Soft-delete account by zitadelId |
| `user.human.externalidp.added` | Link external IDP to account |

**Handler pattern:**
```typescript
// handlers/events.ts
export async function handleUserRemoved(event: ZitadelEvent) {
  const zitadelId = event.aggregate.id;
  // Soft-delete account...
}
```

## Actions

Actions intercept Zitadel flows for custom logic.

| Action | Purpose |
|--------|---------|
| `RetrieveIdentityProviderIntent` | Resolve IDP during OAuth |

**Unhandled events/actions:** Return empty JSON `{}` (pass-through).

## Zitadel API Client

```typescript
import { zitadelApi } from "./zitadel-api";

// Management API calls
await zitadelApi.verifyEmail(userId);
await zitadelApi.addUserGrant(userId, roleKey);
```
