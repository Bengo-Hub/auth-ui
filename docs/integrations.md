# auth-ui -- Integrations

**Last Updated**: March 6, 2026

---

## Auth API (Primary Backend)

| Item | Value |
|------|-------|
| Local | `http://localhost:4101/api/v1` |
| Production | `https://authapi.codevertexitsolutions.com/api/v1` |
| Env var | `NEXT_PUBLIC_API_URL` |
| Protocol | REST (JSON) |
| Auth | Bearer JWT in `Authorization` header + `bb_session` httpOnly cookie |

### API Modules Used

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| Auth | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` | User authentication lifecycle |
| MFA | `/auth/mfa/totp/start`, `/auth/mfa/totp/confirm`, `/auth/mfa/backup-codes/*` | TOTP setup, verification, backup codes |
| User | `/auth/me`, `/users/me`, `/users/me/permissions` | Profile, permissions |
| OIDC | `/authorize`, `/token`, `/userinfo`, `/.well-known/*` | SSO flows |
| Admin | `/admin/tenants`, `/admin/clients`, `/admin/api-keys`, `/admin/keys/rotate` | Tenant/client/key management |
| Platform | `/platform/gateways`, `/platform/roles` | Platform admin operations |
| Social | `/auth/oauth/{provider}/start`, `/auth/oauth/{provider}/callback` | Google, GitHub, Microsoft login |

### Axios Client Configuration

- `withCredentials: true` for cookie support
- Request interceptor: attaches `Authorization: Bearer <token>`
- Response interceptor: auto-refresh on 401, redirect to login on refresh failure
- Request queueing during token refresh to prevent thundering herd

---

## SSO with BengoBox Services

Auth-ui serves as the SSO login page for all BengoBox services. Each service redirects to auth-ui for authentication.

### OIDC Redirect Flow

```
Service frontend -> auth.codevertexitsolutions.com/login
  ?client_id=<service-client-id>
  &redirect_uri=<service-callback-url>
  &scope=openid email profile
  &response_type=code
  &code_challenge=<S256>
  &code_challenge_method=S256
  &state=<csrf>
```

### Registered OAuth Clients

| Service | Client ID | Redirect URI |
|---------|-----------|-------------|
| Auth UI | `auth-ui` | `https://auth.codevertexitsolutions.com/auth/callback` |
| Ordering App | `ordering-app` | `https://ordersapp.codevertexitsolutions.com/callback` |
| POS | `pos-app` | `https://pos.codevertexitsolutions.com/callback` |
| Notifications UI | `notifications-ui` | `https://notifications.codevertexitsolutions.com/[orgSlug]/auth/callback` |
| Subscriptions UI | `subscriptions-ui` | `https://subscriptions.codevertexitsolutions.com/callback` |

### Post-Login Redirect

After successful authentication, auth-ui redirects back to the requesting service:
1. Issues authorization code
2. Redirects to `redirect_uri?code=<code>&state=<state>`
3. Service frontend exchanges code for tokens via auth-api `/token` endpoint

---

## Shared Libraries

### shared-auth-client (Go)

Used by auth-api (and all Go backends) for JWT validation. Auth-ui does not use this directly but depends on the middleware it provides being functional.

**Repository**: `github.com/Bengo-Hub/shared-auth-client`

### shared-events (Go)

Used by auth-api for NATS event publishing. Auth-ui does not interact with this directly.

**Repository**: `github.com/Bengo-Hub/shared-events`

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Auth API base URL | `https://authapi.codevertexitsolutions.com/api/v1` |
| `NEXT_PUBLIC_AUTH_URL` | Auth API root | `https://authapi.codevertexitsolutions.com` |
| `NEXT_PUBLIC_CLIENT_ID` | OAuth client ID for auth-ui | `auth-ui` |
| `NEXT_PUBLIC_REDIRECT_URI` | OIDC callback URL | `https://auth.codevertexitsolutions.com/auth/callback` |
| `NEXT_PUBLIC_BRAND_NAME` | Platform brand name | `BengoBox` |
| `NEXT_PUBLIC_BRAND_LOGO_URL` | Brand logo path | `/logo.jpg` |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR` | Brand primary color | `#ea8022` |

---

## External Services

### Social OAuth Providers

Auth-ui initiates social login by calling auth-api endpoints which handle the OAuth flow with external providers:

| Provider | Start Endpoint | Callback Endpoint |
|----------|---------------|-------------------|
| Google | `POST /auth/oauth/google/start` | `GET /auth/oauth/google/callback` |
| GitHub | `POST /auth/oauth/github/start` | `GET /auth/oauth/github/callback` |
| Microsoft | `POST /auth/oauth/microsoft/start` | `GET /auth/oauth/microsoft/callback` |

Auth-ui does not hold provider credentials; all OAuth flows are proxied through auth-api.

---

## Cross-Origin Considerations

Auth-ui at `auth.codevertexitsolutions.com` communicates with auth-api at `authapi.codevertexitsolutions.com`. CORS must allow:

- Origin: `https://auth.codevertexitsolutions.com`
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`
- Credentials: `true` (for `bb_session` cookie)

The `bb_session` cookie domain must be set to allow sharing across subdomains if SSO requires it.
