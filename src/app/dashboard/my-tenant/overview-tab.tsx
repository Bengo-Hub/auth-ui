'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTenantMembers, useServiceSubscriptions, deriveActivePlan } from '@/hooks/use-dashboard-api';
import { motion } from 'framer-motion';
import { Building2, CreditCard, Users } from 'lucide-react';

// ── Overview ─────────────────────────────────────────────────────────────────

export function TenantOverview({ tenant }: { tenant: { id: string; name: string; slug: string }; user: ReturnType<typeof useAuth>['user'] }) {
  const { data: membersResult } = useTenantMembers(tenant.id, true);
  // Plan shown here uses the SAME live source as the Billing tab (pricing API),
  // so Overview and Billing never contradict each other (#4).
  const { data: subData } = useServiceSubscriptions(tenant.id);
  const activePlan = deriveActivePlan(subData);
  const planLabel = activePlan?.name ?? 'No active plan';

  const stats = [
    { label: 'Organization', value: tenant.name, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Members', value: String(membersResult?.total || '—'), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Plan', value: planLabel, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Organization Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500 mb-0.5">Name</dt>
            <dd className="font-bold text-slate-900 dark:text-white">{tenant.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-0.5">Slug</dt>
            <dd className="font-mono text-slate-900 dark:text-white">{tenant.slug}</dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-0.5">Subscription</dt>
            <dd className="font-bold text-slate-900 dark:text-white">
              {activePlan ? `${activePlan.name} — ${activePlan.status}` : 'No active plan'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
