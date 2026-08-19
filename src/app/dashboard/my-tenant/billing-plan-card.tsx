'use client';

import { Button } from '@/components/ui/button';
import type { Plan, ServiceSubscriptionEntry, ServiceChargePlan } from '@/lib/subscription-api';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { SUBSCRIPTIONS_BASE } from './shared';

export function PlanSection({
  title,
  subtitle,
  plans,
  isLoading,
  currentEntry,
  currentPlanTierOrder,
  hasEverSubscribed,
  billingLabel,
  serviceTag,
  tenantSlug,
  monthlyPlans,
}: {
  title: string;
  subtitle?: string;
  plans: Plan[];
  isLoading: boolean;
  currentEntry?: ServiceSubscriptionEntry;
  currentPlanTierOrder?: number;
  hasEverSubscribed: boolean;
  billingLabel: string;
  serviceTag: string;
  tenantSlug: string;
  monthlyPlans?: Plan[];
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        {subtitle && <span className="text-xs text-emerald-600 font-medium">{subtitle}</span>}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const monthlyEquiv = monthlyPlans?.find((m) => m.tier_order === plan.tier_order);
            const monthlyCost = monthlyEquiv ? monthlyEquiv.base_price * 12 : null;
            const savings = monthlyCost && plan.base_price < monthlyCost
              ? Math.round(((monthlyCost - plan.base_price) / monthlyCost) * 100)
              : null;
            const previousPlan = idx > 0 ? plans[idx - 1] : undefined;

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                previousPlan={previousPlan}
                currentEntry={currentEntry}
                currentPlanTierOrder={currentPlanTierOrder}
                hasEverSubscribed={hasEverSubscribed}
                serviceTag={serviceTag}
                tenantSlug={tenantSlug}
                billingLabel={billingLabel}
                savingsPct={savings ?? undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  previousPlan,
  currentEntry,
  currentPlanTierOrder,
  hasEverSubscribed,
  serviceTag,
  tenantSlug,
  billingLabel,
  savingsPct,
}: {
  plan: Plan;
  previousPlan?: Plan;
  currentEntry?: ServiceSubscriptionEntry;
  currentPlanTierOrder?: number;
  hasEverSubscribed: boolean;
  serviceTag: string;
  tenantSlug: string;
  billingLabel?: string;
  savingsPct?: number;
}) {
  const isCurrentPlan = currentEntry?.plan_code === plan.plan_code;
  const isExpiredCurrent = isCurrentPlan && currentEntry?.status === 'EXPIRED';
  const isActiveSub = currentEntry?.status === 'ACTIVE' || currentEntry?.status === 'TRIAL';

  // Determine button label and URL
  let buttonLabel: string;
  let buttonHref: string;
  let buttonVariant: 'default' | 'outline' = 'default';

  if (isCurrentPlan) {
    if (isExpiredCurrent) {
      buttonLabel = 'Renew';
      buttonHref = `${SUBSCRIPTIONS_BASE}/subscribe?plan=${plan.plan_code}`;
    } else {
      buttonLabel = 'Manage';
      buttonHref = `${SUBSCRIPTIONS_BASE}/plans?service=${serviceTag}&plan=${plan.plan_code}`;
      buttonVariant = 'outline';
    }
  } else if (isActiveSub) {
    const thisOrder = plan.tier_order ?? 0;
    const curOrder = currentPlanTierOrder ?? 0;
    if (thisOrder > curOrder) {
      buttonLabel = 'Upgrade';
      buttonHref = `${SUBSCRIPTIONS_BASE}/upgrade?plan=${plan.plan_code}`;
    } else {
      buttonLabel = 'Downgrade';
      buttonHref = `${SUBSCRIPTIONS_BASE}/downgrade?plan=${plan.plan_code}`;
      buttonVariant = 'outline';
    }
  } else if (hasEverSubscribed) {
    buttonLabel = 'Subscribe';
    buttonHref = `${SUBSCRIPTIONS_BASE}/subscribe?plan=${plan.plan_code}`;
  } else {
    buttonLabel = 'Subscribe';
    buttonHref = `${SUBSCRIPTIONS_BASE}/subscribe?plan=${plan.plan_code}`;
  }

  // Differential features: show "All [prev plan] features" + only new features for higher tiers
  const allFeatures = (plan.features ?? []).filter((f) => f.is_included !== false);
  let displayFeatures: typeof allFeatures = [];
  let prevPlanName: string | undefined;

  if (previousPlan && allFeatures.length > 0) {
    const prevCodes = new Set(
      (previousPlan.features ?? []).filter((f) => f.is_included !== false).map((f) => f.code)
    );
    displayFeatures = allFeatures.filter((f) => !prevCodes.has(f.code)).slice(0, 4);
    prevPlanName = previousPlan.name;
  } else {
    displayFeatures = allFeatures.slice(0, 5);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all ${
        isCurrentPlan && !isExpiredCurrent
          ? 'bg-primary/5 border-primary/40 dark:bg-primary/10'
          : isExpiredCurrent
          ? 'bg-red-50/50 dark:bg-red-900/5 border-red-200 dark:border-red-800'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{plan.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isCurrentPlan && !isExpiredCurrent && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">Current</span>
          )}
          {isExpiredCurrent && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">Expired</span>
          )}
          {savingsPct && savingsPct > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Save {savingsPct}%</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          KES {plan.base_price.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 ml-1">{billingLabel ?? '/mo'}</span>
      </div>

      {/* Differential feature list */}
      {(prevPlanName || displayFeatures.length > 0) && (
        <ul className="space-y-1.5 flex-1">
          {prevPlanName && (
            <li className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <Check className="h-3 w-3 text-slate-400 shrink-0" />
              <span>All <span className="font-semibold">{prevPlanName}</span> features</span>
            </li>
          )}
          {prevPlanName && displayFeatures.length > 0 && (
            <li className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-0.5 pl-5">plus:</li>
          )}
          {displayFeatures.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="capitalize">{(f.name || f.code || String(f)).replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
      )}

      <a href={buttonHref} target="_blank" rel="noopener noreferrer">
        <Button
          size="sm"
          variant={buttonVariant}
          className={`w-full rounded-xl gap-1 ${isExpiredCurrent ? 'bg-red-600 hover:bg-red-700 text-white border-0' : ''}`}
        >
          {buttonLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </a>
    </motion.div>
  );
}

export function ServiceChargePlanCard({ plan }: { plan: ServiceChargePlan }) {
  const chargeLabel =
    plan.charge_type === 'PERCENTAGE'
      ? `${plan.charge_value}% per transaction`
      : plan.charge_type === 'FIXED_PER_TRANSACTION'
      ? `KES ${plan.charge_value} per transaction`
      : `Tiered`;

  return (
    <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{plan.description}</p>
        </div>
        {plan.is_default && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">Default</span>
        )}
      </div>
      <div>
        <span className="text-lg font-black text-slate-900 dark:text-white">{chargeLabel}</span>
        {(plan.min_charge || plan.max_charge) && (
          <p className="text-xs text-slate-400 mt-0.5">
            {plan.min_charge ? `Min KES ${plan.min_charge}` : ''}
            {plan.min_charge && plan.max_charge ? ' · ' : ''}
            {plan.max_charge ? `Cap KES ${plan.max_charge}` : ''}
          </p>
        )}
      </div>
      <p className="text-xs text-slate-400">No monthly subscription fee. Platform commission applied per transaction.</p>
    </div>
  );
}
