# auth-ui -- UX/UI Patterns

**Last Updated**: March 6, 2026

This document defines the user-facing flows, page layouts, and interaction patterns for `auth.codevertexitsolutions.com`.

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

### Platform Admin Pages

| Page | Route | Role Required | Purpose |
|------|-------|--------------|---------|
| Gateways | `/dashboard/platform/gateways` | `super_admin` | Payment gateway configuration |
| Notifications | `/dashboard/platform/notifications` | `super_admin` | Platform notification settings |

---

## Login Flow UX

### Step 1: Email/Password

- Single-column centered card layout
- Email input with validation
- Password input with show/hide toggle
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons below divider (Google, GitHub, Microsoft)
- "Don't have an account? Sign up" link

### Step 2: MFA Challenge (conditional)

If user has MFA enabled, after successful password verification:

- 6-digit TOTP code input (auto-focus, auto-submit on 6 digits)
- "Use backup code" link as fallback
- 30-second countdown timer showing code validity window
- "Trouble signing in?" help link

### Step 3: Redirect

On successful authentication:
- If OIDC flow: redirect to requesting service with authorization code
- If direct login: redirect to `/dashboard`
- Toast notification: "Welcome back, {name}"

---

## Signup Flow UX

- Email, password, confirm password fields
- Password strength indicator (weak/medium/strong)
- Terms of service checkbox
- On success: redirect to login with success toast
- On conflict (email exists): inline error with "Sign in instead" link

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
Platform (super_admin only)
  Payment Gateways
  Notifications
```

### Top Bar

- BengoBox logo + "Auth" label
- Current user avatar + name dropdown
  - View profile
  - Sign out
- Notification bell (future)

---

## Platform Admin Section

### Payment Gateways (`/dashboard/platform/gateways`)

**Access**: `super_admin` only (platform admin at `admin@codevertexitsolutions.com`)

- Table listing all configured payment gateways
- Columns: Name, Provider, Status, Last Updated
- Actions: Add gateway, edit, toggle active/inactive
- Each gateway has: provider type (M-Pesa, Stripe, etc.), API credentials (masked), webhook URL, environment (sandbox/production)

### Platform Roles (`/dashboard/platform/notifications`)

**Access**: `super_admin` only

- Manage platform-wide notification preferences
- Configure default notification channels per event type

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
