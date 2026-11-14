import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import {
  formatLegalDate,
  getLegalDocument,
  getLegalDocumentVersion,
  legalPolicy,
  listLegalDocumentVersions,
} from '@/lib/legal-documents';

const VERSION_RE = /^[A-Za-z0-9._-]{1,32}$/;

/**
 * A platform policy page (owner 2026-11-15): the version published from the dashboard when there
 * is one, else `fallback`, the text built into the page. A version announced for later is named
 * in a notice and linked; when nothing is in force yet but a version is announced, the built-in
 * text stays in place with that notice above it.
 */
export async function PolicyPage({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const policy = legalPolicy(slug);
  const state = await getLegalDocument(policy.slug);
  if (state.kind !== 'published') return <>{fallback}</>;

  const { current, upcoming } = state;
  const upcomingNotice = upcoming ? (
    <p>
      A new version ({upcoming.version}) applies from <strong>{formatLegalDate(upcoming.effective_at)}</strong>.{' '}
      <Link href={`${policy.path}/${encodeURIComponent(upcoming.version)}`} className="text-primary underline">
        Read the new version
      </Link>
      {upcoming.summary ? <>. What changes: {upcoming.summary}</> : null}
    </p>
  ) : undefined;

  if (!current) {
    return (
      <>
        {upcomingNotice && (
          <div role="note" className="container mx-auto mt-6 max-w-4xl rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-slate-700 dark:text-slate-300">
            {upcomingNotice}
          </div>
        )}
        {fallback}
      </>
    );
  }

  const versions = await listLegalDocumentVersions(policy.slug);
  return (
    <LegalDocumentView
      title={current.title || policy.title}
      badge="Legal"
      basePath={policy.path}
      doc={current}
      notice={upcomingNotice}
      versions={versions}
    />
  );
}

/** One published version of a policy, an upcoming or a replaced one included. */
export async function PolicyVersionPage({ slug, rawVersion }: { slug: string; rawVersion: string }) {
  const policy = legalPolicy(slug);
  let version = '';
  try {
    version = decodeURIComponent(rawVersion);
  } catch {
    notFound();
  }
  if (!VERSION_RE.test(version)) notFound();

  const [state, timeline, versions] = await Promise.all([
    getLegalDocumentVersion(policy.slug, version),
    getLegalDocument(policy.slug),
    listLegalDocumentVersions(policy.slug),
  ]);
  if (state.kind === 'not_found') notFound();
  if (state.kind === 'unavailable') {
    return (
      <LegalDocumentView
        title={policy.title}
        badge="Legal"
        basePath={policy.path}
        doc={null}
        versions={[]}
        empty={<p>This version could not be loaded just now. Please try again in a few minutes.</p>}
      />
    );
  }

  const doc = state.doc;
  const current = timeline.kind === 'published' ? timeline.current : null;
  let notice: ReactNode = null;
  if (doc.in_force === false) {
    notice = (
      <p>
        This version applies from <strong>{formatLegalDate(doc.effective_at)}</strong>.
        {current && (
          <>
            {' '}Until then{' '}
            <Link href={policy.path} className="text-primary underline">version {current.version}</Link> applies.
          </>
        )}
      </p>
    );
  } else if (current && current.version !== doc.version) {
    notice = (
      <p>
        This version has been replaced.{' '}
        <Link href={policy.path} className="text-primary underline">Read the version in effect ({current.version})</Link>.
      </p>
    );
  }
  return (
    <LegalDocumentView
      title={doc.title || policy.title}
      badge="Legal"
      basePath={policy.path}
      doc={doc}
      notice={notice}
      versions={versions}
    />
  );
}
