/**
 * Equity portal API functions.
 * Uses native fetch with Bearer token from the equity portal context
 * (equity holders authenticate via one-time token links, not session cookies).
 * These calls go to the treasury-api, not the SSO auth-api.
 */

const TREASURY_API =
  process.env.NEXT_PUBLIC_TREASURY_API_URL || 'https://booksapi.codevertexafrica.com';

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
  // /platform/equity-holders/{id}/payouts requires RequirePlatformOwner server-side — a
  // portal token (an external holder, never a platform admin) can NEVER satisfy that gate,
  // so this always 403'd for a real equity holder. /equity-portal/payouts is the fix: it
  // derives the holder id from the token itself (scope=equity_portal), not a URL param.
  // holderID is kept as a param only because callers use it as a react-query cache key.
  const res = await fetch(`${TREASURY_API}/api/v1/equity-portal/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch equity payouts: ${res.status}`);
  return res.json();
}

/**
 * The holder's real legal/KYC documents — treasury-api generates personalized branded PDFs
 * (EPA, dividend certificates, terms) from the holder's actual entitlement/tax data, and
 * tracks uploaded KYC files (ID, KRA PIN, ...). This replaces the generic static EPA/MSA/DPA
 * template text that used to live in auth-api's LegalDocument for this portal.
 */
export interface EquityHolderDocument {
  id: string;
  holder_id: string;
  category: 'generated' | 'uploaded';
  document_type: string;
  title: string;
  status: 'draft' | 'final' | 'signed' | 'expired' | 'rejected';
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  has_file: boolean;
  uploaded_at: string;
  signed_at?: string;
  expires_at?: string;
  expired: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocumentType {
  document_type: string;
  title: string;
  finalized: boolean;
  document_id?: string;
  status?: string;
}

export interface EquityDocumentsResponse {
  documents: EquityHolderDocument[];
  generated_types: GeneratedDocumentType[];
}

export async function fetchEquityDocuments(token: string): Promise<EquityDocumentsResponse> {
  const res = await fetch(`${TREASURY_API}/api/v1/equity-portal/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch equity documents: ${res.status}`);
  return res.json();
}

export async function fetchEquityDocumentDownloadURL(
  token: string,
  docId: string,
): Promise<{ url: string; file_name: string }> {
  const res = await fetch(`${TREASURY_API}/api/v1/equity-portal/documents/${docId}/url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to get document download URL: ${res.status}`);
  return res.json();
}

export async function signEquityDocument(
  token: string,
  docId: string,
  file: File,
): Promise<EquityHolderDocument> {
  const form = new FormData();
  form.append('signature_image', file);
  const res = await fetch(`${TREASURY_API}/api/v1/equity-portal/documents/${docId}/sign`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to sign document: ${res.status}`);
  }
  return res.json();
}
