# BengoBox Auth UI - Developer Guide

**Last Updated**: January 2026  
**Version**: 1.0

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication Flows](#authentication-flows)
4. [Development Setup](#development-setup)
5. [API Integration](#api-integration)
6. [SDK References](#sdk-references)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Overview

BengoBox Auth UI is the central identity and access management portal serving as the Single Sign-On (SSO) hub for all BengoBox services. It provides:

- **Unified Authentication**: One account for all BengoBox services
- **OIDC/OAuth2 Support**: Standard protocols for secure SSO
- **Service Directory**: Discover and launch integrated services
- **Account Management**: Profile, MFA, and security settings
- **Developer Portal**: API key and OAuth client management

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Auth Service** | Backend authentication API (`auth-api`) |
| **Auth UI** | Frontend application (this project) |
| **JWKS** | JSON Web Key Set for token validation |
| **OIDC** | OpenID Connect protocol for SSO |
| **JWT** | JSON Web Tokens for stateless authentication |
| **Session Cookie** | `bb_session` httpOnly cookie for SSO persistence |

---

## Architecture

### System Components

```
┌─────────────────┐
│   BengoBox      │
│   Services      │  (Ordering, Logistics, etc.)
└────────┬────────┘
         │
         │ Redirect to login
         │
         ▼
┌─────────────────────────────────────┐
│      Auth UI (This Project)         │
│  ─────────────────────────────────  │
│  • Next.js 15 (React 19)            │
│  • TypeScript + Tailwind            │
│  • Zustand + TanStack Query         │
│  • PWA-enabled                      │
└────────┬────────────────────────────┘
         │
         │ REST API calls
         │
         ▼
┌──────────────────────────────────┐
│    Auth API (Go Backend)         │
│  ─────────────────────────────   │
│  • OIDC Provider                 │
│  • JWT Issuer                    │
│  • User Management               │
│  • RBAC Enforcement              │
└──────────────────────────────────┘
         │
         │
         ▼
┌──────────────────────────────────┐
│     PostgreSQL Database          │
│  ─────────────────────────────   │
│  • Users & Tenants               │
│  • Roles & Permissions           │
│  • OAuth Clients                 │
│  • API Keys                      │
└──────────────────────────────────┘
```

### Technology Stack

**Frontend Framework**:
- **Next.js 15**: App Router (no `_document`/`_app`)
- **React 19**: Modern component library
- **TypeScript**: Type-safe development
- **Tailwind CSS + Shadcn UI**: Styling and components

**State Management**:
- **Zustand**: Global auth state (user, tokens, permissions)
- **TanStack Query**: Server state and API caching
- **React Hook Form + Zod**: Form handling and validation

**API Communication**:
- **Axios**: HTTP client with interceptors
- **Authentication**: Bearer JWT tokens + httpOnly cookies
- **Interceptors**: Auto-refresh on 401, error handling

**Additional Libraries**:
- **next-pwa**: Progressive Web App support
- **zod**: Schema validation
- **sonner**: Toast notifications

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Signup page
│   │   └── callback/page.tsx     # OIDC callback handler
│   ├── account/
│   │   ├── profile/page.tsx      # User profile
│   │   ├── security/page.tsx     # MFA, password, sessions
│   │   └── settings/page.tsx     # Account settings
│   ├── dashboard/
│   │   ├── page.tsx              # Tenant dashboard
│   │   ├── users/page.tsx        # User management
│   │   └── roles/page.tsx        # Role management
│   └── developer/
│       ├── api-keys/page.tsx     # API key management
│       └── oauth-clients/page.tsx # OAuth client registration
├── components/
│   ├── auth/                     # Auth-specific components
│   ├── layout/                   # Layout components
│   └── ui/                       # Shadcn UI components
├── hooks/
│   ├── useAuth.ts                # Auth state hook
│   ├── useUser.ts                # User data hook
│   └── useTenant.ts              # Tenant data hook
├── lib/
│   ├── api/                      # API client setup
│   ├── auth/                     # Auth utilities
│   └── utils.ts                  # Helper functions
├── store/
│   ├── auth.ts                   # Zustand auth store
│   └── user.ts                   # Zustand user store
└── config/
    └── brand.ts                  # Branding configuration
```

---

## Authentication Flows

### 1. Login Flow (OIDC Authorization Code Flow)

```
User Browser              Auth UI               Auth API
    │                        │                      │
    ├──── Visit Service ─────>                      │
    │    (redirect to login)                         │
    │                                                │
    │<─── Redirect to Auth UI ────────────────────  │
    │    /auth/login?client_id=...&redirect_uri=... │
    │                                                │
    ├───────► Submit Login Form                     │
    │                     │                         │
    │                     ├─ POST /auth/login ────> │
    │                     │                         │
    │                     │<─ Generate JWT ──────── │
    │                     │                         │
    │                     │ Set bb_session cookie   │
    │<─────────────────── │                         │
    │   Redirect to callback with code              │
    │                                                │
    ├──────────► Exchange code for token           │
    │                                                │
    └─────► Authenticated Session Established
```

**Key Endpoints**:
- `POST /api/v1/auth/login` - Username/password authentication
- `POST /api/v1/auth/signup` - New account creation
- `GET /api/v1/auth/callback` - OIDC callback handler
- `POST /api/v1/auth/token` - Token exchange
- `POST /api/v1/auth/refresh` - Token refresh

### 2. Multi-Factor Authentication (MFA)

```
Login Page
    ├─ Enter email/password
    │
    ├─ Validate credentials (401 if invalid)
    │
    ├─ Check if MFA enabled
    │  ├─ No MFA: Issue tokens, set session
    │  └─ MFA enabled: Prompt for TOTP
    │
    ├─ MFA Verification
    │  ├─ User enters 6-digit code from authenticator
    │  ├─ POST /api/v1/auth/mfa/verify
    │  └─ If valid: Issue tokens, set session
    │
    └─ Redirect to service with authorization code
```

### 3. Service Directory Flow

```
1. Unauthenticated User visits https://accounts.codevertexitsolutions.com/
2. Landing page displays:
   ├─ BengoBox introduction
   ├─ Service cards (Ordering, Logistics, Finance, etc.)
   │  └─ "Launch Service" for authenticated users
   │  └─ "Sign In to Access" for unauthenticated users
   └─ Sign In / Sign Up call-to-action buttons
3. Clicking service card:
   ├─ If authenticated: Redirect to service with valid token
   └─ If not authenticated: Redirect to login with service info
```

---

## Development Setup

### Prerequisites
- Node.js 20+ or higher
- pnpm (preferred) or npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Bengo-Hub/auth-ui.git
cd auth-ui

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:4000

# OAuth Configuration
NEXT_PUBLIC_CLIENT_ID=auth-ui
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback

# Branding
NEXT_PUBLIC_BRAND_NAME=BengoBox
NEXT_PUBLIC_BRAND_LOGO_URL=/logo.jpg
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#ea8022
```

### Local Development

```bash
# Start development server
pnpm dev

# Application available at http://localhost:3000

# Run with auth-api locally (separate terminal)
# In auth-api repository:
go run ./cmd/api/main.go
# API available at http://localhost:4000
```

### Build & Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Run tests (once configured)
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

---

## API Integration

### Axios Client Setup

The application uses Axios with custom interceptors for authentication:

```typescript
// lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Include bb_session cookie
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        return apiClient.request(error.config);
      } else {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    throw error;
  }
);

export default apiClient;
```

### Key API Endpoints

#### Authentication

```typescript
// Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "secure_password",
  "mfa_code": "123456" // Optional if MFA enabled
}

// Signup
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "password": "secure_password",
  "tenant_name": "My Organization" // Optional
}

// Token Refresh
POST /api/v1/auth/refresh
{
  "refresh_token": "..."
}

// Logout
POST /api/v1/auth/logout
```

#### User Management

```typescript
// Get current user
GET /api/v1/users/me

// Update profile
PATCH /api/v1/users/me
{
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://..."
}

// List users (admin)
GET /api/v1/tenants/:tenant_id/users

// Invite user (admin)
POST /api/v1/tenants/:tenant_id/users
{
  "email": "newuser@example.com",
  "role": "viewer"
}
```

#### RBAC & Permissions

```typescript
// Get user permissions
GET /api/v1/users/me/permissions

// Response format:
{
  "permissions": [
    "users:read",
    "users:write",
    "api_keys:create",
    "api_keys:read",
    "api_keys:delete"
  ]
}
```

---

## SDK References

### Authentication SDK (Go)

For backend services integrating with BengoBox auth:

**Repository**: https://github.com/Bengo-Hub/shared-auth-client

**Documentation**: [shared/auth-client](https://github.com/Bengo-Hub/shared-auth-client#readme)

**Installation**:
```go
require github.com/Bengo-Hub/shared-auth-client v0.1.0
```

**Usage** (Chi Router):
```go
import authclient "github.com/Bengo-Hub/shared-auth-client"

// Initialize validator
config := authclient.DefaultConfig(
  "https://sso.codevertexitsolutions.com/api/v1/.well-known/jwks.json",
  "https://sso.codevertexitsolutions.com",
)

validator := authclient.NewValidator(config)

// Middleware
router.Use(authclient.ChiMiddleware(validator))
```

### Frontend SDK (JavaScript/TypeScript)

Currently, the Auth UI directly uses standard HTTP clients (Axios). For integrating services:

**Method 1: Direct HTTP Calls**
```typescript
import axios from 'axios';

const authClient = axios.create({
  baseURL: 'https://sso.codevertexitsolutions.com/api/v1',
  withCredentials: true,
});

// Login
const response = await authClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password',
});

const { token, refresh_token } = response.data;
```

**Method 2: Redirect-based OIDC (Recommended for Web Apps)**
```html
<!-- Redirect to Auth UI login -->
<a href="https://sso.codevertexitsolutions.com/auth/login?
  client_id=your-app&
  redirect_uri=https://yourapp.com/callback&
  state=your-state-param&
  scope=openid%20email%20profile">
  Sign In with BengoBox
</a>
```

**Method 3: Using Zustand Store (Auth UI)**
```typescript
import { useAuthStore } from '@/store/auth';

function MyComponent() {
  const { user, isAuthenticated, login } = useAuthStore();
  
  const handleLogin = async () => {
    await login(email, password, mfaCode);
  };
  
  return <>{isAuthenticated && <p>Welcome, {user?.email}</p>}</>;
}
```

---

## Security Considerations

### 1. Session Management

- **Session Cookie**: `bb_session` stored httpOnly, Secure, SameSite=Strict
- **JWT Token**: Stored in memory (not localStorage to prevent XSS)
- **Token Refresh**: Automatic refresh on 401 response
- **Logout**: Clear token from memory and invalidate bb_session

### 2. Authentication

- **HTTPS Only**: All auth endpoints require TLS
- **Password Policy**: Enforce minimum complexity (configured in auth-api)
- **MFA Support**: TOTP-based multi-factor authentication
- **Rate Limiting**: Brute-force protection on login endpoints

### 3. Authorization

- **RBAC Enforcement**: UI gates features based on user permissions
- **Permission Fetch**: Permissions loaded on login and stored in Zustand
- **Tenant Isolation**: All data scoped to authenticated user's tenant
- **API Key Management**: Secure key rotation and revocation

### 4. Data Protection

- **No PII in Logs**: Auth system configured to exclude sensitive data
- **Encrypted Storage**: Passwords and secrets encrypted at rest
- **Audit Logging**: All auth events logged for compliance

### 5. Frontend Security

- **Content Security Policy**: Configured in `next.config.mjs`
- **XSS Prevention**: Strict escaping of user input
- **CSRF Protection**: SameSite cookies for state-changing operations
- **Dependency Scanning**: Regular vulnerability audits via npm audit

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to auth-api"
```
Error: ECONNREFUSED at localhost:4000

Solution:
- Ensure auth-api is running: go run ./cmd/api/main.go
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify firewall/port settings
```

#### 2. "Session cookie not being set"
```
Error: Login successful but no bb_session cookie appears

Solution:
- Ensure withCredentials: true in Axios config
- Check HTTPS/localhost compatibility (cookies require Secure flag on HTTPS)
- Verify SameSite=Strict allows cross-site requests
- Check browser console for cookie warnings
```

#### 3. "Token refresh failing"
```
Error: Infinite redirect loop during token refresh

Solution:
- Check refresh_token validity in Zustand store
- Verify auth-api token refresh endpoint is working
- Check for circular dependencies in interceptors
- Add error boundary to prevent infinite retry loops
```

#### 4. "MFA code not validating"
```
Error: "Invalid MFA code" even with correct authenticator code

Solution:
- Check device time sync (TOTP is time-based)
- Verify MFA secret was saved correctly during setup
- Try code from previous/next 30-second window
- Check auth-api MFA validation logic
```

#### 5. "RBAC not working"
```
Error: Admin features visible despite lacking permissions

Solution:
- Verify permissions endpoint returns correct data
- Check permission check logic in components
- Clear browser cache and re-login
- Check user role assignment in database
```

### Debug Mode

Enable verbose logging:

```typescript
// lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  console.debug('[API Request]', config.method.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use((response) => {
  console.debug('[API Response]', response.status, response.data);
  return response;
});

// Zustand store
const useAuthStore = create<AuthState>((set, get) => ({
  login: async (email, password) => {
    console.debug('[Auth] Login attempt:', email);
    // ... logic
  },
}));
```

### Reporting Issues

When reporting bugs:
1. Check auth-api logs: `docker logs auth-api` or terminal output
2. Check browser console for JavaScript errors
3. Check network tab for API response errors
4. Include `.env.local` settings (without secrets)
5. Include browser/Node.js versions

---

## Additional Resources

- [Auth API Documentation](../../docs/API-INTEGRATION-GUIDE.md)
- [RBAC Implementation Guide](../../docs/RBAC_IMPLEMENTATION_GUIDE.md)
- [Shared Auth Client](https://github.com/Bengo-Hub/shared-auth-client)
- [BengoBox Architecture](../../../docs/microservice-architecture.md)
- [Cross-Service Data Ownership](../../../docs/CROSS-SERVICE-DATA-OWNERSHIP.md)

---

**Maintained by**: BengoBox Core Team  
**Last Updated**: January 2026
