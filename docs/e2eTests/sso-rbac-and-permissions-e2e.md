# SSO RBAC and Permissions E2E

**Last updated:** March 2026  
**Spec:** [TRINITY-AUTHORIZATION-PATTERN.md](../../../shared-docs/TRINITY-AUTHORIZATION-PATTERN.md), [sso-integration-guide.md](../../../shared-docs/sso-integration-guide.md)  
**Status:** Implemented (Playwright)

## Overview

E2E tests validate role-based access at the auth-ui (SSO) level: platform admin and tenant admin can log in and reach the dashboard; unauthenticated users are redirected to login when hitting protected routes.

**Real user experience:** The tests use only the fields a real user sees: **email and password**. No tenant is entered or embedded in the URL. The tenant admin test navigates to `/login` (no `?tenant=`) and submits credentials; auth-api resolves the tenant from the user's primary organisation in the DB. This ensures the test validates the real system behaviour, not a forged flow.

## Preconditions

- Same as [sso-login-flow-e2e.md](./sso-login-flow-e2e.md)
- **Platform admin:** `admin@codevertexitsolutions.com` / `ChangeMe123!` (or `E2E_PLATFORM_ADMIN_EMAIL` / `E2E_PLATFORM_ADMIN_PASSWORD`)
- **Tenant admin:** `admin@theurbanloftcafe.com` / `TenantAdmin2024!` (or `E2E_TENANT_ADMIN_EMAIL` / `E2E_TENANT_ADMIN_PASSWORD`)

## Test File

`auth-ui/e2e/sso-rbac-permissions.spec.ts`

## Scenarios

### 1. Platform admin can log in and navbar shows Dashboard, not Log In / Start Free

- Navigate to `/login`
- Fill platform admin credentials and submit
- Assert redirect away from `/login`
- Assert navbar contains visible "Dashboard" link and does not show "Log In" or "Start Free" (or "Get Started")

### 2. Tenant admin can log in with email and password only (no tenant in URL)

- Navigate to `/login` (no `?tenant=`)
- Fill tenant admin credentials and submit
- Assert redirect away from `/login` (backend resolves org from user's primary_tenant_id)

### 3. Tenant admin after login sees Dashboard in navbar and not Log In / Start Free

- Same as scenario 2 (tenant admin login)
- After redirect, assert navbar shows "Dashboard" and hides unauthenticated buttons (same as platform admin)

### 4. Unauthenticated user on dashboard redirects to login

- Navigate to `/dashboard` without being logged in
- Assert URL becomes `/login` (redirect)

## RBAC / Trinity Alignment

- **Layer 1 (RBAC):** Auth-api issues JWT with `roles` and `permissions`; auth-ui does not enforce resource-level rules but demonstrates that different roles (superuser, admin) can log in and see the dashboard.
- **Menu items by role:** Full validation of sidebar/menu items by role (e.g. platform-only vs tenant-only) can be extended in future specs; current tests assert dashboard and nav visibility post-login.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `E2E_PLATFORM_ADMIN_EMAIL` | Platform admin email | `admin@codevertexitsolutions.com` |
| `E2E_PLATFORM_ADMIN_PASSWORD` | Platform admin password | `ChangeMe123!` |
| `E2E_TENANT_ADMIN_EMAIL` | Tenant admin email | `admin@theurbanloftcafe.com` |
| `E2E_TENANT_ADMIN_PASSWORD` | Tenant admin password | `TenantAdmin2024!` |

## Running

```bash
cd auth-service/auth-ui
pnpm test:e2e -- sso-rbac-permissions
```

## Artifacts

Same as [sso-login-flow-e2e.md](./sso-login-flow-e2e.md): `playwright-report/`, `test-results/`, trace viewer for network/console.

## Tenant context for tenant admin (no `?tenant=` in URL)

Tenant users must be able to log in directly from auth-ui at `/login` without a tenant in the URL. auth-api supports this by resolving the tenant from the user's **primary_tenant_id** when `tenant_slug` is not provided:

- **auth-api:** In `Login`, if `tenant_slug` is empty, the service looks up the user by email, then loads the tenant from `user.PrimaryTenantID` (the organisation linked to that user in the DB), verifies membership, and issues the session for that tenant.
- **auth-ui:** When the URL has no `?tenant=`, auth-ui sends `tenant_slug` as empty so the backend resolves the tenant from the user's primary organisation.

The E2E test "tenant admin can log in and leaves login page" uses `/login` (no query) and asserts that the tenant admin user can sign in; the backend resolves `urban-loft` from that user's primary_tenant_id.

See [sso-integration-guide.md — Login without tenant_slug](../../../shared-docs/sso-integration-guide.md#login-without-tenant_slug-tenant-resolved-from-users-primary-tenant) for the full behaviour.

## Current Status

- **Pass/Fail:** Run `pnpm test:e2e -- sso-rbac-permissions`; depends on auth-api and seeded users (platform admin, tenant admin). Tenant admin test uses `/login` with no query; auth-api resolves tenant from primary_tenant_id.
- **Notes:** Align with Trinity Layer 1; Layer 2 (subscription) and Layer 3 (domain resources) are exercised in ordering-frontend and other service E2E.
