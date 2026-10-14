/**
 * Where a sign-in or sign-up came from: the tenant, the app (OAuth client) and the flow to
 * return to. Services send people here three ways, and the tenant can sit in any of them:
 *   1. /login?tenant=<slug>&return_to=...           (explicit)
 *   2. /login?return_to=<authorize URL with tenant=<slug> and client_id>
 *   3. /login?return_to=<authorize URL whose redirect_uri is https://app/<slug>/auth/callback>
 * Every auth page reads it through resolveAuthContext so no link between them drops it again
 * (the sign-up link on the login page used to be a bare /signup, which sent every customer to
 * "create an organisation").
 */

export const PLATFORM_TENANT_SLUG = 'codevertex';

/** Query params carried between /login, /signup, /forgot-password and back. */
const FLOW_PARAMS = ['return_to', 'client_id', 'redirect_uri', 'state', 'scope', 'tenant'] as const;

/**
 * Apps whose users are a tenant's customers, not its staff. Mirrors auth-api's
 * OAuthClient metadata.self_signup_role (cmd/seed/seed_users.go); the server decides the
 * role, this only picks the right form and wording.
 */
export const CUSTOMER_APPS: Record<string, { role: string; person: string; people: string; defaultTenant?: string }> = {
  'ordering-ui': { role: 'customer', person: 'customer', people: 'customers' },
  'rider-app': { role: 'driver', person: 'rider', people: 'riders' },
  // Digitika runs under the platform tenant, and the website does not always send it.
  'codevertex-website': { role: 'student', person: 'student', people: 'students', defaultTenant: PLATFORM_TENANT_SLUG },
};

export interface AuthContext {
  /**
   * The tenant this flow BRANDS as, derived from the whole flow (tenant param, the authorize URL in
   * return_to, the redirect_uri path). Branding and the customer sign-up target only: it never
   * changes how anyone signs in.
   */
  tenantSlug: string;
  /**
   * The tenant to sign in to: only the explicit `tenant` URL parameter, exactly as before the
   * redesign. Login, social login, passkeys and the organisation wizard use this. Sign-in itself is
   * central (one set of credentials and providers); auth-api treats tenant_slug as the session's
   * target tenant, and with none it resolves the person's primary tenant.
   */
  loginTenant: string;
  clientId: string;
  returnTo: string | null;
  /** True when the app is customer-facing (ordering, rider, Digitika). */
  isCustomerApp: boolean;
  customerApp: (typeof CUSTOMER_APPS)[string] | null;
}

function parse(raw: string | null): URL | null {
  if (!raw) return null;
  try {
    return new URL(raw, 'https://accounts.invalid');
  } catch {
    return null;
  }
}

// Paths that are app routes, not tenant slugs, in a redirect_uri like /<slug>/auth/callback.
const NON_TENANT_SEGMENTS = new Set(['auth', 'api', 'callback', 'login', 'signup']);

function slugFromRedirectUri(raw: string | null): string {
  const u = parse(raw);
  if (!u) return '';
  const segments = u.pathname.split('/').filter(Boolean);
  // Only the "/<slug>/auth/callback" shape names a tenant; "/auth/callback" does not.
  if (segments.length >= 3 && segments[1] === 'auth' && !NON_TENANT_SEGMENTS.has(segments[0])) {
    return segments[0];
  }
  return '';
}

export function resolveAuthContext(params: URLSearchParams | { get(name: string): string | null }): AuthContext {
  const returnTo = params.get('return_to');
  const inner = parse(returnTo);
  const clientId = params.get('client_id') || inner?.searchParams.get('client_id') || '';
  const tenantSlug =
    params.get('tenant') ||
    inner?.searchParams.get('tenant') ||
    slugFromRedirectUri(params.get('redirect_uri')) ||
    slugFromRedirectUri(inner?.searchParams.get('redirect_uri') ?? null) ||
    CUSTOMER_APPS[clientId]?.defaultTenant ||
    '';
  const customerApp = CUSTOMER_APPS[clientId] ?? null;
  const loginTenant = params.get('tenant') ?? '';
  return { tenantSlug, loginTenant, clientId, returnTo, isCustomerApp: !!customerApp, customerApp };
}

/**
 * Builds a link to another auth page that keeps the flow (return_to, client, tenant). The
 * resolved tenant is written explicitly so the next page never has to dig for it.
 */
export function authFlowHref(path: string, params: URLSearchParams | { get(name: string): string | null }, extra?: Record<string, string>): string {
  const out = new URLSearchParams();
  for (const key of FLOW_PARAMS) {
    const v = params.get(key);
    if (v) out.set(key, v);
  }
  const ctx = resolveAuthContext(params);
  if (ctx.tenantSlug) out.set('tenant', ctx.tenantSlug);
  if (ctx.clientId) out.set('client_id', ctx.clientId);
  for (const [k, v] of Object.entries(extra ?? {})) out.set(k, v);
  const qs = out.toString();
  return qs ? `${path}?${qs}` : path;
}
