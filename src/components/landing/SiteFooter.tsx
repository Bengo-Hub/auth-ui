'use client';

import { openCookieSettings } from '@bengo-hub/shared-ui-lib/legal';
import Link from 'next/link';
import { CONTACT_EMAILS } from '@/config/contact-emails';
import type { SiteVariant } from '@/components/layout/site-chrome';
import { DEVELOPER_APPLY_PATH, DEVELOPER_HOME_PATH, DEVELOPER_LOGIN_PATH } from '@/lib/developer-access';
import { API_DOCS_URL } from '@/lib/enquiry';

const DEVELOPER_COLUMN = {
  title: 'Developers',
  links: [
    { label: 'Developer sign in', href: DEVELOPER_LOGIN_PATH },
    { label: 'Request API access', href: DEVELOPER_APPLY_PATH },
    { label: 'Developer console', href: DEVELOPER_HOME_PATH },
    { label: 'API docs', href: API_DOCS_URL },
    { label: 'System status', href: '/status' },
  ],
};

const COLUMNS = [
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create an organisation', href: '/signup' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'System status', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms-of-service' },
      { label: 'Cookie policy', href: '/cookies' },
      { label: 'Refund policy', href: '/refund-policy' },
      { label: 'MarketFlow Autopilot terms', href: '/legal/marketflow-autopublish-terms' },
      { label: 'Your data', href: '/data-requests' },
    ],
  },
];

/** Public site footer. The developer variant swaps the business account links for developer ones. */
export function SiteFooter({ variant = 'business' }: { variant?: SiteVariant }) {
  const developer = variant === 'developer';
  const columns = developer ? [DEVELOPER_COLUMN, COLUMNS[1]] : COLUMNS;
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/codevertex.png" alt="Codevertex Africa Limited" className="h-10 w-auto dark:brightness-0 dark:invert" />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {developer
              ? 'APIs for KRA eTIMS, payments, messaging and sign-in, from Codevertex Africa Limited.'
              : 'One account for every Codevertex app, from Codevertex Africa Limited.'}
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith('http') ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-foreground/80 transition-colors hover:text-primary">{l.label}</a>
                  ) : (
                    <Link href={l.href} className="text-foreground/80 transition-colors hover:text-primary">{l.label}</Link>
                  )}
                </li>
              ))}
              {col.title === 'Legal' && (
                <li><button type="button" onClick={openCookieSettings} className="text-foreground/80 transition-colors hover:text-primary">Cookie settings</button></li>
              )}
            </ul>
          </nav>
        ))}

        <nav aria-label="Contact" className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Help</p>
          <ul className="space-y-2 text-sm">
            <li><a href={`mailto:${CONTACT_EMAILS.support}`} className="text-foreground/80 transition-colors hover:text-primary">{CONTACT_EMAILS.support}</a></li>
            {!developer && (
              <li><a href={`mailto:${CONTACT_EMAILS.sales}`} className="text-foreground/80 transition-colors hover:text-primary">{CONTACT_EMAILS.sales}</a></li>
            )}
            <li><a href="https://codevertexafrica.com" className="text-foreground/80 transition-colors hover:text-primary">codevertexafrica.com</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          &copy; {new Date().getFullYear()} Codevertex Africa Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
