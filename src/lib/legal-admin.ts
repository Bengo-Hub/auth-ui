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
): Promise<AdminLegalVersion> {
  const res = await apiClient.post<AdminLegalVersion>(
    `/api/v1/admin/legal/documents/${encodeURIComponent(docType)}/drafts/${encodeURIComponent(version)}/publish`,
    { effective_date: effectiveDate, skip_notice: skipNotice },
  );
  return res.data;
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
