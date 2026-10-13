'use client';

import { Fingerprint, KeyRound, LogOut, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { SERVICE_CATEGORIES, getServiceUrl } from '@/config/services';
import { useAuth } from '@/hooks/useAuth';
import { ServiceWithHealth, useServiceHealth } from '@/hooks/useServiceHealth';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<ServiceWithHealth['status'], string> = {
  live: 'Live',
  beta: 'Beta',
  'coming-soon': 'Coming soon',
  offline: 'Offline',
};

const STATUS_CLASS: Record<ServiceWithHealth['status'], string> = {
  live: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  beta: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'coming-soon': 'bg-muted text-muted-foreground',
  offline: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function AppCard({ service, isAuthenticated }: { service: ServiceWithHealth; isAuthenticated: boolean }) {
  const Icon = service.icon;
  const available = service.status === 'live' || service.status === 'beta';
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          {service.svgIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={service.svgIcon} alt="" className="h-6 w-6 object-contain" />
          ) : (
            <Icon className="h-5 w-5 text-foreground" />
          )}
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_CLASS[service.status])}>
          {STATUS_LABEL[service.status]}
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{service.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
      {available && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );
  const className = 'flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors';
  if (!available) return <div className={cn(className, 'opacity-70')}>{body}</div>;
  return (
    <Link href={getServiceUrl(service.id, isAuthenticated)} className={cn(className, 'hover:border-primary/40 hover:bg-muted/40')}>
      {body}
    </Link>
  );
}

const SECURITY = [
  { icon: Fingerprint, title: 'Passkeys and authenticator codes', desc: 'Sign in with your fingerprint or face, and add a code from an authenticator app for a second step.' },
  { icon: KeyRound, title: 'You see every session', desc: 'Your account page lists where you are signed in, so you can end any session you do not recognise.' },
  { icon: LogOut, title: 'Sign out once, everywhere', desc: 'Signing out ends your session across every Codevertex app, not just the one you are using.' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { services } = useServiceHealth();
  const [category, setCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shown = useMemo(
    () => (category ? services.filter((s) => s.category === category) : services),
    [category, services],
  );

  return (
    <div className="bg-background">
      <section className="border-b border-border px-4 pb-16 pt-20 sm:px-6 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Your Codevertex account</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            One sign-in for every Codevertex app your business runs on: point of sale, stock, books, HR, online ordering and more.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!mounted ? (
              <div className="h-11 w-40 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <>
                <Button asChild size="lg" className="h-11 px-6"><Link href="/dashboard">Go to my account</Link></Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-6"><a href="#apps">Browse apps</a></Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 px-6"><Link href="/login">Sign in</Link></Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-6"><Link href="/signup">Create an organisation</Link></Button>
              </>
            )}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            When you sign in with Google, Microsoft or GitHub we ask only for your basic profile (email, name and picture) to identify
            your account, and nothing beyond that. See our{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link> and{' '}
            <Link href="/terms-of-service" className="underline underline-offset-2 hover:text-foreground">Terms of Service</Link>.
          </p>
        </div>
      </section>

      <section id="apps" className="scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Apps on your account</h2>
              <p className="mt-2 text-muted-foreground">Open any app below with the same sign-in.</p>
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="App categories">
              {[{ id: null as string | null, name: 'All' }, ...SERVICE_CATEGORIES.map((c) => ({ id: c.id as string | null, name: c.name }))].map((c) => (
                <button
                  key={c.id ?? 'all'}
                  role="tab"
                  aria-selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
                    category === c.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((s) => <AppCard key={s.id} service={s} isAuthenticated={isAuthenticated} />)}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Keeping your account safe</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SECURITY.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
