/**
 * Equity portal API functions.
 * Uses native fetch with Bearer token from the equity portal context
 * (equity holders authenticate via one-time token links, not session cookies).
 * These calls go to the treasury-api, not the SSO auth-api.
 */

const TREASURY_API =
  process.env.NEXT_PUBLIC_TREASURY_API_URL || 'https://booksapi.codevertexitsolutions.com';

export interface EquityPayout {
  id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  tax_amount: number;
  payout_amount: number;
  net_payout: number;
  status: string;
  provider_reference?: string;
  created_at: string;
}

export interface EquityPayoutsResponse {
  payouts: EquityPayout[];
}

export async function fetchEquityPayouts(
  holderID: string,
  token: string,
): Promise<EquityPayoutsResponse> {
  const res = await fetch(
    `${TREASURY_API}/api/v1/platform/equity-holders/${holderID}/payouts`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Failed to fetch equity payouts: ${res.status}`);
  return res.json();
}
