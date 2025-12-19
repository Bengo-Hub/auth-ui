# Sprint 2: Authentication & OIDC Integration

**Status**: IN PROGRESS 🏗️

## Objectives
- Implement the core authentication flows (Login, Signup, Password Reset).
- Integrate with `auth-api` OIDC endpoints.
- Handle session cookies (`bb_session`) for seamless SSO.

## Tasks

### 1. Authentication Pages
- [ ] **Login Page**:
  - Email/Password form with validation.
  - Social login buttons (Google, Microsoft).
  - "Remember Me" functionality.
- [ ] **Signup Page**:
  - Tenant creation/selection flow.
  - User registration with email verification.
- [ ] **Password Reset**:
  - "Forgot Password" request form.
  - "Reset Password" form with token validation.

### 2. OIDC Integration
- [ ] Implement OIDC `/authorize` flow handling.
- [ ] Support `return_to` and `client_id` parameters.
- [ ] Handle session cookie issuance and validation via `auth-api`.

### 3. MFA & Security
- [ ] Implement TOTP (Google Authenticator) setup flow.
- [ ] MFA verification screen during login.
- [ ] Secure session management with HttpOnly cookies.

## Definition of Done
- Users can log in and sign up successfully.
- OIDC redirects from other services are handled correctly.
- Sessions are persisted securely via cookies.
