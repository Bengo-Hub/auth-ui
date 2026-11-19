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

/**
 * Platform policies managed from the dashboard (owner 2026-11-15). Each public page shows the
 * version published in auth-api and falls back to the text built into the page until a first
 * version is published there.
 */
export interface LegalPolicy {
  /** auth-api type in URL form. */
  slug: string;
  /** auth-api type as stored. */
  docType: string;
  /** Public page. */
  path: string;
  title: string;
}

export const LEGAL_POLICIES: LegalPolicy[] = [
  { slug: 'terms-of-service', docType: 'TERMS_OF_SERVICE', path: '/terms-of-service', title: 'Terms of Service' },
  { slug: 'privacy-policy', docType: 'PRIVACY_POLICY', path: '/privacy', title: 'Privacy Policy' },
  { slug: 'cookie-policy', docType: 'COOKIE_POLICY', path: '/cookies', title: 'Cookie Policy' },
  { slug: 'refund-policy', docType: 'REFUND_POLICY', path: '/refund-policy', title: 'Refund Policy' },
  { slug: 'data-requests', docType: 'DATA_REQUESTS', path: '/data-requests', title: 'Data Requests' },
];

export function legalPolicy(slug: string): LegalPolicy {
  const p = LEGAL_POLICIES.find((x) => x.slug === slug);
  if (!p) throw new Error(`unknown legal policy ${slug}`);
  return p;
}

export interface LegalDocumentVersion {
  id: string;
  doc_type: string;
  version: string;
  effective_date: string;
  effective_at: string;
  in_force?: boolean;
  html_content?: string;
  title?: string;
  summary?: string;
  material?: boolean;
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

const HEADING_RE = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi;
const ID_ATTR_RE = /\sid\s*=\s*("([^"]*)"|'([^']*)')/i;
const SAFE_ID_RE = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Plain text of a heading's inner HTML: tags dropped, common entities decoded, spaces collapsed. */
function headingText(inner: string): string {
  return inner
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_, e: string) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The Contents list of a published document, from the ids and text of its <h2> headings. A
 * document with fewer than three <h2> (the MarketFlow Autopilot terms are two parts of numbered
 * clauses) also lists its <h3> headings, in page order. Headings without a usable id are left
 * out. Pass HTML that went through cleanLegalHtml.
 */
export function legalContents(html: string): { id: string; title: string }[] {
  const all: { level: string; id: string; title: string }[] = [];
  for (const m of html.matchAll(HEADING_RE)) {
    const idMatch = ID_ATTR_RE.exec(m[2]);
    const id = idMatch ? (idMatch[2] ?? idMatch[3] ?? '') : '';
    const title = headingText(m[3]);
    if (SAFE_ID_RE.test(id) && title) all.push({ level: m[1], id, title: title.slice(0, 120) });
  }
  const h2 = all.filter((h) => h.level === '2');
  const shown = h2.length >= 3 ? h2 : all;
  return shown.map(({ id, title }) => ({ id, title }));
}

export function formatLegalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' });
}
