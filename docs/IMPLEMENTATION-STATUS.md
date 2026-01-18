# Auth UI - Implementation Status & Architecture Details

**Last Updated**: January 2026  
**Status**: Sprint 5 Completed, Sprint 6 In Progress

---

## Implementation Summary

BengoBox Auth UI is the **central Single Sign-On (SSO) portal** serving as the unified identity provider for all BengoBox services. It integrates with the Auth API backend (Go) using OpenID Connect (OIDC) flow and JWT-based stateless authentication.

### Current Sprint Status

| Sprint | Title | Status | Key Deliverables |
|--------|-------|--------|------------------|
| Sprint 1 | **Foundation** | ✅ Complete | Next.js 15 setup, basic auth flow, Zustand store, Tailwind styling |
| Sprint 2 | **Authentication** | ✅ Complete | Login/signup, OIDC callback, JWT refresh, MFA setup (TOTP) |
| Sprint 3 | **Authorization & Roles** | ✅ Complete | Role-based access control, permission policies, UI gating, admin dashboard |
| Sprint 4 | **Account Management** | ✅ Complete | Profile editing, security settings, password reset, session management |
| Sprint 5 | **Developer Portal** | ✅ Complete | API key management, OAuth client registration, service documentation |
| Sprint 6 | **Hardening & Scale** | 🔄 In Progress | SEO optimization, performance tuning, security audit, scalability testing |

---

## Architecture Overview

### Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser / Client                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         BengoBox Services (Ordering, Logistics, etc)   │  │
│  │  1. User clicks "Sign In"                              │  │
│  │  2. Redirects to Auth UI with client_id & redirect_uri │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ Redirect to login
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    Auth UI Portal                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router                                 │  │
│  │  ├─ /auth/login - Login form                          │  │
│  │  ├─ /auth/signup - Registration form                  │  │
│  │  ├─ /auth/callback - OIDC callback handler            │  │
│  │  ├─ /account/* - User account management              │  │
│  │  ├─ /dashboard/* - Tenant admin dashboard             │  │
│  │  └─ /developer/* - API keys & OAuth clients           │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  State Management                                      │  │
│  │  ├─ Zustand: auth store (user, token, permissions)   │  │
│  │  ├─ TanStack Query: server state caching              │  │
│  │  └─ React Hook Form + Zod: form validation            │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  API Communication                                     │  │
│  │  ├─ Axios with interceptors                           │  │
│  │  ├─ JWT in Authorization header                       │  │
│  │  ├─ bb_session httpOnly cookie for persistence        │  │
│  │  └─ Auto-refresh on 401 Unauthorized                  │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ REST API calls
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    Auth API (Go Backend)                      │
│  ├─ OIDC Provider (OAuth2 server)                           │
│  ├─ JWT Token Issuer & Validator                           │
│  ├─ User Management (CRUD, MFA)                            │
│  ├─ Permission Enforcement (RBAC)                          │
│  ├─ API Key Management                                      │
│  ├─ NATS JetStream Event Publisher                         │
│  └─ PostgreSQL Database Adapter                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   Data Layer                                  │
│  ├─ PostgreSQL (users, roles, permissions, keys)            │
│  ├─ Redis (session cache, idempotency)                      │
│  ├─ NATS JetStream (user sync events, audit logs)           │
│  └─ Secrets (encrypted at rest)                             │
└──────────────────────────────────────────────────────────────┘
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 15 | React framework with App Router |
| **UI Language** | TypeScript | Type-safe component development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | Shadcn UI | Accessible component library |
| **State Management** | Zustand | Lightweight global state |
| **Server State** | TanStack Query | API response caching & sync |
| **Form Handling** | React Hook Form + Zod | Form validation & submission |
| **HTTP Client** | Axios | REST client with interceptors |
| **Icons** | Lucide React | SVG icon library |
| **Notifications** | Sonner | Toast notifications |
| **PWA Support** | next-pwa | Progressive web app features |
| **Backend API** | Go 1.22+ | REST API server |
| **API Router** | Chi | HTTP router |
| **Database** | PostgreSQL | Primary data store |
| **Cache** | Redis | Session & data caching |
| **Events** | NATS JetStream | Async event publishing |
| **Secrets** | Encrypted fields | PII protection at rest |

---

## Authentication Flow Details

### 1. OIDC Authorization Code Flow

**Sequence Diagram**:
```
User               Auth UI            Auth API           Database
 │                   │                   │                  │
 ├──── Visit App ──> │                   │                  │
 │      (redirect)   │                   │                  │
 │                   │                   │                  │
 ├─ Enter Email/Pwd ─>                   │                  │
 │                   ├─── POST /login ──>                   │
 │                   │    (email, pwd)   ├─ Verify ────────>
 │                   │                   │                  │
 │                   │<─── JWT + Refresh ─                  │
 │                   │     (tokens)       │                  │
 │                   │                   │                  │
 │                   ├─ Set bb_session ──────────────────────
 │                   │    (httpOnly)      │                  │
 │                   │                    │                  │
 │<─ Redirect to ────                     │                  │
 │   service.com     │                    │                  │
 │   (with code)     │                    │                  │
```

### 2. Token Management

**Token Lifecycle**:
```
┌─────────────────────────────────────────────────┐
│          Token Refresh Flow                     │
│                                                 │
│  Access Token (short-lived, ~15 min)           │
│  ├─ Sent in Authorization header               │
│  ├─ Used for API requests                      │
│  └─ Expires → Trigger refresh                  │
│                                                │
│  Refresh Token (long-lived, ~30 days)         │
│  ├─ Stored securely in server memory           │
│  ├─ Used to request new access token          │
│  └─ Never sent to frontend                    │
│                                                │
│  Session Cookie (bb_session)                   │
│  ├─ httpOnly flag (prevent JS access)         │
│  ├─ Secure flag (HTTPS only)                  │
│  ├─ SameSite=Strict (prevent CSRF)            │
│  └─ Persistance indicator                     │
└─────────────────────────────────────────────────┘
```

### 3. MFA Flow (TOTP-based)

**Setup Process**:
```
1. User clicks "Enable MFA" in Security Settings
2. Auth API generates TOTP secret
3. Auth UI displays QR code + backup codes
4. User scans QR with authenticator app (Google Authenticator, Authy, etc.)
5. User enters 6-digit code from app
6. Auth API validates code against secret
7. MFA enabled, backup codes stored securely

Login with MFA:
1. User enters email/password
2. Auth API detects MFA enabled
3. Auth UI prompts for 6-digit TOTP code
4. User enters code from authenticator app
5. Auth API validates (within ±30 second window)
6. Tokens issued, session established
```

---

## Data Model

### Key Entities

#### Users
```
users:
  id: UUID (PK)
  tenant_id: UUID (FK) - Multi-tenancy
  email: string (unique per tenant)
  first_name: string
  last_name: string
  password_hash: string (bcrypt)
  avatar_url: string (optional)
  mfa_enabled: boolean
  mfa_secret: string (encrypted, TOTP)
  backup_codes: string[] (encrypted)
  created_at: timestamp
  updated_at: timestamp
  deleted_at: timestamp (soft delete)
```

#### Roles & Permissions
```
roles:
  id: UUID (PK)
  tenant_id: UUID (FK)
  name: string (e.g., "admin", "viewer")
  description: string
  created_at: timestamp

role_permissions:
  role_id: UUID (FK)
  permission_id: UUID (FK)

permissions:
  id: UUID (PK)
  name: string (e.g., "users:write", "api_keys:delete")
  description: string
  service: string (e.g., "auth", "ordering", "logistics")
```

#### API Keys
```
api_keys:
  id: UUID (PK)
  tenant_id: UUID (FK)
  user_id: UUID (FK)
  name: string
  key_hash: string (SHA-256)
  last_used: timestamp
  expires_at: timestamp (optional)
  scopes: string[] (permissions)
  created_at: timestamp
  revoked_at: timestamp (soft delete)
```

#### OAuth Clients
```
oauth_clients:
  id: UUID (PK)
  tenant_id: UUID (FK)
  name: string (e.g., "Ordering App", "Mobile Client")
  client_id: string (unique)
  client_secret_hash: string (bcrypt)
  redirect_uris: string[] (allowed redirect URLs)
  allowed_scopes: string[]
  grant_types: string[] (authorization_code, refresh_token)
  created_at: timestamp
```

---

## API Endpoint Summary

### Authentication Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/v1/auth/login` | POST | Login with email/password | ❌ No |
| `/api/v1/auth/signup` | POST | Register new account | ❌ No |
| `/api/v1/auth/logout` | POST | Logout (invalidate tokens) | ✅ Yes |
| `/api/v1/auth/refresh` | POST | Refresh access token | ✅ Yes |
| `/api/v1/auth/password/reset` | POST | Request password reset | ❌ No |
| `/api/v1/auth/password/reset/:token` | PATCH | Complete password reset | ❌ No |

### MFA Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/v1/auth/mfa/setup` | POST | Generate TOTP secret | ✅ Yes |
| `/api/v1/auth/mfa/verify` | POST | Verify TOTP code | ✅ Yes |
| `/api/v1/auth/mfa/disable` | DELETE | Disable MFA | ✅ Yes |

### User Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/v1/users/me` | GET | Get current user | ✅ Yes |
| `/api/v1/users/me` | PATCH | Update profile | ✅ Yes |
| `/api/v1/users/me/permissions` | GET | Get user permissions | ✅ Yes |
| `/api/v1/tenants/:tenant_id/users` | GET | List tenant users | ✅ Yes (admin) |
| `/api/v1/tenants/:tenant_id/users` | POST | Invite user | ✅ Yes (admin) |

### API Key Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/v1/users/me/api-keys` | GET | List user API keys | ✅ Yes |
| `/api/v1/users/me/api-keys` | POST | Create API key | ✅ Yes |
| `/api/v1/users/me/api-keys/:key_id` | DELETE | Revoke API key | ✅ Yes |

### OAuth Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/v1/oauth/authorize` | GET | OIDC authorization endpoint | ❌ No |
| `/api/v1/oauth/token` | POST | Token endpoint | ❌ No (client credentials) |
| `/api/v1/oauth/clients` | GET | List OAuth clients | ✅ Yes (admin) |
| `/api/v1/oauth/clients` | POST | Register OAuth client | ✅ Yes (admin) |

---

## Security Architecture

### JWT Token Structure

**Access Token (Header.Payload.Signature)**:
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "2024-01-key"
}
.
{
  "sub": "user-uuid",
  "aud": "urn:bengobox:services",
  "iss": "https://sso.codevertexitsolutions.com",
  "exp": 1704067200,
  "iat": 1704063600,
  "tenant_id": "tenant-uuid",
  "email": "user@example.com",
  "permissions": [
    "users:read",
    "users:write",
    "api_keys:create"
  ]
}
.
[SIGNATURE]
```

### Security Headers

All responses include:
```
X-Content-Type-Options: nosniff          # Prevent MIME sniffing
X-Frame-Options: DENY                    # Prevent clickjacking
X-XSS-Protection: 1; mode=block          # Legacy XSS protection
Strict-Transport-Security: max-age=...   # Force HTTPS
Content-Security-Policy: ...             # Restrict resource loading
```

### CORS Configuration

```
Allowed Origins: https://sso.codevertexitsolutions.com, 
                 https://*.codevertexitsolutions.com
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Exposed Headers: X-Total-Count, X-Pagination-Token
Credentials: true (allow cookies)
Max Age: 3600 seconds
```

---

## Integration Guide for Backend Services

### Using shared-auth-client (Go)

For Go services integrating BengoBox auth:

**Installation**:
```go
require github.com/Bengo-Hub/shared-auth-client v0.1.0
```

**Chi Router Integration**:
```go
package main

import (
  "github.com/go-chi/chi/v5"
  authclient "github.com/Bengo-Hub/shared-auth-client"
)

func main() {
  // Initialize JWT validator with Auth API JWKS endpoint
  config := authclient.DefaultConfig(
    "https://sso.codevertexitsolutions.com/api/v1/.well-known/jwks.json",
    "https://sso.codevertexitsolutions.com",
  )
  validator := authclient.NewValidator(config)

  // Create router with auth middleware
  router := chi.NewRouter()
  router.Use(authclient.ChiMiddleware(validator))

  // Protected routes automatically validated
  router.Get("/api/v1/protected", func(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    claims := authclient.GetClaims(ctx)
    // claims.Subject = user UUID
    // claims.Permissions = granted permissions
  })
}
```

### Using Shared Auth Client (Documentation)

- **Repository**: https://github.com/Bengo-Hub/shared-auth-client
- **README**: Complete setup and usage examples
- **Integration Patterns**: Chi, Gin router support
- **Token Validation**: JWKS-based offline validation
- **Middleware Support**: Automatic claims injection into context

---

## Performance & Scalability

### Caching Strategy

```
Frontend (Client-side):
├─ Zustand Store
│  ├─ User state (email, permissions)
│  └─ Auth tokens (memory-only)
├─ TanStack Query
│  ├─ User data (15 min stale time)
│  ├─ Service directory (1 hour)
│  └─ API keys (30 min)
└─ Browser Cache
   └─ Static assets (long-term via versioning)

Backend (Server-side):
├─ Redis
│  ├─ JWKS cache (1 day)
│  ├─ Session tokens (TTL = token expiry)
│  └─ Rate limit counters
└─ Database Query Cache
   ├─ User by ID (frequently accessed)
   └─ Permissions by role (update infrequently)
```

### Load Balancing

```
Frontend (Auth UI):
├─ CDN (Vercel)
│  ├─ Static assets (JS, CSS, images)
│  └─ ISR (Incremental Static Regeneration)
├─ Horizontal scaling via replicas
└─ Auto-scaling based on CPU/memory

Backend (Auth API):
├─ Kubernetes deployment (multiple replicas)
├─ Service mesh (Istio) for traffic management
├─ Circuit breaker for database connections
└─ Rate limiting per user/IP
```

---

## Monitoring & Observability

### Key Metrics

**Frontend**:
- Page load time (Core Web Vitals)
- Time to interactive (TTI)
- Auth success/failure rates
- Token refresh frequency
- API response times

**Backend**:
- Request latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Token validation overhead
- Database query performance
- Cache hit ratio

### Logging

**Sensitive Data Exclusion**:
- ✅ User ID, email
- ✅ Endpoint accessed, method
- ✅ HTTP status, response time
- ❌ Passwords, tokens, private keys
- ❌ API key secrets
- ❌ Backup codes

### Alerting

```
Critical:
├─ Auth API downtime (availability < 99%)
├─ Database connection pool exhaustion
├─ Unauthorized access attempts (> threshold)
└─ Token validation failures

Warning:
├─ Slow API responses (> 2s p95)
├─ High error rate (> 5%)
├─ Cache miss rate increase
└─ Certificate expiration (< 30 days)
```

---

## Deployment Strategy

### Environments

**Development** (`localhost:3000`):
- Local auth-api server
- SQLite or local PostgreSQL
- Hot module reloading

**Staging** (`staging.codevertexitsolutions.com`):
- Kubernetes cluster
- Real PostgreSQL & Redis
- UAT integration testing
- Performance benchmarking

**Production** (`accounts.codevertexitsolutions.com`):
- Multi-region Kubernetes deployment
- Managed PostgreSQL (RDS/Cloud SQL)
- Redis cluster (HA)
- CDN for static assets
- WAF & DDoS protection

### Deployment Process

```bash
# 1. Build Docker image
docker build -t ghcr.io/bengo-hub/auth-ui:v1.2.3 .

# 2. Push to registry
docker push ghcr.io/bengo-hub/auth-ui:v1.2.3

# 3. Update Helm values
# File: devops-k8s/values/auth-ui-values.yaml
image: ghcr.io/bengo-hub/auth-ui:v1.2.3

# 4. ArgoCD auto-syncs deployment
# Kubernetes pulls latest image, scales pods
```

---

## Current Status & Known Issues

### Completed Features ✅
- Login & signup with email/password
- OIDC authorization code flow
- JWT token generation & validation
- Token refresh mechanism
- MFA setup & verification (TOTP)
- User profile management
- Password reset flow
- Role-based access control (RBAC)
- API key management interface
- OAuth client registration
- User invitation system
- Service directory
- Tenant management
- Permission policies
- Admin dashboard

### In Progress 🔄
- SEO optimization (meta tags, structured data)
- Performance profiling & optimization
- Security audit (OWASP Top 10)
- Load testing & scalability validation

### Planned Features (Future)
- SAML support (enterprise SSO)
- Passwordless authentication (Magic links)
- Social login (Google, GitHub)
- Biometric auth (WebAuthn)
- Advanced audit logging
- User activity timeline
- Compliance reporting (SOC2, GDPR)

---

## References & Documentation

- **Auth API Backend**: [Auth Service Docs](../../auth-api/)
- **Shared Auth Client**: [shared/auth-client](https://github.com/Bengo-Hub/shared-auth-client)
- **BengoBox Architecture**: [Microservice Architecture](../../../docs/microservice-architecture.md)
- **RBAC Implementation**: [RBAC Guide](../../../docs/RBAC_IMPLEMENTATION_GUIDE.md)
- **Data Ownership**: [Cross-Service Data Ownership](../../../docs/CROSS-SERVICE-DATA-OWNERSHIP.md)

---

**Maintained by**: BengoBox Core Team  
**Last Updated**: January 2026  
**Next Review**: March 2026
