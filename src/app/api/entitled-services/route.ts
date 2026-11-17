import { NextRequest, NextResponse } from 'next/server';
import { authorizedTenant } from '@/lib/server/session';

const SUBSCRIPTIONS_API = process.env.SUBSCRIPTIONS_API_URL || 'https://pricingapi.codevertexafrica.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || '';

/**
 * GET /api/entitled-services?tenant_id=<uuid>
 * The billable services and whether the tenant's plan covers each, for the app switcher. Only a
 * member of the tenant (or a platform owner) may read it, since the call carries the platform
 * service key.
 */
export async function GET(req: NextRequest) {
  const auth = await authorizedTenant(req);
  if ('error' in auth) return auth.error;
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: 'service key not configured' }, { status: 503 });
  }
  const upstream = `${SUBSCRIPTIONS_API}/api/v1/tenants/${encodeURIComponent(auth.tenantId)}/entitled-services`;
  try {
    const res = await fetch(upstream, {
      headers: { 'Content-Type': 'application/json', 'X-API-Key': SERVICE_KEY },
      cache: 'no-store',
    });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'upstream request failed' }, { status: 502 });
  }
}
