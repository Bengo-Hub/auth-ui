'use client';

/**
 * One layout for every sign-in surface (login, sign-up, password reset), adapted from the Maskani
 * owner portal: the form sits straight on warm paper in a soft serif headline, beside a solid
 * brand panel. The panel shows what the person is signing in to: the real app grid on the
 * platform, or what a customer, rider or student gets from a tenant's app. The tenant's logo,
 * name and colour replace the platform's through TenantBrandScope.
 */

import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppLauncher } from '@/components/landing/AppLauncher';
import { useAuthBrand, type AuthBrand } from '@/components/auth/AuthBrand';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

function Logo({ brand, className, invert }: { brand: AuthBrand; className?: string; invert?: boolean }) {
  if (brand.isLoading) return <div className={cn('animate-pulse rounded-xl bg-muted', className)} aria-hidden />;
  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      brand.isPlatform ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className={cn('w-auto max-w-[70%] object-contain', invert ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert', className)}
        />
      ) : (
        // Tenant logos are often drawn on white: a neutral plate keeps them legible in dark mode too.
        <span className="inline-flex rounded-xl bg-white p-1.5 shadow-soft">
          <img src={brand.logoUrl} alt={brand.name} className={cn('w-auto max-w-[10rem] object-contain', className)} />
        </span>
      )
    );
  }
  return (
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary font-serif-soft text-2xl text-primary-foreground" aria-label={brand.name}>
      {(brand.name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

const CUSTOMER_PERKS: Record<string, string[]> = {
  customer: ['Track every order from the kitchen to your door', 'Saved addresses and one-tap reorders', 'Receipts and loyalty points in one place'],
  driver: ['Your deliveries and earnings at a glance', 'Go online when you are ready to ride', 'Payouts and shift history, always on hand'],
  student: ['Your course, lessons and progress', 'Pay in instalments that fit you', 'Certificates the moment you finish'],
};
const STAFF_PERKS = ['Passkeys and authenticator codes', 'See and end any session, from one place', 'Sign out once, everywhere'];

function BrandPanel() {
  const brand = useAuthBrand();
  const { flow } = brand;
  const customerRole = flow.customerApp?.role;
  const perks = customerRole ? CUSTOMER_PERKS[customerRole] : null;
  const headline = brand.isPlatform
    ? flow.isCustomerApp && brand.appName
      ? `Welcome to ${brand.appName}.`
      : 'One sign-in for the whole business.'
    : brand.appName
      ? `Welcome to ${brand.appName}.`
      : `Welcome to ${brand.name}.`;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-primary p-10 text-primary-foreground dark:border dark:border-border dark:bg-primary/20 dark:text-white xl:p-14">
      <p className="text-sm font-medium opacity-70">{brand.isPlatform ? 'Codevertex' : brand.name}</p>

      <div className="space-y-8 py-10">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-wide opacity-80">
            {perks ? `For ${flow.customerApp?.people}` : brand.isPlatform ? 'Codevertex accounts' : 'Your account'}
          </p>
          <h2 className="font-serif-soft max-w-md text-4xl leading-[1.1] xl:text-5xl">{headline}</h2>
        </div>

        {brand.isPlatform && !perks ? (
          <AppLauncher className="max-w-md" />
        ) : (
          <ul className="max-w-md space-y-3.5">
            {(perks ?? STAFF_PERKS).map((line) => (
              <li key={line} className="flex items-start gap-3 text-[0.95rem] leading-snug opacity-95">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs opacity-60">
        {brand.isPlatform ? 'Codevertex Africa Limited, Nairobi' : 'Secured by Codevertex'}
      </p>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  below,
  wide = false,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Shown under the form, e.g. "No account? Create one". */
  below?: ReactNode;
  /** Wider form column for the multi-step organisation sign-up. */
  wide?: boolean;
  back?: { href: string; label: string };
}) {
  const brand = useAuthBrand();
  const defaultSubtitle = brand.appName
    ? (
      <span className="inline-flex items-center gap-2">
        {brand.appIconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.appIconUrl} alt="" className="h-6 w-6 rounded-md object-contain" />
        )}
        <span>to continue to <span className="font-medium text-foreground">{brand.appName}</span></span>
      </span>
    )
    : brand.isPlatform
      ? 'with your Codevertex account'
      : <>to <span className="font-medium text-foreground">{brand.name}</span></>;

  return (
    <div className="flex min-h-dvh bg-paper">
      <div className="flex w-full flex-col lg:w-[52%] lg:min-w-[34rem]">
        {/* Phones and tablets: a short brand band above the form. */}
        <div className="flex items-center gap-3 rounded-b-[2rem] bg-primary px-5 pb-6 pt-7 text-primary-foreground lg:hidden">
          <div className={brand.isPlatform ? 'rounded-xl bg-white/95 px-3 py-2' : ''}><Logo brand={brand} className={brand.isPlatform ? 'h-9' : 'h-8'} /></div>
          <div className="min-w-0">
            <p className="truncate font-serif-soft text-lg leading-tight">{brand.appName ?? brand.name}</p>
            {!brand.isPlatform && <p className="text-xs text-primary-foreground/70">Secured by Codevertex</p>}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-6 pt-6 sm:px-10 lg:px-16 lg:pt-10 xl:px-20">
          <div className="flex items-center justify-between gap-4">
            {back ? (
              <Link href={back.href} className="inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" aria-hidden /> {back.label}
              </Link>
            ) : (
              <Link href="/" className="hidden lg:block" aria-label="Codevertex accounts, home">
                <Logo brand={brand} className={brand.isPlatform ? 'h-16' : 'h-10'} />
              </Link>
            )}
            <span className="lg:hidden" />
            <ThemeToggle />
          </div>

          <div className={cn('mx-auto flex w-full flex-1 flex-col justify-center py-8 animate-rise', wide ? 'max-w-xl' : 'max-w-[30rem]')}>
            <div className="mb-8 space-y-2.5">
              <h1 className="font-serif-soft text-[2.1rem] leading-tight sm:text-[2.5rem]">{title}</h1>
              <p className="text-[1rem] leading-relaxed text-muted-foreground">{subtitle ?? defaultSubtitle}</p>
            </div>
            {children}
            {below && <div className="mt-8 text-sm text-muted-foreground">{below}</div>}
          </div>

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>Codevertex</span>
            <Link href="/terms-of-service" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:support@codevertexafrica.com" className="hover:text-foreground">Help</a>
          </footer>
        </div>
      </div>

      <div className="relative hidden flex-1 p-4 lg:block">
        <BrandPanel />
      </div>
    </div>
  );
}

/** Status message box used inside the form (errors, notices). */
export function AuthNotice({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        // Dark-mode --destructive is a deep red that fails contrast as text, so use red-400 there.
        tone === 'error' && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
        tone === 'info' && 'border-border bg-secondary text-foreground',
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
      <div className="relative flex justify-center"><span className="bg-paper px-3 text-xs text-muted-foreground">{label}</span></div>
    </div>
  );
}
