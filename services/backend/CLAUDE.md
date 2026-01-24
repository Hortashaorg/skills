# Backend Service

Hono API server for auth, Zero sync, and account management.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/login` | OAuth2 code exchange |
| POST | `/refresh` | Token refresh (httpOnly cookie) |
| POST | `/logout` | Clear refresh token |
| POST | `/api/mutate` | Zero mutations |
| POST | `/api/query` | Zero queries |
| GET | `/api/stats` | Pending fetches count |
| GET | `/api/queue/ahead` | Queue position for package |
| GET | `/api/account/export` | GDPR data export |
| POST | `/api/account/delete` | Account soft-delete |

## Auth Flow

1. Frontend redirects to Zitadel OAuth
2. Zitadel redirects back with code
3. `/login` exchanges code for tokens
4. Access token returned to frontend, refresh token in httpOnly cookie
5. Zero client uses access token
6. `/refresh` rotates tokens when access expires

## Patterns

**Auth context:**
```typescript
const { userId, roles } = getAuthContext(c);
if (!userId) return c.json({ error: "Unauthorized" }, 401);
```

**Zod validation:**
```typescript
app.post("/endpoint", zValidator("json", schema), async (c) => {
  const data = c.req.valid("json");
});
```

**Error handling:**
```typescript
throwError(c, 400, "Validation failed", { field: "name" });
```

## OpenTelemetry

Metrics auto-instrumented:
- `http_request_duration_ms` histogram
- `http_requests_total` counter
