# SSO Login Flow E2E

**Last updated:** March 2026  
**Spec:** [sso-integration-guide.md](../../../shared-docs/sso-integration-guide.md), [SSO-AUTHENTICATED-REQUESTS-AND-401.md](../../../shared-docs/SSO-AUTHENTICATED-REQUESTS-AND-401.md)  
**Status:** Implemented (Playwright)

**Real user experience:** Tests mirror how a real user uses the system. The login form has **only email and password**; there is no tenant field or tenant in the URL. auth-api resolves the user's organisation from the provided email (primary_tenant_id). Tests must not forge tenant (e.g. no `?tenant=...` in the URL) so that we validate the actual login flow.

## Overview

E2E tests validate the SSO login flow on `accounts.codevertexitsolutions.com`: login page load, form submission with seeded users, redirect after login, and authenticated navbar/profile visibility.

## Preconditions

- **Target:** `https://accounts.codevertexitsolutions.com` (override via `BASE_URL`)
- **Seeded users:** From auth-api seed (`auth-api/cmd/seed/main.go`):
  - Demo: `demo@bengobox.dev` / `DemoUser2024!`
  - Platform admin: `admin@codevertexitsolutions.com` / `ChangeMe123!` (or env)
  - Tenant admin: `admin@theurbanloftcafe.com` / `TenantAdmin2024!`
- **OAuth clients:** Auth-ui client registered with redirect URIs for accounts and sso domains

## Test File

`auth-ui/e2e/sso-login-flow.spec.ts`

## Scenarios

### 1. Login page loads and shows email/password form

- Navigate to `/login`
- Assert heading (Sign in / Login) visible
- Assert email and password inputs visible
- Assert "Sign In" button visible

### 2. Login with seeded demo user and reach dashboard

- Navigate to `/login`
- Fill email (default: `demo@bengobox.dev`) and password (default: `DemoUser2024!`)
- Submit form
- Assert URL is `/dashboard` or `/login` (within timeout)
- If dashboard: assert welcome/dashboard text visible

### 3. Authenticated user sees profile/nav area after login

- Same login steps as above
- After redirect to dashboard, assert header or nav is visible

### 4. After login SSO GET /api/v1/auth/me returns 200 and response includes roles and permissions

- Same login steps as above (email + password, submit).
- Wait for the response to GET /api/v1/auth/me (request goes to sso.* or accounts.*).
- Assert status 200 (user valid at SSO).
- Assert response body includes `roles` and `permissions` (user synced at SSO with correct role/permission mapping). This test guarantees SSO /me coverage for the 401 test plan (see [SSO-AUTHENTICATED-REQUESTS-AND-401.md](../../../shared-docs/SSO-AUTHENTICATED-REQUESTS-AND-401.md)).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Auth-ui base URL | `https://accounts.codevertexitsolutions.com` |
| `E2E_LOGIN_EMAIL` | Login email | `demo@bengobox.dev` |
| `E2E_LOGIN_PASSWORD` | Login password | `DemoUser2024!` |

## Running

```bash
cd auth-service/auth-ui
pnpm install
pnpm exec playwright install
pnpm test:e2e
```

## Artifacts

After running `pnpm test:e2e`:

| Artifact | Path | Notes |
|----------|------|--------|
| HTML report | `auth-ui/playwright-report/index.html` | Run `npx playwright show-report playwright-report` to open. |
| Screenshots | `auth-ui/test-results/<test-name>-chromium/` | On failure; also in report. |
| Trace (network, console) | `auth-ui/test-results/<test-name>-chromium/trace.zip` | View: `npx playwright show-trace test-results/.../trace.zip`. |

## Real run results (March 2026)

Manual run against production:

- **Login page load:** Pass. URL `https://accounts.codevertexitsolutions.com/login`. Heading "Welcome back" / "Sign in to your enterprise account"; Email and Password fields; Sign In button; social (Google, GitHub, Microsoft).
- **Demo login flow:** Pass. Submit `demo@bengobox.dev` / `DemoUser2024!` → redirect to `https://accounts.codevertexitsolutions.com/` (home). Network: `GET https://sso.codevertexitsolutions.com/api/v1/auth/me` → 200.
- **Console:** No errors; only CursorBrowser dialog-override warning.

**Note:** Post-login redirect goes to `/` (home), not `/dashboard`. Tests assert "redirect away from login" and presence of header/nav.

## Current Status

- **Pass/Fail:** Automated run requires `npx playwright install` once; then `pnpm test:e2e`. Manual run (above) confirms login and redirect work.
- **Notes:** If auth-api returns 404/503 (see [e2e-gap-analysis.md](../../../shared-docs/e2e-gap-analysis.md)), login will fail.
