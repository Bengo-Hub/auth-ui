# Auth UI - Implementation Plan

## Executive Summary

**System Purpose**: The central identity and access management portal for the BengoBox ecosystem. It provides a unified, secure, and branded experience for users to sign in, sign up, and manage their accounts across all BengoBox services.

**Public URL**: `https://accounts.codevertexitsolutions.com`

**Key Capabilities**:
- **Single Sign-On (SSO)**: Centralized login and signup for all BengoBox microservices.
- **Service Directory**: A landing page showcasing all integrated services (Ordering, Logistics, Cafe, etc.).
- **Account Management**: User profile updates, password changes, and MFA configuration.
- **Tenant Management**: For admins to manage their organizations, users, and roles.
- **Developer Portal**: Self-service API key management, OAuth client registration, and rotation.
- **RBAC Enforcement**: UI-level access control based on roles and permissions fetched from `auth-api`.
- **PWA Support**: Enhanced mobile experience with offline capabilities and install prompts.

---

## Branding & Identity

**Visual Identity**: Aligned with the BengoBox ecosystem (Premium, Modern, Secure).
- **Primary Color**: BengoBox Orange (`#ea8022`).
- **Typography**: Geist Sans & Mono.
- **Experience**: Fast, accessible, and mobile-first.

---

## Technology Stack

### Frontend Framework
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand (Global State) + TanStack Query (Server State)
- **API Client**: Axios with interceptors for auth handling.
- **PWA**: `@ducanh2912/next-pwa` for service worker and manifest management.
- **Forms**: React Hook Form + Zod

### Integration
- **Backend**: `auth-api` (Go)
- **Protocols**: OIDC, OAuth2, JWT, Session Cookies (`bb_session`)
- **Events**: NATS JetStream for user/tenant sync notifications.

---

## Architecture Overview

### SSO Flow
1. **Initiation**: User clicks "Login" on a service (e.g., `cafe-website`).
2. **Redirect**: Service redirects to `https://accounts.codevertexitsolutions.com/login?client_id=...&redirect_uri=...&state=...`.
3. **Authentication**: User logs in or signs up on `auth-ui`.
4. **Callback**: `auth-ui` redirects back to the service's redirect URI with an authorization code.
5. **Session**: Service exchanges code for tokens and establishes a session.

### RBAC & Permissions
- `auth-ui` fetches user roles and permissions from `auth-api` upon login.
- Interfaces for API key management, user management, etc., are gated by these permissions.

---

## Implementation Sprints

### Sprint 1: Foundation & Modern Stack (COMPLETED)
- [x] Next.js 15 setup with Tailwind and Shadcn.
- [x] Zustand store for auth state.
- [x] TanStack Query for data fetching.
- [x] Axios client with 401 interceptors.
- [x] PWA manifest and service worker configuration.
- [x] PWA install prompt component.

### Sprint 2: Authentication & OIDC Integration (COMPLETED)
- [x] Login page with email/password and social providers.
- [x] Signup page with tenant creation/selection.
- [x] Password reset and email verification flows.
- [x] MFA (TOTP) setup and verification screens.
- [x] Integration with `auth-api` OIDC endpoints.

### Sprint 3: Service Directory & Landing Page (COMPLETED)
- [x] Detailed landing page showing all BengoBox services.
- [x] Top navigation with Sign In/Sign Up buttons.
- [x] Service cards with "Launch" or "Login to Access" logic.
- [x] Mobile-first responsive design for all screens.

### Sprint 4: Account & Tenant Management (COMPLETED)
- [x] User profile management (name, email, avatar).
- [x] Tenant dashboard for organization admins.
- [x] User invitation and role assignment interface.

### Sprint 5: Developer Portal & RBAC (COMPLETED)
- [x] API Key management (Create, List, Rotate, Revoke).
- [x] OAuth Client registration for developers.
- [x] RBAC enforcement across all UI components.
- [ ] Audit log viewer for security events.

### Sprint 6: Production Hardening
- [ ] SEO optimization and meta tags.
- [ ] Performance tuning and caching.
- [ ] Security audit and penetration testing.
- [ ] Deployment to `https://accounts.codevertexitsolutions.com`.
