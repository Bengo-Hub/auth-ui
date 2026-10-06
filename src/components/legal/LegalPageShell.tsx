import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';

export interface LegalSection {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  body: ReactNode;
}

export const LEGAL_CONTACT = {
  email: 'info@codevertexafrica.com',
  address: 'Pioneer House, 2nd Floor, Oginga Street, Kisumu, Kenya',
  company: 'Codevertex Africa Limited',
};

const RELATED = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/data-requests', label: 'Your data and your rights' },
];

/**
 * Layout shared by the legal pages: title block, a sticky contents list on desktop, numbered
 * sections, and links to the other policies. Every Codevertex app links here (shared-ui-lib
 * LegalLinks), so these pages are the single copy.
 */
export function LegalPageShell({
  badge,
  badgeIcon: BadgeIcon,
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
    <main className="min-h-screen bg-white py-16 dark:bg-[#0a0a0a] sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-12 max-w-3xl sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <BadgeIcon className="h-3.5 w-3.5" /> {badge}
          </div>
          <h1 className="mb-4 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">{title}</h1>
          <p className="text-sm text-slate-500">
            Last updated: <strong>{updated}</strong>
          </p>
          <div className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{intro}</div>
        </header>

        <div className="grid items-start gap-12 md:grid-cols-[240px_1fr] md:gap-16">
          <aside className="sticky top-28 hidden h-fit md:block">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contents</p>
            <nav aria-label="Contents" className="flex flex-col gap-1">
              {sections.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-lg px-3 py-1 text-sm text-slate-500 transition-all hover:bg-primary/5 hover:text-primary">
                  {i + 1}. {s.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#1a1a1a]">
              <p className="mb-2 text-xs font-bold text-slate-500">Questions</p>
              <a href={`mailto:${LEGAL_CONTACT.email}`} className="break-all text-xs text-primary hover:underline">
                {LEGAL_CONTACT.email}
              </a>
              <p className="mt-1 text-xs text-slate-400">{LEGAL_CONTACT.address}</p>
            </div>
          </aside>

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

            <nav aria-label="Other policies" className="not-prose border-t border-slate-200 pt-8 dark:border-white/10">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Other policies</p>
              <ul className="flex flex-wrap gap-2">
                {RELATED.filter((r) => r.href !== current).map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-primary hover:text-primary dark:border-white/10 dark:text-slate-300">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </article>
        </div>
      </div>
    </main>
  );
}
