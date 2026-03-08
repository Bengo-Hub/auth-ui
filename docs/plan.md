# auth-ui -- Project Plan

**Service**: auth-ui (Next.js 15)
**Deployed**: auth.codevertexitsolutions.com
**Status**: Sprint 6 in progress, MVP launch targeted March 17, 2026

---

## Purpose

Auth-ui is the central Single Sign-On (SSO) portal for all BengoBox services. It serves as:

1. **Login/Registration gateway** -- users authenticate here and are redirected back to the requesting service
2. **Account management portal** -- profile editing, security settings, MFA, session management
3. **Tenant admin dashboard** -- user management, role assignment, API keys, OAuth client registration
4. **Platform admin console** -- platform role management (gated by `super_admin`). Payment gateway configuration lives in **treasury-ui** (Codevertex Books); notification templates/providers live in **notifications-ui**.
5. **Developer portal** -- API key management, OAuth client registration, service documentation

---

## Sprint History

| Sprint | Title | Status |
|--------|-------|--------|
| 1 | Foundation | Complete |
| 2 | Authentication | Complete |
| 3 | Authorization & Roles | Complete |
| 4 | Account Management | Complete |
| 5 | Developer Portal | Complete |
| 6 | Production Hardening | In Progress |
| MVP | MVP Launch | In Progress (March 6-17, 2026) |

---

## MVP Scope (March 17 Deadline)

### Must Have (P0)

- Login/signup flow working E2E with auth-api
- OIDC redirect flow working for all BengoBox service frontends
- MFA setup and verification (TOTP)
- Token refresh and session management
- Platform admin section (roles) gated by `super_admin` (gateways → treasury-ui; notifications → notifications-ui)
- Tenant admin section (users, API keys, settings) gated by `admin`
- Production deployment at `auth.codevertexitsolutions.com`

### Should Have (P1)

- Social login (Google, GitHub, Microsoft)
- Password reset flow
- Service directory (launch links to other BengoBox services)
- Basic SEO (meta tags, structured data)
- Performance optimisation (code splitting, image optimisation)

### Nice to Have (P2)

- PWA offline support
- Advanced audit log viewer
- User activity timeline
- Compliance dashboards

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 (App Router) | React 19 support, SSR, ISR, API routes |
| State | Zustand + TanStack Query | Lightweight global state + server state caching |
| Styling | Tailwind CSS + Shadcn UI | Rapid development, accessible components |
| Forms | React Hook Form + Zod | Type-safe validation, performance |
| HTTP | Axios with interceptors | Auto-refresh on 401, request/response logging |
| Auth token | Memory (Zustand) | No localStorage to prevent XSS |
| Session | `bb_session` httpOnly cookie | Persistent SSO across services |

---

## MVP verification (Auth & RBAC)

- **Profile / me**: `useAuth` (in `src/hooks/useAuth.ts`) fetches profile via GET /api/v1/auth/me using **TanStack Query** with 5 min `staleTime`/TTL; response includes `roles` and `permissions`; store updated via `setUser`.
- **RBAC**: `hasRole(role, tenantSlug?)` and `hasPermission(permission)`; platform/superuser-style access treats `superuser`, `admin`, and `super_admin` as full access (aligned with auth-api seed which uses `superuser`).
- **Navigation**: Dashboard sidebar Platform section is empty (gateways and notifications moved to treasury-ui and notifications-ui). Service directory links to Codevertex Books and Notifications for those features.
- **Route protection**: Unauthenticated users redirected to `/login?return_to=...`; insufficient role redirects to `/unauthorized` (403). Implemented in `ProtectedRoute`, dashboard layout, and layout-level platform-route check.
- **Error pages**: `src/app/not-found.tsx` (404); `src/app/unauthorized/page.tsx` (403 Access Denied).
- **Data fetching**: Auth and dashboard data use TanStack Query (`useQuery`/`useMutation`) via `useAuth` and `use-dashboard-api.ts`.

## DevOps reference (structure only — do not change in this task)

- **auth-api**: `build.sh`, `.github/workflows/deploy.yml`, `Dockerfile` in repo; Helm chart values at `devops-k8s/apps/auth-api/values.yaml` (image, env, Redis AUTH_REDIS_*, DB, replicas, ingress).
- **auth-ui**: `build.sh`, `.github/workflows/deploy.yml`, `Dockerfile` in repo; Helm values at `devops-k8s/apps/auth-ui/values.yaml` (image, env, NEXT_PUBLIC_*, ingress accounts.codevertexitsolutions.com).

---

## Key Risks

| Risk | Mitigation |
|------|------------|
| Auth-api downtime blocks all services | Health monitoring, multiple replicas, cached JWKS |
| Cross-origin cookie issues | SameSite=Strict, CORS configuration, domain cookie mode |
| Token refresh race conditions | Request queueing in Axios interceptor |
| Role-based UI bypass | Server-side enforcement in auth-api; UI gating is UX only |
