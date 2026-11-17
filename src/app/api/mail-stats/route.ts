import { NextRequest, NextResponse } from 'next/server';
import { sessionUser } from '@/lib/server/session';

const MAIL_UI_INTERNAL_URL = process.env.MAIL_UI_INTERNAL_URL || 'http://mail-ui.email.svc.cluster.local';
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || '';

/**
 * GET /api/mail-stats
 * Platform-wide email hosting figures for the dashboard's Email Hosting tab, from mail-ui's
 * internal stats. Platform owners only: the numbers cover every tenant.
 */
export async function GET(req: NextRequest) {
  const user = await sessionUser(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!user.is_platform_owner) return NextResponse.json({ error: 'Platform owners only' }, { status: 403 });
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: 'service key not configured' }, { status: 503 });
  }
  try {
    const res = await fetch(`${MAIL_UI_INTERNAL_URL}/api/internal/stats`, {
      headers: { 'X-API-Key': SERVICE_KEY },
      cache: 'no-store',
    });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'upstream request failed' }, { status: 502 });
  }
}
