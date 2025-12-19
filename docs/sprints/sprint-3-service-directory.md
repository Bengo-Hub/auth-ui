# Sprint 3: Service Directory & Landing Page

**Status**: Not Started ⏳

## Objectives
- Implement the public landing page showcasing the BengoBox ecosystem.
- Create a "Hub" experience for authenticated users to switch between services.

## Tasks

### 1. Landing Page (`/`)
- [ ] **Hero Section**: High-impact headline about unified identity.
- [ ] **Service Grid**: Cards for each microservice:
  - **Cafe Website**: "Premium dining & hub experience"
  - **Ordering Service**: "Seamless food & retail delivery"
  - **Logistics Service**: "Fleet & rider orchestration"
  - **Inventory Service**: "Real-time stock management"
  - **Finance Service**: "Treasury & payment processing"
  - **ERP**: "Enterprise resource planning"
- [ ] **Service Logic**:
  - If unauthenticated: Clicking a service redirects to `/login?return_to={service_url}`.
  - If authenticated: Clicking a service redirects directly to the service URL with a session hint.

### 2. User Dashboard
- [ ] Overview of active sessions.
- [ ] Quick links to frequently used services.
- [ ] Recent activity log.

## Definition of Done
- Landing page is accessible and responsive.
- Service switching works seamlessly for authenticated users.
