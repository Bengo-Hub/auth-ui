import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { LegalFrame } from '@/components/legal/LegalPageShell';
import { cleanLegalHtml, formatLegalDate, legalContents, type LegalDocumentVersion } from '@/lib/legal-documents';

/**
 * A versioned legal document from auth-api, in the same frame as the built-in policy pages: title
 * block with the version and its effective date, an optional notice (upcoming version, superseded
 * version), a Contents list built from the document's headings, the body, the other versions and
 * the other policies. With no doc it shows `empty` in place of the body.
 */
export function LegalDocumentView({
  title,
  badge,
  badgeIcon = FileText,
  basePath,
  doc,
  notice,
  empty,
  versions,
  meta,
  footer,
}: {
  title: string;
  badge: string;
  badgeIcon?: ComponentType<{ className?: string }>;
  basePath: string;
  doc: LegalDocumentVersion | null;
  notice?: ReactNode;
  empty?: ReactNode;
  versions: LegalDocumentVersion[];
  /** Replaces the "Version X, in effect from" line (the draft preview has no date in force yet). */
  meta?: ReactNode;
  /** Shown under the body, before the version list (the draft preview's Publish form). */
  footer?: ReactNode;
}) {
  const html = doc?.html_content ? cleanLegalHtml(doc.html_content) : '';
  const contents = html ? legalContents(html) : [];
  const metaLine =
    meta ??
    (doc && (
      <p>
        Version <strong>{doc.version}</strong>, in effect from <strong>{formatLegalDate(doc.effective_at)}</strong>
      </p>
    ));

  return (
    <LegalFrame
      badge={badge}
      badgeIcon={badgeIcon}
      title={title}
      meta={metaLine}
      notice={notice}
      contents={contents}
      current={basePath}
      after={
        <>
          {footer}
          {versions.length > 0 && (
            <nav aria-label="Versions" className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">All versions</p>
              <ul className="space-y-2 text-sm">
                {versions.map((v) => (
                  <li key={v.version}>
                    <Link href={`${basePath}/${encodeURIComponent(v.version)}`} className="text-primary hover:underline">
                      Version {v.version}
                    </Link>{' '}
                    <span className="text-slate-500">
                      {v.in_force === false ? 'applies from' : 'in effect from'} {formatLegalDate(v.effective_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      }
    >
      {html ? (
        <article
          className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-h2:mt-12 prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900 sm:prose-h2:text-2xl dark:prose-h2:text-white prose-a:text-primary prose-table:text-sm prose-th:text-left [&_table]:block [&_table]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-slate-300">
          {empty}
        </div>
      )}
    </LegalFrame>
  );
}
