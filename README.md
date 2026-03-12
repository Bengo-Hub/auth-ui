# BengoBox Auth UI

The central identity and access management portal for the BengoBox ecosystem.

## Overview

BengoBox Auth UI is a Next.js 15 application that serves as the Single Sign-On (SSO) hub for all BengoBox services. It provides a unified interface for authentication, user profile management, and developer tools.

## Features

- **Unified Login/Signup**: One account for all BengoBox services.
- **Service Directory**: Discover and launch BengoBox applications.
- **Account Security**: MFA, password management, and session tracking.
- **Developer Portal**: Manage OAuth clients and API keys.

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

## Deployment
The application is deployed at `https://accounts.codevertexitsolutions.com`.

## Environment

| Variable | Description | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_URL` | SSO (auth-api) base URL used for API calls and for validating `return_to` (service-originated login). Must be set so the sso authorize URL is allowed as a safe redirect. | `https://sso.codevertexitsolutions.com` |

Set `NEXT_PUBLIC_API_URL` to the auth-api (SSO) base in all environments. If unset, auth-ui falls back to `https://sso.codevertexitsolutions.com` for both the api-client base URL and return_to validation (see `src/lib/utils.ts`).

**Entry flows:**
- **Direct login:** User opens `/login` (no `return_to`). After credentials, auth-ui redirects to `/dashboard` or a valid relative return_to.
- **Service-originated login:** User clicks Sign in on a service (e.g. ordering-frontend); auth-api redirects to auth-ui with `?return_to=<full_sso_authorize_url>&tenant=...`. After credentials, auth-ui does a **full page redirect** to that URL so the session cookie is sent to sso; auth-api then redirects to the service callback with the auth code.
- **Landing → service:** From auth-ui landing (`/`), if the user clicks a service link while unauthenticated, they go to `/login?return_to=<service_url>`. After login, `return_to` is validated against allowed app origins and the user is redirected to that service.

**Logout:** The app uses a `useLogout` hook that calls POST `/api/v1/auth/logout` (clears server session and cookie), clears the auth store, removes the React Query `['me']` cache, and redirects to `/`. This ensures the navbar shows "Log In" / "Start Free" immediately after logout.

## Documentation
- [Implementation Plan](./plan.md)
- [Sprints](./docs/sprints/)
