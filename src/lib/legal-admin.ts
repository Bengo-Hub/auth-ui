import apiClient from '@/lib/api-client';
import type { LegalDocumentVersion } from '@/lib/legal-documents';

/**
 * Platform admin calls for draft legal documents (owner 2026-11-14). A draft is private to the
 * platform admin: the public pages never see it. The admin previews it on
 * /legal/<type>/preview/<version> and publishes it there with its effective date, under auth-api's
 * minimum notice (LEGAL_MIN_NOTICE_DAYS). These run in the browser with the signed-in session.
 */

export interface LegalNotice {
  /** Minimum notice in days auth-api enforces for this type. */
  min_notice_days: number;
  /** The earliest instant an effective date may fall on without skip_notice (RFC 3339). */
  earliest: string;
}

export interface AdminLegalVersion extends LegalDocumentVersion {
  status: 'draft' | 'published';
  notice?: LegalNotice;
}

export type AdminVersionState =
  | { kind: 'found'; doc: AdminLegalVersion }
  | { kind: 'not_found' }
  | { kind: 'unavailable' };

function statusOf(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

/** One version with its body, draft or published. 401, 403 and 404 all read as not_found. */
export async function getAdminLegalVersion(docType: string, version: string): Promise<AdminVersionState> {
  try {
    const res = await apiClient.get<AdminLegalVersion>(
      `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/versions/${encodeURIComponent(version)}`,
    );
    return { kind: 'found', doc: res.data };
  } catch (err) {
    const status = statusOf(err);
    if (status === 401 || status === 403 || status === 404 || status === 400) return { kind: 'not_found' };
    return { kind: 'unavailable' };
  }
}

export async function publishLegalDraft(
  docType: string,
  version: string,
  effectiveDate: string,
  skipNotice: boolean,
  extra?: { summary?: string; material?: boolean },
): Promise<AdminLegalVersion> {
  const res = await apiClient.post<AdminLegalVersion>(
    `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/drafts/${encodeURIComponent(version)}/publish`,
    { effective_date: effectiveDate, skip_notice: skipNotice, ...extra },
  );
  return res.data;
}

// ─── Dashboard legal page (owner 2026-11-15, modelled on Hadia's legal console) ─────────────

export type LegalDocKind = 'user_consent' | 'notice' | 'product_terms' | 'agreement';
export type LegalVersionStateName = 'draft' | 'current' | 'upcoming' | 'scheduled' | 'superseded';

export interface AdminLegalVersionRow extends AdminLegalVersion {
  state?: LegalVersionStateName;
  updated_by?: string;
  published_by?: string;
  published_at?: string;
  is_current?: boolean;
}

export interface LegalOverviewEntry {
  doc_type: string;
  kind: LegalDocKind;
  effective_dated: boolean;
  current: AdminLegalVersionRow | null;
  upcoming: AdminLegalVersionRow | null;
  draft: AdminLegalVersionRow | null;
  versions: AdminLegalVersionRow[];
  notice?: LegalNotice;
}

export async function getLegalOverview(): Promise<LegalOverviewEntry[]> {
  const res = await apiClient.get<{ documents: LegalOverviewEntry[] }>('/api/v1/admin/legal/overview');
  return res.data.documents ?? [];
}

export async function getAdminLegalBody(docType: string, version: string): Promise<AdminLegalVersion> {
  const res = await apiClient.get<AdminLegalVersion>(
    `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/versions/${encodeURIComponent(version)}`,
  );
  return res.data;
}

export interface SaveDraftInput {
  html_content: string;
  title?: string;
  summary?: string;
  material?: boolean;
  effective_date?: string;
}

export async function saveLegalDraft(docType: string, version: string, input: SaveDraftInput): Promise<AdminLegalVersion> {
  const res = await apiClient.put<AdminLegalVersion>(
    `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/drafts/${encodeURIComponent(version)}`,
    input,
  );
  return res.data;
}

export async function discardLegalDraft(docType: string, version: string): Promise<void> {
  await apiClient.delete(
    `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/drafts/${encodeURIComponent(version)}`,
  );
}

/** A readable message for a failed save or discard. */
export function draftErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { code?: string; error?: string; details?: Record<string, unknown> } } })
    ?.response?.data;
  switch (data?.code) {
    case 'draft_exists':
      return `Version ${String(data.details?.draft_version ?? '')} is already a draft. Edit or discard it first.`;
    case 'version_published':
      return 'This version is already published. Use a new version number for the change.';
    case 'invalid_version':
      return 'The version is 1 to 32 letters, digits, dots, dashes or underscores.';
    case 'content_too_large':
      return 'The document is larger than 1 MB.';
    case 'invalid_metadata':
      return 'The title is up to 200 characters and the summary up to 2,000.';
    default:
      return data?.error || 'Saving failed. Please try again.';
  }
}

/** The next version number: one more than the highest whole number used, else "1". */
export function nextLegalVersion(versions: { version: string }[]): string {
  let max = 0;
  for (const v of versions) {
    const n = Number.parseInt(v.version.replace(/^v/i, ''), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return String(max + 1);
}

/** Display names of every document type. */
export const LEGAL_DOC_LABELS: Record<string, string> = {
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  COOKIE_POLICY: 'Cookie Policy',
  REFUND_POLICY: 'Refund Policy',
  DATA_REQUESTS: 'Data Requests',
  MARKETFLOW_AUTOPUBLISH_TERMS: 'MarketFlow Autopilot Terms',
  MSA: 'Master Services Agreement',
  DPA: 'Data Processing Agreement',
  EPA: 'Equity Participation Agreement',
  RESELLER_AGREEMENT: 'Reseller Agreement',
};

/** Where the public page of a type lives, when it has one. */
export const LEGAL_PUBLIC_PATHS: Record<string, string> = {
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy',
  COOKIE_POLICY: '/cookies',
  REFUND_POLICY: '/refund-policy',
  DATA_REQUESTS: '/data-requests',
  MARKETFLOW_AUTOPUBLISH_TERMS: '/legal/marketflow-autopublish-terms',
};

/** The URL form of a type, as auth-api accepts it in a path. */
export function legalTypeSlug(docType: string): string {
  return docType.toLowerCase().replace(/_/g, '-');
}

/**
 * The first calendar date (YYYY-MM-DD, UTC as auth-api reads it) that meets the notice: auth-api
 * takes a date as midnight UTC, so an earliest instant later in a day moves to the next day.
 */
export function earliestEffectiveDate(earliestIso: string): string {
  const d = new Date(earliestIso);
  if (Number.isNaN(d.getTime())) return '';
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const day = d.getTime() > midnight ? midnight + 24 * 60 * 60 * 1000 : midnight;
  return new Date(day).toISOString().slice(0, 10);
}

/** A readable message for a failed publish, from auth-api's { code, error, details }. */
export function publishErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { code?: string; error?: string; details?: Record<string, unknown> } } })
    ?.response?.data;
  switch (data?.code) {
    case 'notice_too_short': {
      const days = data.details?.min_notice_days;
      const earliest = typeof data.details?.earliest === 'string' ? earliestEffectiveDate(data.details.earliest) : '';
      return `The effective date must be at least ${days ?? 'the minimum'} days away${earliest ? ` (${earliest} or later)` : ''}, unless you skip the notice.`;
    }
    case 'already_published':
      return 'This version is already published.';
    case 'invalid_date':
      return 'Choose an effective date.';
    case 'forbidden':
    case 'unauthorized':
      return 'Only a platform admin can publish.';
    default:
      return data?.error || 'Publishing failed. Please try again.';
  }
}
