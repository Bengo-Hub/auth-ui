import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { CONTACT_EMAILS } from '@/config/contact-emails';

export interface LegalSection {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  body: ReactNode;
}

/** One entry of the Contents list: an anchor on the page and its label. */
export interface LegalContentsEntry {
  id: string;
  title: string;
}

export const LEGAL_CONTACT = {
  email: CONTACT_EMAILS.legal,
  address: 'Pioneer House, 2nd Floor, Oginga Street, Kisumu, Kenya',
  company: 'Codevertex Africa Limited',
};

export const LEGAL_RELATED = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/data-requests', label: 'Your data and your rights' },
  { href: '/legal/marketflow-autopublish-terms', label: 'MarketFlow Autopilot terms' },
];

/**
 * The frame every legal page shares: title block, a sticky Contents list on desktop, the body,
 * and links to the other policies. Built-in pages fill it with numbered sections
 * (LegalPageShell); a version published in auth-api fills it with its HTML (LegalDocumentView).
 */
export function LegalFrame({
  badge,
  badgeIcon: BadgeIcon,
  title,
  meta,
  intro,
  notice,
  contents,
  current,
  children,
  after,
}: {
  badge: string;
  badgeIcon: ComponentType<{ className?: string }>;
  title: string;
  /** The line under the title: last updated, or the version and its effective date. */
  meta?: ReactNode;
  intro?: ReactNode;
  /** A highlighted note under the title (an upcoming or replaced version). */
  notice?: ReactNode;
  contents: LegalContentsEntry[];
  /** This page's path, left out of the other policies. */
  current: string;
  /** The body, inside the prose article. */
  children: ReactNode;
  /** Shown under the body, before the other policies (for example the list of versions). */
  after?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white py-16 dark:bg-[#0a0a0a] sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-12 max-w-3xl sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <BadgeIcon className="h-3.5 w-3.5" /> {badge}
          </div>
          <h1 className="mb-4 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">{title}</h1>
          {meta && <div className="text-sm text-slate-500">{meta}</div>}
          {intro && <div className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{intro}</div>}
          {notice && (
            <div role="note" className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {notice}
            </div>
          )}
        </header>

        <div className="grid items-start gap-12 md:grid-cols-[240px_minmax(0,1fr)] md:gap-16">
          <aside className="sticky top-28 hidden h-fit md:block">
            {contents.length > 0 && (
              <>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contents</p>
                <nav aria-label="Contents" className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
                  {contents.map((s) => (
                    <a key={s.id} href={`#${s.id}`} className="rounded-lg px-3 py-1 text-sm text-slate-500 transition-all hover:bg-primary/5 hover:text-primary">
                      {s.title}
                    </a>
                  ))}
                </nav>
              </>
            )}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#1a1a1a]">
              <p className="mb-2 text-xs font-bold text-slate-500">Questions</p>
              <a href={`mailto:${LEGAL_CONTACT.email}`} className="break-all text-xs text-primary hover:underline">
                {LEGAL_CONTACT.email}
              </a>
              <p className="mt-1 text-xs text-slate-400">{LEGAL_CONTACT.address}</p>
            </div>
          </aside>

          <div className="min-w-0">
            {children}

            {after}

            <nav aria-label="Other policies" className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Other policies</p>
              <ul className="flex flex-wrap gap-2">
                {LEGAL_RELATED.filter((r) => r.href !== current).map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-primary hover:text-primary dark:border-white/10 dark:text-slate-300">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * A built-in legal page: numbered sections with an icon each, in the shared frame. Every
 * Codevertex app links here (shared-ui-lib LegalLinks), so these pages are the single copy.
 */
export function LegalPageShell({
  badge,
  badgeIcon,
  title,
  updated,
  intro,
  sections,
  current,
}: {
  badge: string;
  badgeIcon: ComponentType<{ className?: string }>;
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
  current: string;
}) {
  return (
    <LegalFrame
      badge={badge}
      badgeIcon={badgeIcon}
      title={title}
      meta={
        <p>
          Last updated: <strong>{updated}</strong>
        </p>
      }
      intro={intro}
      contents={sections.map((s, i) => ({ id: s.id, title: `${i + 1}. ${s.title}` }))}
      current={current}
    >
      <article className="prose prose-slate max-w-none space-y-12 dark:prose-invert">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <div className="not-prose mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {i + 1}. {s.title}
              </h2>
            </div>
            {s.body}
          </section>
        ))}
      </article>
    </LegalFrame>
  );
}
