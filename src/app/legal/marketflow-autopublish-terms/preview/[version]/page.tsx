'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { useAuth } from '@/hooks/useAuth';
import {
  earliestEffectiveDate,
  getAdminLegalVersion,
  publishErrorMessage,
  publishLegalDraft,
  type AdminLegalVersion,
  type AdminVersionState,
} from '@/lib/legal-admin';
import { MARKETFLOW_AUTOPUBLISH_TERMS, formatLegalDate } from '@/lib/legal-documents';

const BASE = '/legal/marketflow-autopublish-terms';
const TITLE = 'MarketFlow Autopilot Terms';
const VERSION_RE = /^[A-Za-z0-9._-]{1,32}$/;

function decodeVersion(raw: string | string[] | undefined): string {
  if (typeof raw !== 'string') return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return '';
  }
}

/**
 * Draft preview for the platform admin (owner 2026-11-14): the draft rendered as tenants would
 * see it, under a "Draft, not published" banner, with the Publish form. Anyone else, and any
 * version that does not exist, gets the 404 page; auth-api refuses the admin reads as well.
 */
export default function LegalDraftPreviewPage() {
  const params = useParams<{ version: string }>();
  const version = decodeVersion(params?.version);
  const { isPlatformOwner, isLoading: authLoading, isAuthenticated } = useAuth();
  const [state, setState] = useState<AdminVersionState | null>(null);

  const allowed = VERSION_RE.test(version) && isAuthenticated && isPlatformOwner;

  useEffect(() => {
    if (authLoading || !allowed) return;
    let cancelled = false;
    getAdminLegalVersion(MARKETFLOW_AUTOPUBLISH_TERMS, version).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, allowed, version]);

  if (authLoading || (allowed && state === null)) {
    return (
      <main className="min-h-screen bg-white py-24 dark:bg-[#0a0a0a]">
        <p className="text-center text-sm text-slate-500" aria-live="polite">Loading the draft...</p>
      </main>
    );
  }
  if (!allowed || state?.kind === 'not_found') notFound();

  if (!state || state.kind === 'unavailable') {
    return (
      <LegalDocumentView
        title={TITLE}
        badge="Draft preview"
        basePath={BASE}
        doc={null}
        versions={[]}
        empty={<p>The draft could not be loaded just now. Please try again in a few minutes.</p>}
      />
    );
  }

  return <DraftView doc={state.doc} onPublished={(doc) => setState({ kind: 'found', doc })} />;
}

function DraftView({ doc, onPublished }: { doc: AdminLegalVersion; onPublished: (doc: AdminLegalVersion) => void }) {
  const isDraft = doc.status === 'draft';
  const publicHref = `${BASE}/${encodeURIComponent(doc.version)}`;

  const notice = isDraft ? (
    <div className="flex gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden />
      <div>
        <p className="font-bold text-slate-900 dark:text-white">Draft, not published</p>
        <p>
          Only platform admins can see this page. Tenants cannot read or accept this version until it is
          published. Anything marked [OWNER TO CONFIRM] is highlighted in the text.
        </p>
      </div>
    </div>
  ) : (
    <div className="flex gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
      <p>
        Version {doc.version} is published and {doc.in_force ? 'in effect since' : 'applies from'}{' '}
        <strong>{formatLegalDate(doc.effective_at)}</strong>.{' '}
        <Link href={publicHref} className="text-primary underline">Open the public page</Link>.
      </p>
    </div>
  );

  const meta = isDraft ? (
    <p>
      Draft of version <strong>{doc.version}</strong>. Proposed date {formatLegalDate(doc.effective_at)}; the
      effective date is set when you publish.
    </p>
  ) : undefined;

  return (
    <LegalDocumentView
      title={TITLE}
      badge={isDraft ? 'Draft preview' : 'MarketFlow'}
      basePath={BASE}
      doc={doc}
      meta={meta}
      notice={notice}
      versions={[]}
      footer={isDraft ? <PublishForm doc={doc} onPublished={onPublished} /> : null}
    />
  );
}

function PublishForm({ doc, onPublished }: { doc: AdminLegalVersion; onPublished: (doc: AdminLegalVersion) => void }) {
  const minDays = doc.notice?.min_notice_days ?? 0;
  const earliest = doc.notice ? earliestEffectiveDate(doc.notice.earliest) : '';
  const [date, setDate] = useState(earliest);
  const [skipNotice, setSkipNotice] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const tooSoon = !skipNotice && !!earliest && !!date && date < earliest;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!date) {
      setError('Choose an effective date.');
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      const published = await publishLegalDraft(MARKETFLOW_AUTOPUBLISH_TERMS, doc.version, date, skipNotice);
      onPublished({ ...doc, ...published, html_content: doc.html_content, notice: undefined });
    } catch (err) {
      setError(publishErrorMessage(err));
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="publish-heading"
      className="mt-12 rounded-2xl border border-amber-300/60 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <h2 id="publish-heading" className="text-lg font-bold text-slate-900 dark:text-white">
        Publish version {doc.version}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {minDays > 0 ? (
          <>
            Tenants get at least <strong>{minDays} days&apos; notice</strong> of a new version, so the earliest effective
            date is <strong>{earliest}</strong>. Skipping the notice is for an urgent legal change only.
          </>
        ) : (
          <>No minimum notice is configured for this document.</>
        )}{' '}
        Once published the version is public, tenants can accept it, and from its effective date it cannot be changed.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="effective-date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Effective date (UTC midnight)
          </label>
          <input
            id="effective-date"
            type="date"
            required
            value={date}
            min={skipNotice ? undefined : earliest || undefined}
            onChange={(e) => {
              setDate(e.target.value);
              setConfirming(false);
            }}
            className="h-11 w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-[#111]"
          />
          {tooSoon && (
            <p className="mt-1 text-sm text-red-600">This is sooner than the {minDays} days&apos; notice.</p>
          )}
        </div>

        {minDays > 0 && (
          <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={skipNotice}
              onChange={(e) => {
                setSkipNotice(e.target.checked);
                setConfirming(false);
              }}
              className="mt-0.5 h-4 w-4"
            />
            <span>Skip the notice (urgent legal change)</span>
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {confirming && (
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Publish version {doc.version} with effect from {formatLegalDate(`${date}T00:00:00Z`)}? This cannot be undone.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy || !date || tooSoon}>
            {busy ? 'Publishing...' : confirming ? 'Yes, publish' : 'Publish'}
          </Button>
          {confirming && (
            <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
