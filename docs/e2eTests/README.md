# Auth-UI E2E Tests

Playwright E2E tests for SSO (accounts.codevertexitsolutions.com). Target: production base URL by default.

Tests are written to **fail when behaviour is wrong**. When a test fails: audit the codebase for the failing workflow, fix the issue (in app or test as appropriate), then re-run. Do not relax assertions to force passes. After fixes are deployed, run the suite again to confirm.

## Artifacts (after run)

| Artifact | Location | Description |
|----------|----------|-------------|
| HTML report | `auth-service/auth-ui/playwright-report/` | Open `index.html` to see results, traces, screenshots. |
| Test results | `auth-service/auth-ui/test-results/` | Per-run screenshots, videos, trace ZIPs (on failure or first retry). |
| Trace viewer | `npx playwright show-trace test-results/<run-dir>/trace.zip` | Network, console, DOM snapshots for a test. |

## Run

```bash
cd auth-service/auth-ui
pnpm install
npx playwright install
pnpm test:e2e
```

View report: `npx playwright show-report playwright-report`

## Manual run results (March 2026)

- **Login page:** Loads at `/login`; form has Email, Password, Sign In; social buttons (Google, GitHub, Microsoft). Heading: "Welcome back" / "Sign in to your enterprise account."
- **Demo login:** `demo@bengobox.dev` / `DemoUser2024!` → redirects to `/` (home). After redirect, navbar must show **Dashboard** (authenticated) not "Log In" / "Start Free". This requires: (1) auth-api sets session cookie with `Domain=.codevertexitsolutions.com` so auth-ui (accounts) can send it when calling sso for `/me`; (2) useAuth runs `/me` on every client page (including `/`) to hydrate from session.
- **Dashboard:** Direct navigation to `/dashboard` when unauthenticated redirects to `/login?return_to=/dashboard`.

See [sso-login-flow-e2e.md](./sso-login-flow-e2e.md) and [sso-rbac-and-permissions-e2e.md](./sso-rbac-and-permissions-e2e.md) for scenarios and status.
