'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { SERVICE_CATEGORIES, getServiceUrl } from '@/config/services';
import { useAuth } from '@/hooks/useAuth';
import { ServiceWithHealth, useServiceHealth } from '@/hooks/useServiceHealth';
import { enquiryTopicForApp, enquiryUrl } from '@/lib/enquiry';
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

function ServiceCard({ service, isAuthenticated }: { service: ServiceWithHealth; isAuthenticated: boolean }) {
  const Icon = service.icon;
  const available = service.status === 'live' || service.status === 'beta';
  // Signed in: the card opens the app. Anyone else is asking about the product, so it goes to the
  // website's enquiry form with this product chosen.
  const opens = isAuthenticated && available;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_CLASS[service.status])}>{STATUS_LABEL[service.status]}</span>
      </div>
      <h3 className="mt-4 font-semibold">{service.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
      {(opens || !isAuthenticated) && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {opens ? 'Open' : `Ask about ${service.shortName ?? service.name}`}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      )}
    </>
  );
  const className = 'group flex h-full flex-col rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-soft transition-all';
  const interactive = cn(
    className,
    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  );
  if (opens) {
    return (
      <Link href={getServiceUrl(service.id, isAuthenticated)} className={interactive}>
        {body}
      </Link>
    );
  }
  if (!isAuthenticated) {
    return (
      <a href={enquiryUrl(enquiryTopicForApp(service.id))} className={interactive}>
        {body}
      </a>
    );
  }
  return <div className={cn(className, 'opacity-70')}>{body}</div>;
}

/**
 * Every Codevertex app with its live status, filterable by category. Same data and links as
 * before the redesign (config/services.ts, /api/health, getServiceUrl): a signed-in person goes
 * straight to the app, anyone else goes to the website's enquiry form for that product.
 */
export function ServiceDirectory() {
  const { isAuthenticated } = useAuth();
  const { services } = useServiceHealth();
  const [category, setCategory] = useState<string | null>(null);
  const shown = useMemo(() => (category ? services.filter((s) => s.category === category) : services), [category, services]);

  return (
    <div>
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="App categories">
        {[{ id: null as string | null, name: 'All apps' }, ...SERVICE_CATEGORIES.map((c) => ({ id: c.id as string | null, name: c.name }))].map((c) => (
          <button
            key={c.id ?? 'all'}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors',
              category === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((s) => <ServiceCard key={s.id} service={s} isAuthenticated={isAuthenticated} />)}
      </div>
    </div>
  );
}
