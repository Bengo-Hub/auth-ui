'use client';

/**
 * One layout for every sign-in surface (login, sign-up, password reset, organisation picker):
 * a single centred card carrying the tenant's own logo and name, the app being signed in to,
 * and a quiet "Secured by Codevertex" line. Modelled on the hosted login pages people already
 * trust (Auth0 Universal Login, Clerk, Microsoft and Google account sign-in): no split panel,
 * no marketing copy, nothing between the person and the form.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuthBrand } from '@/components/auth/AuthBrand';
import { cn } from '@/lib/utils';

function BrandMark() {
  const brand = useAuthBrand();
  if (brand.isLoading) {
    return <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-muted" aria-hidden />;
  }
  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className={cn('mx-auto h-12 w-auto max-w-45 object-contain', brand.isPlatform && 'dark:brightness-0 dark:invert')}
      />
    );
  }
  const initial = (brand.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground"
      aria-label={brand.name}
    >
      {initial}
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  below,
  wide = false,
}: {
  title: ReactNode;
  /** Defaults to "to continue to <app>" when the app is known. */
  subtitle?: ReactNode;
  children: ReactNode;
  /** Shown under the card, e.g. "No account? Create one". */
  below?: ReactNode;
  /** Wider card for multi-step forms (organisation sign-up). */
  wide?: boolean;
}) {
  const brand = useAuthBrand();
  const defaultSubtitle = brand.appName
    ? <>to continue to <span className="font-medium text-foreground">{brand.appName}</span></>
    : brand.isPlatform
      ? 'with your Codevertex account'
      : <>to <span className="font-medium text-foreground">{brand.name}</span></>;

  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="flex h-14 items-center justify-end px-4 sm:px-6">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-2 sm:items-center sm:pt-0">
        <div className={cn('w-full', wide ? 'max-w-xl' : 'max-w-105')}>
          <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10">
            <BrandMark />
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">{subtitle ?? defaultSubtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          {below && <div className="mt-6 text-center text-sm text-muted-foreground">{below}</div>}
        </div>
      </main>

      <footer className="flex flex-col items-center gap-2 px-4 pb-6 text-xs text-muted-foreground">
        {!brand.isPlatform && <p>Secured by Codevertex</p>}
        <nav className="flex items-center gap-4">
          <Link href="/terms-of-service" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <a href="mailto:support@codevertexafrica.com" className="hover:text-foreground">Help</a>
        </nav>
      </footer>
    </div>
  );
}

/** Status message box used inside the card (errors, notices). */
export function AuthNotice({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3.5 py-3 text-sm',
        // Dark-mode --destructive is a deep red that fails contrast as text, so use red-400 there.
        tone === 'error' && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
        tone === 'info' && 'border-border bg-muted text-foreground',
        tone === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      )}
    >
      {children}
    </div>
  );
}

/** "or" separator between provider buttons and the email form. */
export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="relative my-6" role="separator">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">{label}</span></div>
    </div>
  );
}
