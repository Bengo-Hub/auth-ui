# Sprint 3: Service Directory & Landing Page

**Status**: ✅ Completed (January 2026)

## Objectives
- Implement the public landing page showcasing the BengoBox ecosystem.
- Create a "Hub" experience for authenticated users to switch between services.

## Tasks

### 1. Landing Page (`/`)
- [x] **Hero Section**: High-impact headline about unified identity.
- [x] **Service Grid**: Cards for each microservice:
  - **Cafe Website**: "Premium dining & hub experience"
  - **Ordering Service**: "Seamless food & retail delivery"
  - **Logistics Service**: "Fleet & rider orchestration"
  - **Inventory Service**: "Real-time stock management"
  - **Finance Service**: "Treasury & payment processing"
  - **ERP**: "Enterprise resource planning"
- [x] **Service Logic**:
  - If unauthenticated: Clicking a service redirects to `/login?return_to={service_url}`.
  - If authenticated: Clicking a service redirects directly to the service URL with session hint.

### 2. User Dashboard
- [x] Overview of active sessions.
- [x] Quick links to frequently used services.
- [x] Recent activity log.

## Critical Fixes (January 2026)

### Public Landing Page 401 Redirect Fix
**Issue**: Landing page was redirecting unauthenticated users to `/login?return_to=/` because the axios interceptor automatically redirected on ANY 401 response, including the `/auth/me` API call made by `useAuth` hook.

**Fix Applied** (`src/lib/api-client.ts`):
- Added `PUBLIC_ROUTES` array defining routes that should NOT trigger 401 redirects
- Modified response interceptor to check `isPublicRoute()` before redirecting
- Public routes now gracefully handle unauthenticated state via `useAuth` hook

**Public Routes Protected from Auto-Redirect**:
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/status` - Status page
- `/docs` - Documentation

## Definition of Done
- [x] Landing page is accessible and responsive.
- [x] Service switching works seamlessly for authenticated users.
- [x] Unauthenticated users can browse landing page without forced redirect.
