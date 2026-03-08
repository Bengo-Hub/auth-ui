# auth-ui -- Architecture

**Service**: auth-ui (Next.js 15)
**Deployed**: auth.codevertexitsolutions.com
**Backend**: authapi.codevertexitsolutions.com (auth-api, Go)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| State (client) | Zustand (auth store, user store) |
| State (server) | TanStack Query (API caching) |
| Forms | React Hook Form + Zod validation |
| HTTP | Axios with request/response interceptors |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| PWA | next-pwa |

---

## Route Structure

```
src/app/
  page.tsx                          -- Landing / service directory
  login/page.tsx                    -- Login form (email/password, social, MFA)
  signup/page.tsx                   -- Registration form
  forgot-password/page.tsx          -- Password reset request
  reset-password/page.tsx           -- Password reset completion
  status/page.tsx                   -- Service status page
  docs/page.tsx                     -- Developer documentation
  unauthorized/page.tsx             -- 403 fallback

  dashboard/
    layout.tsx                      -- Authenticated layout (sidebar, nav)
    page.tsx                        -- Dashboard home
    profile/page.tsx                -- User profile editing
    security/page.tsx               -- Security settings (password, sessions)
    security/2fa-setup/page.tsx     -- MFA TOTP setup
    settings/page.tsx               -- Account settings
    tenants/page.tsx                -- Tenant management (admin)
    developer/page.tsx              -- API keys, OAuth clients

    platform/                       -- Platform admin section (super_admin only); redirects only
      gateways/page.tsx             -- Redirect to treasury-ui (Codevertex Books)
      notifications/page.tsx       -- Redirect to notifications-ui
```

---

## Authentication Flow

```
User visits BengoBox service (e.g., ordersapp.codevertexitsolutions.com)
  |
  v
Service redirects to auth.codevertexitsolutions.com/login
  with client_id, redirect_uri, scope, code_challenge
  |
  v
Auth-ui login page:
  - Email/password form
  - Social login buttons (Google, GitHub, Microsoft)
  - MFA prompt (if enabled)
  |
  v
POST /api/v1/auth/login -> auth-api
  |
  v
On success:
  - Store access_token in Zustand (memory)
  - Set bb_session httpOnly cookie
  - Redirect back to requesting service with authorization code
  |
  v
Requesting service exchanges code for tokens via auth-api /token endpoint
```

---

## State Management

### Zustand Auth Store

Holds the current user session in memory:
- `user` (id, email, tenant_id, roles)
- `accessToken` (JWT, never persisted to storage)
- `isAuthenticated` (boolean)
- `permissions` (string array, fetched on login)

### TanStack Query

Server state caching for API data:
- User profile data (15-min stale time)
- Service directory (1-hour stale time)
- API keys (30-min stale time)
- Tenant users list (5-min stale time)

---

## API Communication

All API calls go through a shared Axios instance with:

1. **Request interceptor**: Attaches `Authorization: Bearer <token>` header
2. **Response interceptor**: On 401, attempts token refresh; on success retries original request; on failure redirects to login
3. **Credentials**: `withCredentials: true` to include `bb_session` cookie

Base URL configured via `NEXT_PUBLIC_API_URL` environment variable.

---

## Role-Based Access Control

UI sections are gated based on user roles from the JWT:

| Route | Required Role | Description |
|-------|--------------|-------------|
| `/dashboard` | Any authenticated | Dashboard home |
| `/dashboard/profile` | Any authenticated | Profile editing |
| `/dashboard/security` | Any authenticated | Security settings, MFA |
| `/dashboard/tenants` | `admin` | Tenant user management |
| `/dashboard/developer` | `admin` | API keys, OAuth clients |
| `/dashboard/platform/*` | `super_admin` | Redirects to treasury-ui (gateways) and notifications-ui |

Role checking is implemented client-side for UX (hide/show sections) but enforced server-side by auth-api on every API call.

---

## Deployment

- Docker container, standalone Next.js output
- Deployed via ArgoCD to Kubernetes
- Helm values: `devops-k8s/values/auth-ui-values.yaml`
- CDN for static assets (Vercel-style ISR not used; standard K8s deployment)
- Environment variables from K8s ConfigMap/Secrets
- Health check: Next.js default health endpoint
