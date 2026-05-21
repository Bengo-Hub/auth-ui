import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIPTIONS_API = process.env.SUBSCRIPTIONS_API_URL || 'https://pricingapi.codevertexitsolutions.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || '';

/**
 * GET /api/subscriptions?tenant_id=<uuid>
 * Proxies to subscriptions-api GET /api/v1/tenants/{id}/subscriptions using the
 * internal service key. Returns per-service-tag subscription status for the billing tab.
 */
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id required' }, { status: 400 });
  }

  const upstream = `${SUBSCRIPTIONS_API}/api/v1/tenants/${tenantId}/subscriptions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SERVICE_KEY) headers['X-API-Key'] = SERVICE_KEY;

  try {
    const res = await fetch(upstream, { headers, cache: 'no-store' });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'upstream request failed' }, { status: 502 });
  }
}
