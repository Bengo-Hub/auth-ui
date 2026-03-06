# Sprint MVP Launch (March 17, 2026)

**Progress (March 2026)**: **RBAC & TanStack Query:** useAuth (useMe) uses TanStack Query for GET /me (5 min staleTime/gcTime); hasRole/hasPermission for nav and ProtectedRoute; 404 (not-found.tsx) and 403 (unauthorized page) in place. Unauthenticated → redirect to login; lacking permission → redirect to /unauthorized. Platform section (Gateways, Notifications) gated by superuser, admin, or super_admin (seed uses `superuser`). Auth-store User includes `permissions`. All auth/me fetches via TanStack Query. — Tenant/brand: TenantProvider added; tenant slug from `NEXT_PUBLIC_TENANT_SLUG` or `?tenant=`; fetches GET /api/v1/tenants/by-slug/{slug} from auth-api (public); applies --tenant-primary, --tenant-secondary, --tenant-logo-url; Settings page includes "Tenant & Branding" section. **DevOps reference**: build.sh, deploy.yml, Dockerfile in auth-ui repo; Helm values in devops-k8s/apps/auth-ui/ (and auth-api in devops-k8s/apps/auth-api/).

**Duration**: March 6 -- March 17, 2026 (10 working days)
**Status**: In Progress
**Goal**: Ship a production-ready SSO portal at `auth.codevertexitsolutions.com` supporting all BengoBox service logins, tenant admin, and platform admin for the `urban-loft` tenant.

---

## Hard Deadline Constraints

- **March 17**: All BengoBox services go live; auth-ui must be the SSO entry point
- **Tenant**: `urban-loft` only (The Urban Loft Cafe)
- **Users**: Platform admin (`admin@codevertexitsolutions.com`), tenant admin (`admin@theurbanloftcafe.com`)
- **Scope**: Login/signup, OIDC redirect, dashboard, tenant admin, platform admin. Advanced features are post-MVP.

---

## Critical Path Tasks

### CP-1: E2E Login Flow

**Priority**: P0 -- blocks all downstream services
**Owner**: Frontend

- [ ] Verify login form submits to auth-api and receives JWT + refresh token
- [ ] Verify `bb_session` cookie is set correctly (httpOnly, Secure, SameSite)
- [ ] Verify Zustand store receives and holds access token in memory
- [ ] Verify failed login shows inline error message
- [ ] Test with `admin@theurbanloftcafe.com` (tenant admin) and `admin@codevertexitsolutions.com` (platform admin)
- [ ] Verify redirect back to requesting service after login (OIDC flow)

### CP-2: OIDC Redirect Flow from Downstream Services

**Priority**: P0 -- blocks ordering, POS, notifications frontends
**Owner**: Frontend

- [ ] Verify ordering-frontend can redirect to auth-ui `/login` with OIDC params
- [ ] Verify auth-ui preserves `client_id`, `redirect_uri`, `state`, `code_challenge` through login flow
- [ ] Verify on successful login, auth-ui redirects to `redirect_uri` with authorization code
- [ ] Test with ordering-frontend (`ordersapp.codevertexitsolutions.com`)
- [ ] Test with POS frontend (`pos.codevertexitsolutions.com`)
- [ ] Test with notifications-ui (`notifications.codevertexitsolutions.com`)

### CP-3: Token Refresh & Session Persistence

**Priority**: P0
**Owner**: Frontend

- [ ] Verify Axios interceptor catches 401 and calls `/auth/refresh`
- [ ] Verify request queueing prevents multiple simultaneous refresh calls
- [ ] Verify refreshed token is used for retrying the original request
- [ ] Verify expired refresh token redirects to login
- [ ] Verify `bb_session` cookie persists sessions across browser restarts

### CP-4: Dashboard Access & Navigation

**Priority**: P0
**Owner**: Frontend

- [ ] Verify authenticated users reach `/dashboard` after login
- [ ] Verify sidebar navigation renders correct sections based on role
- [ ] Verify unauthenticated users are redirected to `/login`
- [ ] Verify `/unauthorized` page shows for insufficient permissions

---

## High Priority Tasks

### HP-1: Platform Admin Section

**Priority**: P1
**Owner**: Frontend

- [ ] Verify `/dashboard/platform/gateways` is accessible only to platform roles (UI: superuser, admin, super_admin; seed uses superuser)
- [ ] Verify gateway list loads from auth-api
- [ ] Verify add/edit gateway form works
- [ ] Verify `/dashboard/platform/notifications` loads for `super_admin`
- [ ] Test: tenant admin (`admin@theurbanloftcafe.com`) cannot access platform routes (redirected to `/unauthorized`)

### HP-2: Tenant Admin Section

**Priority**: P1
**Owner**: Frontend

- [ ] Verify `/dashboard/tenants` shows user list for current tenant
- [ ] Verify invite user form sends invitation via auth-api
- [ ] Verify role assignment dropdown works
- [ ] Verify `/dashboard/developer` shows API keys and OAuth clients
- [ ] Verify API key creation shows key once and allows copy
- [ ] Verify API key revocation with confirmation dialog

### HP-3: MFA Setup Flow

**Priority**: P1
**Owner**: Frontend

- [ ] Verify `/dashboard/security/2fa-setup` displays QR code from auth-api
- [ ] Verify 6-digit code input validates against auth-api
- [ ] Verify backup codes are displayed and downloadable
- [ ] Verify login flow prompts for MFA code when enabled
- [ ] Verify "Use backup code" fallback works

### HP-4: Social Login

**Priority**: P1 -- best effort for launch
**Owner**: Frontend

- [ ] Verify Google login button initiates OAuth flow via auth-api
- [ ] Verify GitHub login button works
- [ ] Verify Microsoft login button works
- [ ] Verify social login creates/links account and redirects correctly

---

## Medium Priority Tasks

### MP-1: Password Reset Flow

**Priority**: P2

- [ ] Verify `/forgot-password` sends reset email via auth-api
- [ ] Verify `/reset-password` accepts token and sets new password
- [ ] Verify expired token shows appropriate error

### MP-2: Profile & Security Settings

**Priority**: P2

- [ ] Verify profile editing (name, avatar) saves correctly
- [ ] Verify password change requires current password
- [ ] Verify session list shows active sessions
- [ ] Verify "Sign out other sessions" works

### MP-3: SEO & Performance

**Priority**: P2

- [ ] Add meta tags (title, description) to all pages
- [ ] Verify Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Verify code splitting reduces initial bundle size
- [ ] Verify images are optimised

---

## Out of Scope (Post-MVP)

- SAML enterprise SSO
- Passwordless / magic link authentication
- WebAuthn / biometric auth
- Advanced audit log viewer
- User activity timeline
- Compliance reporting
- Multi-language support

---

## Deployment Checklist

### Pre-Launch (March 14-16)

- [ ] Verify all environment variables set in K8s ConfigMap/Secrets
- [ ] Verify `NEXT_PUBLIC_API_URL` points to production auth-api
- [ ] Verify `NEXT_PUBLIC_CLIENT_ID` matches registered OAuth client in auth-api
- [ ] Verify `NEXT_PUBLIC_REDIRECT_URI` matches redirect URI in OAuth client config
- [ ] Build production Docker image and push to registry
- [ ] Smoke test all pages on staging
- [ ] Verify CORS between auth-ui and auth-api works in production

### Launch Day (March 17)

- [ ] Deploy final image via ArgoCD
- [ ] Verify login page loads at `https://auth.codevertexitsolutions.com`
- [ ] Test login with tenant admin account
- [ ] Test OIDC redirect from ordering-frontend
- [ ] Verify platform admin section accessible to `admin@codevertexitsolutions.com`
- [ ] Monitor error rate and page load times

### Post-Launch (March 18-21)

- [ ] Monitor login success/failure rates
- [ ] Review browser console errors from production monitoring
- [ ] Collect user feedback on login/dashboard UX
- [ ] Triage blocking bugs as hotfixes

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth-api down | Login completely blocked | Health monitoring; display maintenance page |
| CORS misconfiguration | Login form cannot reach API | Pre-launch CORS testing; fallback config |
| Cookie not set (SameSite) | Session lost on page reload | Test cookie settings across browsers; adjust SameSite policy |
| Token refresh loop | Infinite redirects | Circuit breaker in interceptor; max retry count |
| Social provider outage | Social login unavailable | Graceful fallback to email/password only |

---

## Success Criteria

- [ ] Users can log in and reach dashboard at `auth.codevertexitsolutions.com`
- [ ] OIDC redirect flow works from ordering-frontend, POS, notifications-ui
- [ ] Platform admin can access gateway configuration
- [ ] Tenant admin can manage users and API keys for `urban-loft`
- [ ] MFA setup and login verification works
- [ ] Page load time < 3s on 3G connection
- [ ] Zero JavaScript errors on critical paths (login, dashboard, admin)
