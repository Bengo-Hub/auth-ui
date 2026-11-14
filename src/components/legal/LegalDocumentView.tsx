import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { LEGAL_CONTACT, LEGAL_RELATED } from '@/components/legal/LegalPageShell';
import { cleanLegalHtml, formatLegalDate, type LegalDocumentVersion } from '@/lib/legal-documents';

/**
 * A versioned legal document from auth-api: title block with the version and its effective date,
 * an optional notice (upcoming version, superseded version), the body, the other versions and the
 * other policies. With no doc it shows `empty` in place of the body.
 */
export function LegalDocumentView({
  title,
  badge,
  basePath,
  doc,
  notice,
  empty,
  versions,
}: {
  title: string;
  badge: string;
  basePath: string;
  doc: LegalDocumentVersion | null;
  notice?: ReactNode;
  empty?: ReactNode;
  versions: LegalDocumentVersion[];
}) {
  return (
    <main className="min-h-screen bg-white py-16 dark:bg-[#0a0a0a] sm:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <header className="mb-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <FileText className="h-3.5 w-3.5" /> {badge}
          </div>
          <h1 className="mb-4 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">{title}</h1>
          {doc && (
            <p className="text-sm text-slate-500">
              Version <strong>{doc.version}</strong>, in effect from <strong>{formatLegalDate(doc.effective_at)}</strong>
            </p>
          )}
          {notice && (
            <div role="note" className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {notice}
            </div>
          )}
        </header>

        {doc?.html_content ? (
          <article
            className="prose prose-slate max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: cleanLegalHtml(doc.html_content) }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-slate-300">
            {empty}
          </div>
        )}

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

        <nav aria-label="Other policies" className="mt-10 border-t border-slate-200 pt-8 dark:border-white/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Other policies</p>
          <ul className="flex flex-wrap gap-2">
            {LEGAL_RELATED.filter((r) => r.href !== basePath).map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-primary hover:text-primary dark:border-white/10 dark:text-slate-300"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-slate-400">
            Questions: <a href={`mailto:${LEGAL_CONTACT.email}`} className="text-primary hover:underline">{LEGAL_CONTACT.email}</a>,{' '}
            {LEGAL_CONTACT.address}
          </p>
        </nav>
      </div>
    </main>
  );
}
