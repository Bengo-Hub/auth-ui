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

## Design system (adapted from the Maskani owner portal, 2026-10-14)

The sign-in pages, landing page and dashboard take Maskani's style: a warm paper canvas, tinted
neutrals, DM Sans for text, Outfit for headings and Fraunces (soft serif) for display, large rounded
surfaces (1.75 to 2rem), soft shadows, scroll reveals, and no gradients or glows. The colours stay
the Codevertex brand: purple `#9100B0` primary and orange `#ea8022` accent are the DEFAULT theme and
the fallback for anything a tenant leaves unset. Tokens live in `globals.css` (generated from
`PLATFORM_PRIMARY` and `PLATFORM_SECONDARY` in `lib/tenant-theme.ts`); public-page utilities are
`font-serif-soft`, `bg-paper`, `shadow-soft`, `shadow-lift`, `animate-rise`, `reveal` (with
`components/landing/reveal.tsx`) and `photo-zoom`.

**Per-tenant theme.** `TenantBrandScope` (`components/providers/tenant-brand-scope.tsx`) reads the
tenant's brand from the public record (`GET /api/v1/tenants/by-slug/{slug}`: logo, primary and
secondary colour) and `lib/tenant-theme.ts` derives the whole token set from it: primary (darkened
until it holds 4.5:1 contrast), readable foreground, tinted neutrals, border, focus ring, gold
accent from the secondary colour, charts, shadows, and a separate dark theme with a lightened
brand. It is injected as one `<style id="tenant-theme">` for the life of the scope, so sign-in,
sign-up, reset and the dashboard all follow the tenant. The last theme per slug is cached in
localStorage for first paint. A tenant with no brand colour keeps the platform theme, and one with a
primary but no secondary gets the Codevertex orange as its accent.

## Sign-in pages

Login, sign-up, forgot and reset password use `components/auth/AuthShell`: the form on warm paper in
a serif headline (wide, 30rem, not a narrow card) beside a solid brand panel. The panel shows what
the person is signing in to: the real app grid on the platform, or three concrete things a
customer, rider or student gets from a tenant's app. Phones get a brand band above the form. The
tenant's logo sits on a neutral plate top-left; its name and the app's own name come from
`service_branding`.

**Where the branding tenant comes from.** `lib/auth-context.ts resolveAuthContext` reads, in order: the
`tenant` param, the `tenant` inside the authorize URL in `return_to`, then the
`/<slug>/auth/callback` path of either `redirect_uri`. The app (`client_id`) comes from the param or
from inside `return_to`. Every link between auth pages is built with `authFlowHref`, which keeps
`return_to`, `client_id`, `tenant` and the other flow params.

**Login** (`app/login`, `components/auth/LoginForm`): providers side by side first, then email and
password with "Forgot password?" beside the label, "Sign in with a passkey" as a secondary action,
the MFA, terms and passkey-nudge steps, and a forced new password after a temporary-password login.
Sign-in is central, not per tenant. Social providers are the same for everyone
(`GET /auth/integrations/active?category=oauth`; auth-api ignores `tenant_slug` for that category),
and each starts with `POST /auth/oauth/{provider}/start`. The only tenant input to login, social
login, passkeys and the organisation wizard is the explicit `tenant` URL parameter
(`flow.loginTenant`), which auth-api uses as the session's target tenant (with none it resolves the
person's primary tenant). The tenant derived from `return_to` or `redirect_uri` (`flow.tenantSlug`) is
for BRANDING and the customer sign-up target only.
"New to <tenant>? Create an account" for customer apps and tenant flows, "No account yet? Create
one" on the platform.

**Sign-up** (`app/signup`): customer apps (`CUSTOMER_APPS`: ordering, rider app, Digitika) get the
short `CustomerSignupForm` and are registered into the tenant with the app's `client_id`, so
auth-api gives the right role; everything else gets the organisation wizard.

## Landing page

`app/page.tsx` is a server component: hero with the real app grid (`components/landing/AppLauncher`,
fed by `config/launcher-apps.ts`), a bento of what the apps do drawn with the design tokens
(`AppScenes`, sample values only), who signs in (staff, customers, riders, students, parents), how
setup works beside a preview of two differently branded sign-in pages, security, and a Maskani band
with its own photography. The directory (`ServiceDirectory`) keeps the original logic: every service
from `config/services.ts` with its status from `/api/health`, filterable by category, linking through
`getServiceUrl` (signed in goes straight to the app, otherwise through sign-in and back). The hero
tiles link the same way. `SiteNav` and `SiteFooter` replace the old Navbar and Footer on every public
page. The viewport no longer disables pinch zoom.

Fonts are declared in `@theme inline` in `globals.css`: next/font defines `--font-dm-sans` on
`<body>`, and a plain `@theme` value resolved on `:root` made every page render in Times New Roman.

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
