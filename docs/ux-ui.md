# auth-ui -- UX/UI Patterns

**Last Updated**: March 6, 2026

This document defines the user-facing flows, page layouts, and interaction patterns for `auth.codevertexafrica.com`.

---

## Page Inventory

### Public Pages (No Auth Required)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Service directory, sign-in/sign-up CTAs |
| Login | `/login` | Email/password, social login, MFA prompt |
| Signup | `/signup` | New account registration |
| Forgot Password | `/forgot-password` | Request password reset email |
| Reset Password | `/reset-password` | Set new password (via email link) |
| Status | `/status` | Service health status |
| Docs | `/docs` | Developer documentation |
| Unauthorized | `/unauthorized` | 403 fallback for insufficient permissions |

### Authenticated Pages

| Page | Route | Role Required | Purpose |
|------|-------|--------------|---------|
| Dashboard | `/dashboard` | Any | Overview, quick links |
| Profile | `/dashboard/profile` | Any | Edit name, avatar, contact info |
| Security | `/dashboard/security` | Any | Change password, manage sessions |
| 2FA Setup | `/dashboard/security/2fa-setup` | Any | Enable/disable TOTP MFA |
| Settings | `/dashboard/settings` | Any | Account preferences |
| Tenants | `/dashboard/tenants` | `admin` | Manage tenant users, invite users |
| Developer | `/dashboard/developer` | `admin` | API keys, OAuth client management |

### Platform Admin Pages (redirects to owning services)

| Page | Route | Role Required | Purpose |
|------|-------|--------------|---------|
| Gateways | `/dashboard/platform/gateways` | `super_admin` | Redirects to **treasury-ui** (Codevertex Books) for payment gateway configuration |
| Notifications | `/dashboard/platform/notifications` | `super_admin` | Redirects to **notifications-ui** for templates and provider configuration |

---

## Sign-in pages (revamped 2026-10-13)

Login, sign-up, forgot password and reset password share one layout, `components/auth/AuthShell`:
a single centred card on a muted background, modelled on hosted sign-in pages people trust
(Auth0 Universal Login, Clerk, Google and Microsoft account sign-in). No split panel, no
marketing copy, no Codevertex header or footer around it (`MainLayout` skips its chrome on
auth routes).

**Tenant branding.** The card shows the tenant's logo (or an initial on the brand colour), its
name, and "to continue to <app>" using the tenant's own name for the app (shared-ui-lib
`serviceAppName`). Colours come from the shared `TenantBrandingProvider` through
`components/providers/tenant-brand-scope.tsx`; the platform tenant, or no tenant, keeps
auth-ui's own tokens. "Secured by Codevertex" is the only platform mark on a tenant's card.

**Where the tenant comes from.** `lib/auth-context.ts resolveAuthContext` reads, in order: the
`tenant` param, the `tenant` inside the authorize URL in `return_to`, then the
`/<slug>/auth/callback` path of either `redirect_uri`. The app (`client_id`) comes from the
param or from inside `return_to`. Every link between auth pages is built with `authFlowHref`,
which keeps `return_to`, `client_id`, `tenant` and the other flow params.

**Login** (`app/login`, `components/auth/LoginForm`):
- social providers first (`components/auth/OAuthButtons`, only providers active in auth-api)
- email and password, "Forgot password?" beside the password label
- "Sign in with a passkey" as a secondary button
- MFA code step, one-time terms step, passkey nudge (unchanged behaviour)
- a temporary password (admin-added staff, Digitika students and parents) must be replaced in
  the card before any redirect, so a service redirect cannot skip it
- below the card: "New to <tenant>? Create an account" for customer apps and tenant flows,
  "No account yet? Create one" on the platform

**Sign-up** (`app/signup`):
- customer apps (`ordering-ui`, `rider-app`, `codevertex-website`, see `CUSTOMER_APPS`) get
  `components/auth/CustomerSignupForm`: name, email, optional phone, password, terms, then an
  email code. It registers into the tenant with the app's `client_id` (auth-api gives the role)
  and signs the person straight back into the app. An email that already has an account gets
  "Sign in and we will add you to <tenant>".
- everything else gets the organisation wizard (`SignupForm`), in the wide card

**Forgot and reset password** use the same card and keep the flow, so "Back to sign in" returns
to the right app.

The dashboard wears the active organisation's brand the same way (`TenantBrandScope` in
`app/dashboard/layout.tsx`); platform owners keep the Codevertex look.

Fonts are declared in `@theme inline` in `globals.css`: next/font defines `--font-dm-sans` on
`<body>`, and a plain `@theme` value resolved on `:root` made every page render in Times New
Roman.

---

## Dashboard Layout

### Sidebar Navigation

```
Dashboard (home icon)
---
Account
  Profile
  Security
  Settings
---
Administration (admin+ only)
  Users & Roles
  Developer Portal
---
Platform (super_admin only) — redirects only
  Gateways → treasury-ui (Codevertex Books)
  Notifications → notifications-ui
```

### Top Bar

- Codevertex logo + "Auth" label
- Current user avatar + name dropdown
  - View profile
  - Sign out
- Notification bell (future)

---

## Platform Admin Section

Payment gateway configuration and notification templates/providers are **owned by treasury-ui and notifications-ui**. Auth-ui only provides redirect routes:

- **`/dashboard/platform/gateways`** → Redirects to Codevertex Books (treasury-ui) for gateway CRUD, reconciliation, and payouts.
- **`/dashboard/platform/notifications`** → Redirects to notifications-ui for templates, channels, and branding.

See treasury-ui and notifications-ui docs for full UX/UI and API details.

---

## Tenant Admin Section

### User Management (`/dashboard/tenants`)

**Access**: `admin` role on current tenant

- Table of tenant users with columns: Name, Email, Role, Status, Last Login
- Search/filter by name, email, role
- Actions: Invite user, edit role, deactivate
- Invite modal: email input, role selector, send invitation

### Developer Portal (`/dashboard/developer`)

**Access**: `admin` role

**API Keys tab**:
- List of API keys: Name, Key Prefix, Scopes, Created, Last Used, Expires
- Create API key modal: name, scopes (multi-select), expiry
- Copy key on creation (shown once)
- Revoke key with confirmation dialog

**OAuth Clients tab**:
- List of registered OAuth clients: Name, Client ID, Grant Types, Status
- Register new client: name, redirect URIs, allowed scopes, grant types
- Client secret shown once on creation

---

## Security Settings UX

### Password Change

- Current password, new password, confirm new password
- Password strength indicator
- Success toast on change

### Session Management

- List of active sessions: Device, IP, Location, Last Active
- "Sign out other sessions" button
- Individual session revocation

### MFA (2FA) Setup

- Step-by-step wizard:
  1. Scan QR code with authenticator app
  2. Enter verification code
  3. Save backup codes (download or copy)
- Disable MFA with password confirmation

---

## Responsive Design

- Mobile-first responsive layout
- Login/signup: full-screen centered card on mobile, constrained width on desktop
- Dashboard: collapsible sidebar on mobile, persistent on desktop
- Tables: horizontal scroll on mobile, full-width on desktop
- Touch-friendly: minimum 44px tap targets

---

## Error States

| Scenario | UX Treatment |
|----------|-------------|
| Invalid credentials | Inline error below form, shake animation |
| Account locked | Full-page message with unlock instructions |
| Network error | Toast notification with retry option |
| Session expired | Redirect to login with "Session expired" message |
| Insufficient permissions | Redirect to `/unauthorized` page |
| Rate limited | Inline message with countdown to retry |

---

## Loading States

- Skeleton loaders for dashboard data (user list, API keys)
- Button spinner on form submissions (login, signup, create key)
- Full-page spinner on initial authentication check
- Optimistic updates for toggle actions (enable/disable MFA, revoke key)
