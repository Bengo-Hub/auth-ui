'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionApi, type Plan } from '@/lib/subscription-api';
import { buildCatalog, compareUrl, fromPrice, subscribeUrl, type Product, type Tier } from '@/lib/pricing-catalog';
import { cn } from '@/lib/utils';

const money = (amount: number, currency = 'KES') =>
  `${currency} ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

/**
 * Public price list for every Codevertex app, read live from subscriptions-api and grouped by who
 * each product serves. Buying happens in subscriptions-ui: a signed-out visitor creates an account
 * first and lands on checkout for the plan they picked.
 */
export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => subscriptionApi.getPlans(),
    staleTime: 10 * 60_000,
  });
  // Feature names are optional: prices render first and the lists fill in when the catalog loads.
  const { data: featureCatalog } = useQuery({
    queryKey: ['public-feature-catalog'],
    queryFn: () => subscriptionApi.getFeatureCatalog(),
    staleTime: 30 * 60_000,
  });
  const categories = useMemo(() => buildCatalog(data ?? [], featureCatalog ?? []), [data, featureCatalog]);

  // Checkout needs a session; sign-up hands the visitor back to checkout for the same plan.
  const buyHref = (code: string) =>
    isAuthenticated ? subscribeUrl(code) : `/signup?return_to=${encodeURIComponent(subscribeUrl(code))}`;

  return (
    <div className="bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Each Codevertex app is priced on its own, so you pay only for what you use. Try it free,
          pay monthly, or buy a licence once and keep it.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Prices are in Kenya shillings and come straight from our billing system. VAT may apply.</p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Product groups" className="sticky top-16 z-20 border-y border-border bg-background/95 backdrop-blur">
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 scrollbar-hide sm:px-6 lg:px-8">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#${c.id}`}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {c.title}
                  <span className="rounded-md bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{c.products.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-6 pt-10" aria-label="Loading prices">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : isError || categories.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8">
            <p className="font-semibold">Prices did not load.</p>
            <p className="mt-1 text-muted-foreground">
              Try again, or email <a className="font-medium text-primary hover:underline" href="mailto:info@codevertexafrica.com">info@codevertexafrica.com</a> for a quote.
            </p>
            <Button className="mt-5" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Loading' : 'Try again'}
            </Button>
          </div>
        ) : (
          categories.map((c) => (
            <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-32 border-b border-border py-12 last:border-b-0 lg:grid lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-36">
                  <h2 id={`${c.id}-title`} className="font-display text-2xl font-bold tracking-tight">{c.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.lead}</p>
                </div>
              </div>
              <div className="mt-6 space-y-8 lg:col-span-9 lg:mt-0">
                {c.products.map((p) => (
                  <ProductPrices key={p.key} product={p} buyHref={buyHref} signedIn={isAuthenticated} />
                ))}
              </div>
            </section>
          ))
        )}

        <aside className="mt-4 grid gap-6 rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-xl font-bold">Need more than the top plan?</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed opacity-80">
              Several branches, a hospital, or a setup that needs installation and training? Tell us
              about it and we will quote within one business day. Annual support contracts are arranged the same way.
            </p>
          </div>
          <Button asChild size="lg">
            <a href="mailto:info@codevertexafrica.com?subject=Pricing%20enquiry">Ask for a quote</a>
          </Button>
        </aside>
      </main>
    </div>
  );
}

function ProductPrices({ product, buyHref, signedIn }: { product: Product; buyHref: (code: string) => string; signedIn: boolean }) {
  const from = fromPrice(product);
  const hasLicence = product.tiers.some((t) => t.licence);
  const hasMonthly = product.tiers.some((t) => t.monthly);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 p-5 sm:p-6">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold">{product.name}</h3>
          {product.forWho && <p className="mt-0.5 text-sm text-muted-foreground">{product.forWho}</p>}
        </div>
        <div className="text-left sm:text-right">
          {from && (
            <p className="text-sm text-muted-foreground">
              From <span className="font-display text-lg font-bold text-foreground">{money(from.amount, from.currency)}</span>
              {from.once ? ' once' : ' a month'}
            </p>
          )}
          {product.trialDays > 0 && <p className="text-xs font-medium text-primary">{product.trialDays}-day free trial</p>}
        </div>
      </div>

      {/* Column labels only where both ways to pay exist, so a single price never needs a key. */}
      {hasLicence && hasMonthly && (
        <div className="hidden border-t border-border bg-muted/50 px-6 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
          <span className="col-span-5">Plan</span>
          <span className="col-span-3">Pay monthly</span>
          <span className="col-span-4">Or buy once</span>
        </div>
      )}

      <ul className="divide-y divide-border border-t border-border">
        {product.tiers.map((t) => (
          <TierRow key={t.code} tier={t} split={hasLicence && hasMonthly} buyHref={buyHref} signedIn={signedIn} />
        ))}
      </ul>

      <div className="border-t border-border px-5 py-3 sm:px-6">
        <a href={compareUrl(product.serviceTag, product.tiers[0]?.code)} className="text-sm font-medium text-primary hover:underline underline-offset-4">
          Compare every feature and limit
        </a>
      </div>
    </article>
  );
}

function TierRow({ tier, split, buyHref, signedIn }: { tier: Tier; split: boolean; buyHref: (code: string) => string; signedIn: boolean }) {
  const { monthly, licence } = tier;
  const setup = monthly?.setup_fee ?? 0;
  const monthlyCta = (p: Plan) => (signedIn ? 'Choose plan' : (p.free_trial_days ?? 0) > 0 ? 'Start free trial' : 'Subscribe');

  return (
    <li className="grid gap-4 p-5 sm:p-6 md:grid-cols-12 md:items-start">
      <div className={cn(split ? 'md:col-span-5' : 'md:col-span-7')}>
        <p className="font-semibold">{tier.label}</p>
        {tier.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>}
        {tier.limits.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {tier.limits.map((l) => (
              <li key={l.label} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                <span><span className="font-semibold tabular-nums">{l.value}</span> {l.label}</span>
              </li>
            ))}
          </ul>
        )}
        {tier.notes.map((n) => (
          <p key={n} className="mt-2 text-sm text-muted-foreground">{n}</p>
        ))}
        {tier.featureCount > 0 && (
          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">See all {tier.featureCount} features</span>
              <span className="hidden group-open:inline">Hide features</span>
            </summary>
            <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {tier.features.map((g) => (
                <div key={g.category}>
                  <p className="text-xs font-semibold text-muted-foreground">{g.category}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {g.labels.map((label) => (
                      <li key={label} className="flex gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {monthly && (
        <div className={cn('flex flex-col gap-2', split ? 'md:col-span-3' : 'md:col-span-5 md:items-end md:text-right')}>
          <p className="flex flex-wrap items-baseline gap-x-1">
            <span className="whitespace-nowrap font-display text-2xl font-bold tabular-nums">{money(monthly.base_price, monthly.currency)}</span>
            <span className="whitespace-nowrap text-sm text-muted-foreground">a month</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {setup > 0 ? `Setup ${money(setup, monthly.currency)}, waived when you pay 6 months or more` : 'No setup fee'}
          </p>
          <Button asChild size="sm" className="mt-1 w-full md:w-auto">
            <Link href={buyHref(monthly.plan_code)}>{monthlyCta(monthly)}</Link>
          </Button>
        </div>
      )}

      {licence && (
        <div className={cn('flex flex-col gap-2', split ? 'md:col-span-4 md:border-l md:border-border md:pl-4' : 'md:col-span-5 md:items-end md:text-right')}>
          <p className="flex flex-wrap items-baseline gap-x-1">
            <span className="whitespace-nowrap font-display text-2xl font-bold tabular-nums">{money(licence.base_price, licence.currency)}</span>
            <span className="whitespace-nowrap text-sm text-muted-foreground">once</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Perpetual licence, yours to keep{(licence.setup_fee ?? 0) > 0 ? `. Setup ${money(licence.setup_fee ?? 0, licence.currency)}` : ''}
          </p>
          <Button asChild size="sm" variant="outline" className="mt-1 w-full md:w-auto">
            <Link href={buyHref(licence.plan_code)}>Buy licence</Link>
          </Button>
        </div>
      )}
    </li>
  );
}
