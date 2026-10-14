'use client';

/**
 * One layout for every sign-in surface (login, sign-up, password reset), adapted from the Maskani
 * owner portal: the form sits straight on warm paper in a soft serif headline, beside a solid
 * brand panel. The panel shows what the person is signing in to: the real app grid on the
 * platform, or what a customer, rider or student gets from a tenant's app. The tenant's logo,
 * name and colour replace the platform's through TenantBrandScope.
 */

import { ArrowLeft, Check, Fingerprint, LogOut, ShieldCheck } from 'lucide-react';
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
          className={cn('w-auto max-w-none object-contain', invert ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert', className)}
        />
      ) : (
        // Tenant logos are often drawn on white: a neutral plate keeps them legible in dark mode too.
        <span className="inline-flex rounded-xl bg-white p-1.5 shadow-soft">
          <img src={brand.logoUrl} alt={brand.name} className={cn('w-auto max-w-[14rem] object-contain', className)} />
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

// What a customer gets depends on what the tenant sells: a retail shop has no kitchen. The first use
// case on the tenant (it can list several, comma separated) picks the order-tracking line.
const ORDER_PERK: Record<string, string> = {
  hospitality: 'Track every order from the kitchen to your table or door',
  quick_service: 'Track every order from the kitchen to your table or door',
  retail: 'Track every order from the shelf to your door',
  pharmacy: 'Track every prescription and order until it reaches you',
  logistics: 'Track every parcel from pickup to delivery',
};
function customerPerks(role: string, useCase: string): string[] | null {
  const first = (useCase || '').split(',')[0]?.trim().toLowerCase();
  if (role === 'customer') {
    return [ORDER_PERK[first] ?? 'Track every order from checkout to your door', 'Saved addresses and one-tap reorders', 'Receipts and loyalty points in one place'];
  }
  if (role === 'driver') return ['Your deliveries and earnings at a glance', 'Go online when you are ready to ride', 'Payouts and shift history, always on hand'];
  if (role === 'student') return ['Your course, lessons and progress', 'Pay in instalments that fit you', 'Certificates the moment you finish'];
  return null;
}
const STAFF_PERKS = ['Passkeys and authenticator codes', 'See and end any session, from one place', 'Sign out once, everywhere'];

const TRUST = [
  { icon: Fingerprint, label: 'Passkeys' },
  { icon: ShieldCheck, label: 'Two-step codes' },
  { icon: LogOut, label: 'Sign out everywhere' },
];

function BrandPanel() {
  const brand = useAuthBrand();
  const { flow } = brand;
  const customerRole = flow.customerApp?.role;
  const perks = customerRole ? customerPerks(customerRole, brand.tenant?.useCase ?? '') : null;
  const headline = brand.isPlatform
    ? flow.isCustomerApp && brand.appName
      ? `Welcome to ${brand.appName}.`
      : 'One sign-in for the whole business.'
    : brand.appName
      ? `Welcome to ${brand.appName}.`
      : `Welcome to ${brand.name}.`;
  const showLauncher = brand.isPlatform && !perks;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-primary p-10 text-primary-foreground dark:border dark:border-border dark:bg-primary/20 dark:text-white xl:p-14">
      {/* Decoration: soft glows, orbit rings and a dot grid. Pure CSS, no image to load. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div className="absolute -right-24 top-[38%] h-80 w-80 rounded-full border border-white/10" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to bottom, black, transparent 55%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 55%)',
          }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          {perks ? `For ${flow.customerApp?.people}` : brand.isPlatform ? 'Codevertex accounts' : 'Your account'}
        </span>
        <p className="text-sm font-medium opacity-70">{brand.isPlatform ? '' : brand.name}</p>
      </div>

      <div className="relative space-y-8 py-8">
        <div className="space-y-4">
          <h2 className="font-serif-soft max-w-lg text-4xl leading-[1.08] xl:text-[3.25rem]">{headline}</h2>
          {showLauncher && (
            <p className="max-w-md text-[0.95rem] leading-relaxed opacity-85">
              Point of sale, stock, books, payroll and orders open from one account, with one team list behind them.
            </p>
          )}
        </div>

        {showLauncher ? (
          <div className="max-w-xl rounded-[1.5rem] border border-white/20 bg-white/10 p-3 shadow-lift backdrop-blur-sm">
            <AppLauncher />
          </div>
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

      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/15 pt-5">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium opacity-90">
          {TRUST.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" aria-hidden /> {t.label}
            </li>
          ))}
        </ul>
        <p className="text-xs opacity-60">{brand.isPlatform ? 'Codevertex Africa Limited' : 'Secured by Codevertex'}</p>
      </div>
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
                <Logo brand={brand} className={brand.isPlatform ? 'h-24 sm:h-28' : 'h-14'} />
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
