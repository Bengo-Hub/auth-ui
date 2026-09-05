'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUseCaseConfig } from '@/hooks/useUseCaseConfig';
import { useServiceSubscriptions } from '@/hooks/use-dashboard-api';
import { subscriptionApi, type ServiceSubscriptionEntry } from '@/lib/subscription-api';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTIONS_BASE } from './shared';
import { PlanSection, ServiceChargePlanCard } from './billing-plan-card';

const SERVICE_TAG_LABELS: Record<string, string> = {
  ordering: 'Ordering',
  pos: 'Point of Sale',
  logistics: 'Logistics',
  inventory: 'Inventory',
  erp: 'ERP / Accounting',
  treasury: 'Treasury & Finance',
  hospital: 'Hospital / Clinic (Afya)',
  truload: 'Axle Load (TruLoad)',
  marketflow: 'MarketFlow CRM',
  isp_billing: 'ISP Billing',
  projects: 'Projects & Invoicing',
};

const ALL_SERVICE_TAGS = Object.keys(SERVICE_TAG_LABELS);

// Tags that are vertical-specific — auth-api's usecase.Resolver actually maps these to
// particular business use cases (retail/hospitality/pharmacy/etc). Cross-cutting
// back-office services (erp, treasury, marketflow, projects) have no use_case mapping
// of their own in the resolver — every tenant sees those regardless of vertical, so
// they're deliberately never hidden here.
const VERTICAL_SERVICE_TAGS = new Set(['pos', 'ordering', 'inventory', 'hospital', 'truload', 'isp_billing', 'logistics']);

// Converts auth-api's ApplicableServices() service names (e.g. "pos-api",
// "ordering-backend", "isp-billing") to this page's own tag keys (e.g. "pos",
// "ordering", "isp_billing") — same normalization, just applied here instead of
// duplicating the use_case→services table itself (that stays server-side, single
// source of truth in auth-api's usecase.Resolver).
function toServiceTag(name: string): string {
  return name.replace(/-api$/, '').replace(/-backend$/, '').replace(/-/g, '_');
}

// ── Billing ───────────────────────────────────────────────────────────────────

export function BillingTab({ tenantSlug, user }: { tenantSlug: string; user: ReturnType<typeof useAuth>['user'] }) {
  const tenantId = user?.tenant?.id ?? '';

  // Resolves the CURRENT tenant's use case(s) server-side (auth-api unions every
  // use_case a multi-vertical tenant has selected) — used to hide vertical tabs/plans
  // that don't apply to this tenant, e.g. a retail tenant seeing Hospital/Afya plans.
  const { data: useCaseConfig } = useUseCaseConfig();
  const visibleServiceTags = useMemo(() => {
    const applicable = useCaseConfig?.applicable_services;
    if (!applicable || applicable.length === 0) return ALL_SERVICE_TAGS;
    const allowed = new Set(applicable.map(toServiceTag));
    return ALL_SERVICE_TAGS.filter((tag) => !VERTICAL_SERVICE_TAGS.has(tag) || allowed.has(tag));
  }, [useCaseConfig]);

  const [activeService, setActiveService] = useState(ALL_SERVICE_TAGS[0]);
  // If the previously-active (or default) tab isn't actually visible for this tenant's
  // use case, fall back to the first tab that is — never leave a hidden tab selected.
  const effectiveActiveService = visibleServiceTags.includes(activeService) ? activeService : (visibleServiceTags[0] ?? activeService);

  const { data: serviceData, isLoading: serviceLoading } = useServiceSubscriptions(tenantId);

  // Only pass use_case through to the plans query when the tenant has exactly ONE
  // (the overwhelmingly common case) — MergeConfigs comma-joins several use cases for
  // a genuinely multi-vertical tenant, which wouldn't exact-match the plan column;
  // the tab-level filter above already scopes to relevant services either way.
  const singleUseCase = useCaseConfig?.use_case && !useCaseConfig.use_case.includes(',')
    ? useCaseConfig.use_case
    : undefined;

  const { data: allPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans-by-service', effectiveActiveService, singleUseCase],
    queryFn: () => subscriptionApi.getPlansByService(effectiveActiveService, singleUseCase),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allServiceCharges = [], isLoading: chargesLoading } = useQuery({
    queryKey: ['service-charge-plans'],
    queryFn: () => subscriptionApi.getServiceChargePlans(),
    staleTime: 10 * 60 * 1000,
  });

  const serviceMap = new Map<string, ServiceSubscriptionEntry>(
    (serviceData?.services ?? []).map((s) => [s.service_tag, s])
  );

  const current = serviceMap.get(effectiveActiveService);
  const isActiveService = current?.status === 'ACTIVE' || current?.status === 'TRIAL';
  const isExpiredService = current?.status === 'EXPIRED';
  const isCancelledService = current?.status === 'CANCELLED';
  const hasEverSubscribed = !!current?.status && current.status !== 'NONE';

  // Find the current plan's tier_order for upgrade/downgrade determination
  const currentPlanObj = allPlans.find((p) => p.plan_code === current?.plan_code);

  const monthlyPlans = allPlans.filter((p) => p.billing_cycle === 'MONTHLY');
  const annualPlans = allPlans.filter((p) => p.billing_cycle === 'ANNUAL');
  const oneTimePlans = allPlans.filter((p) => p.billing_cycle === 'ONE_TIME');
  const serviceCharges = allServiceCharges.filter((sc) =>
    sc.applicable_services?.includes(effectiveActiveService)
  );

  return (
    <div className="space-y-6">
      {/* Service tabs — only the ones applicable to this tenant's own use case(s) */}
      <div className="flex flex-wrap gap-2">
        {visibleServiceTags.map((tag) => {
          const entry = serviceMap.get(tag);
          const hasActive = entry?.status === 'ACTIVE' || entry?.status === 'TRIAL';
          const isExpired = entry?.status === 'EXPIRED';
          return (
            <button
              key={tag}
              onClick={() => setActiveService(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                effectiveActiveService === tag
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {hasActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {isExpired && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
              {SERVICE_TAG_LABELS[tag]}
            </button>
          );
        })}
      </div>

      {/* Current subscription status */}
      {serviceLoading ? (
        <div className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : isActiveService ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Active Plan</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{current?.plan_name ?? current?.plan_code}</p>
              {current?.current_period_end && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Renews {new Date(current.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                current?.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>{current?.status}</span>
              <a href={`${SUBSCRIPTIONS_BASE}/plans?service=${effectiveActiveService}&plan=${current?.plan_code}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="rounded-xl gap-1 h-8 text-xs">
                  Manage <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
          {serviceData?.subscription?.features && serviceData.subscription.features.length > 0 && current?.plan_code === serviceData.subscription.plan_code && (
            <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700/50">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">Included Features</p>
              <div className="flex flex-wrap gap-1.5">
                {serviceData.subscription.features.slice(0, 8).map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded-lg text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium capitalize">
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
                {serviceData.subscription.features.length > 8 && (
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                    +{serviceData.subscription.features.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : isExpiredService ? (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">Subscription Expired</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{current?.plan_name ?? current?.plan_code}</p>
              {current?.current_period_end && (
                <p className="text-xs text-red-500 mt-0.5">
                  Expired {new Date(current.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">EXPIRED</span>
              <a href={`${SUBSCRIPTIONS_BASE}/subscribe?plan=${current?.plan_code}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="rounded-xl gap-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
                  Renew Now <ArrowUpRight className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : isCancelledService ? (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">Subscription Cancelled</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{current?.plan_name ?? current?.plan_code}</p>
              {current?.current_period_end && (
                <p className="text-xs text-amber-500 mt-0.5">
                  Access until {new Date(current.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">CANCELLED</span>
              <a href={`${SUBSCRIPTIONS_BASE}/subscribe?plan=${current?.plan_code}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="rounded-xl gap-1 h-8 text-xs border-amber-400 text-amber-700">
                  Resubscribe <ArrowUpRight className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active subscription for <strong>{SERVICE_TAG_LABELS[effectiveActiveService]}</strong>. Choose a plan below.
          </p>
        </div>
      )}

      {/* Monthly Plans */}
      {(plansLoading || monthlyPlans.length > 0) && (
        <PlanSection
          title={`Monthly Plans — ${SERVICE_TAG_LABELS[effectiveActiveService]}`}
          plans={monthlyPlans}
          isLoading={plansLoading}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="/mo"
          serviceTag={effectiveActiveService}
          tenantSlug={tenantSlug}
        />
      )}

      {/* Annual Plans */}
      {(plansLoading || annualPlans.length > 0) && (
        <PlanSection
          title={`Annual Plans — ${SERVICE_TAG_LABELS[effectiveActiveService]}`}
          subtitle="Save up to 10% vs monthly billing"
          plans={annualPlans}
          isLoading={plansLoading}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="/yr"
          serviceTag={effectiveActiveService}
          tenantSlug={tenantSlug}
          monthlyPlans={monthlyPlans}
        />
      )}

      {/* One-Time Plans */}
      {oneTimePlans.length > 0 && (
        <PlanSection
          title={`One-Time Licence — ${SERVICE_TAG_LABELS[effectiveActiveService]}`}
          subtitle="Pay once, use forever. No recurring fees."
          plans={oneTimePlans}
          isLoading={false}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="one-time"
          serviceTag={effectiveActiveService}
          tenantSlug={tenantSlug}
        />
      )}

      {/* Service Charge Plans */}
      {!chargesLoading && serviceCharges.length > 0 && (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Service Charge Plans — {SERVICE_TAG_LABELS[effectiveActiveService]}
            </h3>
            <span className="text-xs text-slate-400">Commission-based, no monthly fee</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceCharges.map((sc) => (
              <ServiceChargePlanCard key={sc.id} plan={sc} />
            ))}
          </div>
        </div>
      )}

      {/* All sections empty */}
      {!plansLoading && monthlyPlans.length === 0 && annualPlans.length === 0 && oneTimePlans.length === 0 && serviceCharges.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-400">No plans available for {SERVICE_TAG_LABELS[effectiveActiveService]} yet.</p>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          For invoices, payment history, and upgrade options, visit the{' '}
          <a
            href={`${SUBSCRIPTIONS_BASE}/plans?service=${effectiveActiveService}`}
            target="_blank" rel="noopener noreferrer"
            className="text-primary underline font-medium"
          >
            billing portal <ExternalLink className="inline h-3 w-3 mb-0.5" />
          </a>.
        </p>
      </div>
    </div>
  );
}
