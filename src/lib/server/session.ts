// Server-side only: imported by route handlers under src/app/api.
import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexafrica.com';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SessionUser {
  id: string;
  is_platform_owner?: boolean;
  tenant?: { id?: string };
  tenants?: Array<{ id?: string }>;
}

/**
 * The signed-in user behind this request, checked with auth-api (/auth/me) using the caller's own
 * cookie or bearer token, or null. Every route that adds the platform service key to a call must
 * check this first, because the key itself opens every tenant.
 */
export async function sessionUser(req: NextRequest): Promise<SessionUser | null> {
  const headers: Record<string, string> = {};
  const cookie = req.headers.get('cookie');
  const authorization = req.headers.get('authorization');
  if (cookie) headers.cookie = cookie;
  if (authorization) headers.authorization = authorization;
  if (!cookie && !authorization) return null;
  const res = await fetch(`${AUTH_API}/api/v1/auth/me`, { headers, cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as SessionUser | { user?: SessionUser } | null;
  if (!body) return null;
  const user = 'user' in body && body.user ? body.user : (body as SessionUser);
  return user?.id ? user : null;
}

/** Whether the user may read data of tenantId: a member of it, or a platform owner. */
export function canAccessTenant(user: SessionUser, tenantId: string): boolean {
  if (user.is_platform_owner) return true;
  if (user.tenant?.id === tenantId) return true;
  return !!user.tenants?.some((t) => t.id === tenantId);
}

/**
 * Resolves the tenant_id query parameter for a proxy route: it must be a UUID and belong to the
 * signed-in caller. Returns the tenant id, or the error response to send.
 */
export async function authorizedTenant(req: NextRequest): Promise<{ tenantId: string } | { error: NextResponse }> {
  const tenantId = req.nextUrl.searchParams.get('tenant_id') ?? '';
  if (!UUID_RE.test(tenantId)) {
    return { error: NextResponse.json({ error: 'a valid tenant_id is required' }, { status: 400 }) };
  }
  const user = await sessionUser(req);
  if (!user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  if (!canAccessTenant(user, tenantId)) {
    return { error: NextResponse.json({ error: 'Not allowed for this organisation' }, { status: 403 }) };
  }
  return { tenantId };
}
