/**
 * Versioned legal documents published in auth-api (owner 2026-11-14). The first is the MarketFlow
 * Autopilot auto-publish terms: each version has an effective date, the newest one past its date
 * is in force, and a later one is shown as upcoming during its notice period.
 *
 * Read on the server. AUTH_API_INTERNAL_URL lets the pod reach auth-api inside the cluster; the
 * public API URL is the fallback.
 */

const AUTH_API = (
  process.env.AUTH_API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://sso.codevertexafrica.com'
).replace(/\/$/, '');

/** How long a fetched document is reused before auth-api is asked again (seconds). */
export const LEGAL_REVALIDATE_SECONDS = 300;

export const MARKETFLOW_AUTOPUBLISH_TERMS = 'marketflow-autopublish-terms';

export interface LegalDocumentVersion {
  id: string;
  doc_type: string;
  version: string;
  effective_date: string;
  effective_at: string;
  in_force?: boolean;
  html_content?: string;
}

/** The document in force and the upcoming one. `unavailable` means auth-api did not answer. */
export type LegalDocumentState =
  | { kind: 'published'; current: LegalDocumentVersion | null; upcoming: LegalDocumentVersion | null }
  | { kind: 'not_published' }
  | { kind: 'unavailable' };

export type LegalVersionState =
  | { kind: 'found'; doc: LegalDocumentVersion }
  | { kind: 'not_found' }
  | { kind: 'unavailable' };

async function getJSON(path: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${AUTH_API}/api/v1${path}`, { next: { revalidate: LEGAL_REVALIDATE_SECONDS } });
  const body = res.ok ? await res.json() : null;
  return { status: res.status, body };
}

export async function getLegalDocument(docType: string): Promise<LegalDocumentState> {
  try {
    const { status, body } = await getJSON(`/legal/documents/${encodeURIComponent(docType)}`);
    if (status === 404) return { kind: 'not_published' };
    if (status !== 200 || !body) return { kind: 'unavailable' };
    const b = body as { current?: LegalDocumentVersion | null; upcoming?: LegalDocumentVersion | null };
    return { kind: 'published', current: b.current ?? null, upcoming: b.upcoming ?? null };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function getLegalDocumentVersion(docType: string, version: string): Promise<LegalVersionState> {
  try {
    const { status, body } = await getJSON(
      `/legal/documents/${encodeURIComponent(docType)}/versions/${encodeURIComponent(version)}`,
    );
    if (status === 404 || status === 400) return { kind: 'not_found' };
    if (status !== 200 || !body) return { kind: 'unavailable' };
    return { kind: 'found', doc: body as LegalDocumentVersion };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function listLegalDocumentVersions(docType: string): Promise<LegalDocumentVersion[]> {
  try {
    const { status, body } = await getJSON(`/legal/documents/${encodeURIComponent(docType)}/versions`);
    if (status !== 200 || !body) return [];
    return ((body as { versions?: LegalDocumentVersion[] }).versions ?? []).slice(0, 50);
  } catch {
    return [];
  }
}

/**
 * The HTML is written by the platform admin only, so it is trusted; this still drops scripts,
 * embedded frames, inline event handlers and javascript: links as a second line of defence.
 */
export function cleanLegalHtml(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|link|meta)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}

export function formatLegalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' });
}
