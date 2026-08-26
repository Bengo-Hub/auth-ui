import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIPTIONS_API = process.env.SUBSCRIPTIONS_API_URL || 'https://pricingapi.codevertexafrica.com';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || '';

/**
 * GET /api/tokens/balance?tenant_id=<uuid>&service_tag=<tag>
 * Proxies to subscriptions-api GET /api/v1/tenants/{id}/tokens/balance using the internal
 * service key, same pattern as /api/subscriptions. Backs the Apps & Keys console's per-App
 * token wallet balance display for Apps scoped to a metered external API (e.g. etims:*).
 */
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id');
  const serviceTag = req.nextUrl.searchParams.get('service_tag') || 'etims_api';
  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id required' }, { status: 400 });
  }

  if (!SERVICE_KEY) {
    return NextResponse.json({ error: 'service key not configured' }, { status: 503 });
  }

  const upstream = `${SUBSCRIPTIONS_API}/api/v1/tenants/${tenantId}/tokens/balance?service_tag=${encodeURIComponent(serviceTag)}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-API-Key': SERVICE_KEY };

  try {
    const res = await fetch(upstream, { headers, cache: 'no-store' });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'upstream request failed' }, { status: 502 });
  }
}
