'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, Eye, PenLine } from 'lucide-react';
import { RichTextEditor } from '@bengo-hub/shared-ui-lib/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import {
  LEGAL_DOC_LABELS,
  LEGAL_PUBLIC_PATHS,
  discardLegalDraft,
  draftErrorMessage,
  earliestEffectiveDate,
  getAdminLegalBody,
  legalTypeSlug,
  nextLegalVersion,
  publishErrorMessage,
  publishLegalDraft,
  saveLegalDraft,
  type LegalOverviewEntry,
} from '@/lib/legal-admin';
import { cleanLegalHtml, formatLegalDate } from '@/lib/legal-documents';

const VERSION_RE = /^[A-Za-z0-9._-]{1,32}$/;
// Elements the visual editor does not keep; a body with any of them opens in HTML mode.
const RICH_UNSAFE_RE = /<(table|thead|tbody|tr|td|th|section|div|span|figure|details|summary)\b|\sclass=/i;

type Mode = 'visual' | 'html' | 'preview';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The main text of the public page as it renders now, for a first version. */
async function readPublicPage(path: string): Promise<string> {
  const res = await fetch(path, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`page answered ${res.status}`);
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const main = doc.querySelector('main') ?? doc.body;
  main.querySelectorAll('script, style, nav, noscript, svg, button, form').forEach((n) => n.remove());
  return main.innerHTML.trim();
}

export function LegalEditor({
  entry,
  onBack,
  onChanged,
}: {
  entry: LegalOverviewEntry;
  onBack: () => void;
  onChanged: () => void;
}) {
  const label = LEGAL_DOC_LABELS[entry.doc_type] ?? entry.doc_type;
  const slug = legalTypeSlug(entry.doc_type);
  const publicPath = LEGAL_PUBLIC_PATHS[entry.doc_type];
  const consent = entry.kind === 'user_consent';
  const draft = entry.draft;

  const [version, setVersion] = useState(draft?.version ?? nextLegalVersion(entry.versions));
  const [title, setTitle] = useState(draft?.title ?? entry.current?.title ?? label);
  const [summary, setSummary] = useState(draft?.summary ?? '');
  const [material, setMaterial] = useState(draft?.material ?? false);
  const [html, setHtml] = useState('');
  // A loaded body picks its own mode; a blank new draft starts in the visual editor.
  const [mode, setMode] = useState<Mode>(draft ? 'html' : 'visual');
  const [loading, setLoading] = useState(!!draft);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // An open draft is loaded with its body once per version, so a refetch of the overview never
  // replaces text that is being edited.
  const draftVersion = draft?.version;
  useEffect(() => {
    if (!draftVersion) return;
    let cancelled = false;
    getAdminLegalBody(slug, draftVersion)
      .then((d) => {
        if (cancelled) return;
        const body = d.html_content ?? '';
        setHtml(body);
        setMode(RICH_UNSAFE_RE.test(body) ? 'html' : 'visual');
      })
      .catch(() => !cancelled && setMessage({ ok: false, text: 'The draft could not be loaded.' }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [draftVersion, slug]);

  async function startFrom(source: 'current' | 'page') {
    setMessage(null);
    setLoading(true);
    try {
      const body =
        source === 'current' && entry.current
          ? ((await getAdminLegalBody(slug, entry.current.version)).html_content ?? '')
          : await readPublicPage(publicPath);
      setHtml(body);
      setMode(RICH_UNSAFE_RE.test(body) ? 'html' : 'visual');
    } catch {
      setMessage({ ok: false, text: 'The text could not be loaded. Paste it in instead.' });
    } finally {
      setLoading(false);
    }
  }

  async function save(e?: FormEvent) {
    e?.preventDefault();
    setMessage(null);
    if (!VERSION_RE.test(version)) {
      setMessage({ ok: false, text: 'The version is 1 to 32 letters, digits, dots, dashes or underscores.' });
      return false;
    }
    if (!html.trim()) {
      setMessage({ ok: false, text: 'The document has no text yet.' });
      return false;
    }
    setBusy(true);
    try {
      await saveLegalDraft(slug, version, { html_content: html, title, summary, material: consent ? material : false });
      setMessage({ ok: true, text: `Draft version ${version} saved.` });
      onChanged();
      return true;
    } catch (err) {
      setMessage({ ok: false, text: draftErrorMessage(err) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!draft) return;
    setBusy(true);
    try {
      await discardLegalDraft(slug, draft.version);
      onChanged();
      onBack();
    } catch (err) {
      setMessage({ ok: false, text: draftErrorMessage(err) });
    } finally {
      setBusy(false);
      setConfirmDiscard(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> All documents
        </Button>
        <h2 className="text-xl font-semibold">{label}</h2>
        {draft ? <Badge variant="soft">Draft {draft.version}</Badge> : <Badge variant="outline">New draft</Badge>}
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="legal-version" className="mb-1 block text-sm font-medium">Version</label>
            <Input
              id="legal-version"
              value={version}
              onChange={(e) => setVersion(e.target.value.trim())}
              disabled={!!draft}
              aria-describedby="legal-version-help"
            />
            <p id="legal-version-help" className="mt-1 text-xs text-muted-foreground">
              {draft ? 'A draft keeps its version number.' : 'Suggested from the versions so far.'}
            </p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="legal-title" className="mb-1 block text-sm font-medium">Title</label>
            <Input id="legal-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="legal-summary" className="mb-1 block text-sm font-medium">What changed</label>
          <Textarea
            id="legal-summary"
            value={summary}
            maxLength={2000}
            rows={2}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A short note for the version history and the notice users see"
          />
        </div>
        {consent && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4"
              checked={material}
              onChange={(e) => setMaterial(e.target.checked)}
            />
            <span>
              <strong>Material change.</strong> Every user who accepted an earlier version is asked to accept this one when
              it comes into force.
            </span>
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Editor mode">
          {(
            [
              ['visual', 'Visual', PenLine],
              ['html', 'HTML', Code2],
              ['preview', 'Preview', Eye],
            ] as const
          ).map(([m, text, Icon]) => (
            <Button
              key={m}
              type="button"
              size="sm"
              role="tab"
              aria-selected={mode === m}
              variant={mode === m ? 'default' : 'outline'}
              onClick={() => setMode(m)}
            >
              <Icon className="mr-1 h-4 w-4" aria-hidden /> {text}
            </Button>
          ))}
          <span className="ml-auto flex flex-wrap gap-2">
            {entry.current && (
              <Button type="button" size="sm" variant="ghost" onClick={() => startFrom('current')} disabled={loading}>
                Start from version {entry.current.version}
              </Button>
            )}
            {!entry.current && publicPath && (
              <Button type="button" size="sm" variant="ghost" onClick={() => startFrom('page')} disabled={loading}>
                Start from the public page
              </Button>
            )}
          </span>
        </div>
        {mode === 'visual' && RICH_UNSAFE_RE.test(html) && (
          <p className="text-xs text-amber-600">
            This text has tables or styled blocks the visual editor drops. Edit it in HTML mode to keep them.
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">Loading the text...</p>
        ) : mode === 'visual' ? (
          <RichTextEditor value={html} onChange={setHtml} ariaLabel={`${label} text`} />
        ) : mode === 'html' ? (
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={24}
            className="font-mono text-xs"
            aria-label={`${label} HTML`}
          />
        ) : (
          <article
            className="prose prose-slate max-h-[70vh] max-w-none overflow-auto rounded-xl border border-border p-6 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: cleanLegalHtml(html) }}
          />
        )}

        {message && (
          <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-emerald-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || loading}>
            {busy ? 'Saving...' : 'Save draft'}
          </Button>
          {draft && !confirmDiscard && (
            <Button type="button" variant="ghost" onClick={() => setConfirmDiscard(true)} disabled={busy}>
              Discard draft
            </Button>
          )}
          {confirmDiscard && (
            <>
              <Button type="button" variant="destructive" onClick={discard} disabled={busy}>
                Yes, discard version {draft?.version}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirmDiscard(false)} disabled={busy}>
                Keep it
              </Button>
            </>
          )}
        </div>
      </form>

      {draft && (
        <PublishPanel
          entry={entry}
          version={draft.version}
          consent={consent}
          material={material}
          summary={summary}
          beforePublish={save}
          onPublished={() => {
            onChanged();
            onBack();
          }}
        />
      )}

      <VersionHistory entry={entry} />
    </div>
  );
}

function PublishPanel({
  entry,
  version,
  consent,
  material,
  summary,
  beforePublish,
  onPublished,
}: {
  entry: LegalOverviewEntry;
  version: string;
  consent: boolean;
  material: boolean;
  summary: string;
  beforePublish: () => Promise<boolean>;
  onPublished: () => void;
}) {
  const dated = entry.effective_dated;
  const minDays = entry.notice?.min_notice_days ?? 0;
  const earliest = entry.notice ? earliestEffectiveDate(entry.notice.earliest) : '';
  const [date, setDate] = useState(dated ? earliest || today() : today());
  const [skipNotice, setSkipNotice] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const tooSoon = dated && !skipNotice && !!earliest && !!date && date < earliest;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (dated && !date) {
      setError('Choose an effective date.');
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      // Publish what is on screen: unsaved edits are saved first.
      if (!(await beforePublish())) {
        setConfirming(false);
        return;
      }
      await publishLegalDraft(legalTypeSlug(entry.doc_type), version, dated ? date : '', skipNotice, {
        summary,
        material: consent ? material : false,
      });
      onPublished();
    } catch (err) {
      setError(publishErrorMessage(err));
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="legal-publish-heading"
      className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <h3 id="legal-publish-heading" className="font-semibold">Publish version {version}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {dated
          ? minDays > 0
            ? `Users get at least ${minDays} days' notice, so the earliest effective date is ${earliest}. Skip the notice only for an urgent legal change; the version then applies today.`
            : 'No minimum notice is set for this document.'
          : 'It replaces the current version as soon as it is published.'}{' '}
        A published version is public and never changes.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {dated && (
          <div>
            <label htmlFor="legal-effective" className="mb-1 block text-sm font-medium">Effective date (UTC midnight)</label>
            <Input
              id="legal-effective"
              type="date"
              className="max-w-xs"
              value={date}
              min={skipNotice ? undefined : earliest || undefined}
              onChange={(e) => {
                setDate(e.target.value);
                setConfirming(false);
              }}
            />
            {tooSoon && <p className="mt-1 text-sm text-red-600">This is sooner than the {minDays} days&apos; notice.</p>}
          </div>
        )}
        {dated && minDays > 0 && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4"
              checked={skipNotice}
              onChange={(e) => {
                const skip = e.target.checked;
                setSkipNotice(skip);
                setConfirming(false);
                if (skip) setDate(today());
                else if (earliest && date < earliest) setDate(earliest);
              }}
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
          <p className="text-sm font-medium">
            Publish version {version}
            {dated ? ` with effect from ${formatLegalDate(`${date}T00:00:00Z`)}` : ' now'}
            {consent && material ? ', asking every user to accept it again' : ''}? This cannot be undone.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || tooSoon}>
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

const STATE_LABEL: Record<string, string> = {
  draft: 'Draft',
  current: 'In force',
  upcoming: 'Upcoming',
  scheduled: 'Scheduled',
  superseded: 'Superseded',
};

function VersionHistory({ entry }: { entry: LegalOverviewEntry }) {
  const publicPath = LEGAL_PUBLIC_PATHS[entry.doc_type];
  if (entry.versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions yet.</p>;
  }
  return (
    <section aria-labelledby="legal-history-heading" className="rounded-2xl border border-border bg-card p-5">
      <h3 id="legal-history-heading" className="mb-3 font-semibold">Version history</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Version</th>
              <th className="py-2 pr-4">State</th>
              <th className="py-2 pr-4">Effective</th>
              <th className="py-2 pr-4">What changed</th>
              <th className="py-2">Published by</th>
            </tr>
          </thead>
          <tbody>
            {entry.versions.map((v) => (
              <tr key={v.version} className="border-t border-border align-top">
                <td className="py-2 pr-4">
                  {publicPath && v.status === 'published' ? (
                    <Link
                      href={`${publicPath}/${encodeURIComponent(v.version)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {v.version}
                    </Link>
                  ) : (
                    v.version
                  )}
                  {v.material && <span className="ml-1 text-xs text-amber-600">material</span>}
                </td>
                <td className="py-2 pr-4">{STATE_LABEL[v.state ?? ''] ?? v.state}</td>
                <td className="py-2 pr-4">{v.status === 'draft' ? 'Not set' : formatLegalDate(v.effective_at)}</td>
                <td className="py-2 pr-4">{v.summary || '-'}</td>
                <td className="py-2">{v.published_by || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
