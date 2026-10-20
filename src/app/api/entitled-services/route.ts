import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIPTIONS_API = process.env.SUBSCRIPTIONS_API_URL || 'https://pricingapi.codevertexafrica.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || '';

/**
 * GET /api/entitled-services?tenant_id=<uuid>
 * Proxies to subscriptions-api GET /api/v1/tenants/{id}/entitled-services with the internal service
 * key: the billable services and whether the tenant's plan covers each. The app switcher uses it to
 * mark services outside the plan "Not in your plan". Same guard as /api/subscriptions.
 */
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id required' }, { status: 400 });
  }
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: 'service key not configured' }, { status: 503 });
  }

  const upstream = `${SUBSCRIPTIONS_API}/api/v1/tenants/${encodeURIComponent(tenantId)}/entitled-services`;
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
