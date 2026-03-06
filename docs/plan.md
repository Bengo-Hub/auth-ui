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
4. **Platform admin console** -- payment gateway configuration, platform role management (gated by `super_admin`)
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
- Platform admin section (gateways, roles) gated by `super_admin`
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

## Key Risks

| Risk | Mitigation |
|------|------------|
| Auth-api downtime blocks all services | Health monitoring, multiple replicas, cached JWKS |
| Cross-origin cookie issues | SameSite=Strict, CORS configuration, domain cookie mode |
| Token refresh race conditions | Request queueing in Axios interceptor |
| Role-based UI bypass | Server-side enforcement in auth-api; UI gating is UX only |
