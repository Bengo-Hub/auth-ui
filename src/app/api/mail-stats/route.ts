import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sso.codevertexafrica.com";
const MAIL_UI_INTERNAL_URL = process.env.MAIL_UI_INTERNAL_URL || "http://mail-ui.email.svc.cluster.local";
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "";

/**
 * GET /api/mail-stats
 * Proxies to mail-ui's internal /api/internal/stats using the shared
 * platform service key, matching this app's existing /api/subscriptions
 * proxy pattern. Backs the dashboard's "Email Hosting" analytics tab.
 *
 * REAL GAP, caught before shipping: this app's API routes have no
 * server-side session-decoding of their own (auth-ui relies entirely on
 * auth-api's cookie via withCredentials — there's no middleware.ts and no
 * shared getServerSession()-style helper anywhere in this repo, confirmed by
 * search). Forwarding the caller's own cookies to auth-api's existing
 * /api/v1/auth/me (the same endpoint useAuth() already calls client-side)
 * and requiring a 200 is the same real credential check the rest of this
 * app relies on — without it, platform-wide mailbox/storage counts would be
 * readable by anyone who knows this URL, unauthenticated.
 */
export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);
  if (!meRes || !meRes.ok) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!SERVICE_KEY) {
    // Fail loud instead of forwarding an unauthenticated S2S call that
    // mail-ui will reject anyway — same guard as /api/subscriptions.
    return NextResponse.json({ error: "service key not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${MAIL_UI_INTERNAL_URL}/api/internal/stats`, {
      headers: { "X-API-Key": SERVICE_KEY },
      cache: "no-store",
    });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "upstream request failed" }, { status: 502 });
  }
}
