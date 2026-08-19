import { NextResponse } from "next/server";

const MAIL_UI_INTERNAL_URL = process.env.MAIL_UI_INTERNAL_URL || "http://mail-ui.email.svc.cluster.local";
const SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "";

/**
 * GET /api/mail-stats
 * Proxies to mail-ui's internal /api/internal/stats using the shared
 * platform service key, matching this app's existing /api/subscriptions
 * proxy pattern. Backs the dashboard's "Email Hosting" analytics tab.
 */
export async function GET() {
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
