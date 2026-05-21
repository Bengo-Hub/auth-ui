'use client';

import { BrandingTab } from '@/components/settings/BrandingTab';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTenantMembers } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { subscriptionApi, type Plan, type ServiceSubscriptionEntry } from '@/lib/subscription-api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowUpRight,
    Building2,
    Check,
    CreditCard,
    ExternalLink,
    KeyRound,
    Loader2,
    MessageCircle,
    Palette,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SERVICE_TAG_LABELS: Record<string, string> = {
  ordering: 'Ordering',
  pos: 'Point of Sale',
  logistics: 'Logistics',
  inventory: 'Inventory',
  erp: 'ERP / Accounting',
  treasury: 'Treasury & Finance',
  truload: 'Axle Load (TruLoad)',
  marketflow: 'MarketFlow CRM',
  isp_billing: 'ISP Billing',
  projects: 'Projects & Invoicing',
};

const ALL_SERVICE_TAGS = Object.keys(SERVICE_TAG_LABELS);

const SUBSCRIPTIONS_BASE = 'https://pricingapi.codevertexitsolutions.com';

type Tab = 'overview' | 'branding' | 'team' | 'billing' | 'support';

export default function MyTenantPage() {
  const { user, isPlatformOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Platform owners have their own management pages; redirect them
  if (isPlatformOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <Building2 className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">
          Platform admins manage organizations from the{' '}
          <a href="/dashboard/tenants" className="text-primary underline">Organizations</a> section.
        </p>
      </div>
    );
  }

  const tenant = user?.tenant;

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">You are not part of any organization yet.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">My Organization</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">{tenant.name}</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <TenantOverview tenant={tenant} user={user} />}
      {activeTab === 'branding' && <BrandingTab />}
      {activeTab === 'team' && <TeamTab tenantId={tenant.id} />}
      {activeTab === 'billing' && <BillingTab tenantSlug={tenant.slug} user={user} />}
      {activeTab === 'support' && <SupportTab tenant={tenant} />}
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────

function TenantOverview({ tenant, user }: { tenant: { id: string; name: string; slug: string }; user: ReturnType<typeof useAuth>['user'] }) {
  const { data: members = [] } = useTenantMembers(tenant.id, true);

  const stats = [
    { label: 'Organization', value: tenant.name, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Members', value: String(members.length || '—'), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Plan', value: user?.subscription_plan ?? 'Free', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
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
            <dd className="font-bold text-slate-900 dark:text-white capitalize">{user?.subscription_plan ?? 'Free'} — {user?.subscription_status ?? 'active'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────

type Member = { user_id: string; email?: string; name?: string; roles?: string[]; outlet?: string; is_active?: boolean };

function TeamTab({ tenantId }: { tenantId: string }) {
  const { data: members = [], isLoading, refetch } = useTenantMembers(tenantId, true);
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pinTarget, setPinTarget] = useState<Member | null>(null);
  const [pin, setPin] = useState('');
  const [pinService, setPinService] = useState('pos');
  const [isPinSaving, setIsPinSaving] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await apiClient.post(`/api/v1/admin/tenants/${tenantId}/members`, { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      refetch();
      toast({ title: 'Member invited' });
    } catch {
      toast({ title: 'Failed to invite member', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/tenants/${tenantId}/members/${userId}`);
      refetch();
      toast({ title: 'Member removed' });
    } catch {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTarget || pin.length !== 4) return;
    setIsPinSaving(true);
    try {
      await apiClient.post(`/api/v1/admin/tenants/${tenantId}/members/${pinTarget.user_id}/service-pin`, {
        service: pinService,
        pin,
      });
      toast({ title: `PIN set for ${pinTarget.name ?? pinTarget.email}` });
      setPinTarget(null);
      setPin('');
    } catch {
      toast({ title: 'Failed to set PIN', variant: 'destructive' });
    } finally {
      setIsPinSaving(false);
    }
  };

  const allRoles = Array.from(new Set((members as Member[]).flatMap((m) => m.roles ?? ['member'])));

  const filtered = (members as Member[]).filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (m.name?.toLowerCase().includes(q) ?? false) || (m.email?.toLowerCase().includes(q) ?? false);
    const matchesRole = !roleFilter || (m.roles ?? ['member']).includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Invite form */}
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite Member</h2>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</Label>
            <Input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="w-40 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</Label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isInviting}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
            </Button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="h-11 pl-9 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-44">
          <option value="">All Roles</option>
          {allRoles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
      </div>

      {/* Members list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Team Members</h2>
          <span className="text-sm text-slate-400 font-medium">{filtered.length} of {(members as Member[]).length}</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No members found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <div key={m.user_id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                    {(m.name ?? m.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{m.name ?? m.email}</p>
                    {m.name && m.email && <p className="text-xs text-slate-400">{m.email}</p>}
                    {m.outlet && <p className="text-xs text-slate-400 mt-0.5">{m.outlet}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {m.roles?.[0] ?? 'member'}
                  </span>
                  <Button variant="outline" size="sm"
                    className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => { setPinTarget(m); setPin(''); }}>
                    <KeyRound className="h-3 w-3" /> Set PIN
                  </Button>
                  <Button variant="ghost" size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                    onClick={() => handleRemove(m.user_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Set PIN Modal */}
      {pinTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set Service PIN</h3>
                <p className="text-xs text-slate-400 mt-0.5">{pinTarget.name ?? pinTarget.email}</p>
              </div>
            </div>
            <form onSubmit={handleSetPin} className="space-y-5">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Service</Label>
                <select value={pinService} onChange={(e) => setPinService(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                  <option value="pos">POS</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">4-Digit PIN</Label>
                <Input required type="password" inputMode="numeric" maxLength={4} pattern="[0-9]{4}"
                  value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="h-12 rounded-2xl text-center text-2xl tracking-widest border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
                <p className="text-xs text-slate-400">Staff will use this PIN to log in on the terminal.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl"
                  onClick={() => { setPinTarget(null); setPin(''); }}>Cancel</Button>
                <Button type="submit" disabled={isPinSaving || pin.length !== 4}
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
                  {isPinSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save PIN'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Billing ───────────────────────────────────────────────────────────────────

function BillingTab({ tenantSlug, user }: { tenantSlug: string; user: ReturnType<typeof useAuth>['user'] }) {
  const tenantId = user?.tenant?.id ?? '';
  const [activeService, setActiveService] = useState(ALL_SERVICE_TAGS[0]);

  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['service-subscriptions', tenantId],
    queryFn: () => subscriptionApi.getServiceSubscriptions(tenantId),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans-by-service', activeService],
    queryFn: () => subscriptionApi.getPlansByService(activeService),
    staleTime: 5 * 60 * 1000,
  });

  const serviceMap = new Map<string, ServiceSubscriptionEntry>(
    (serviceData?.services ?? []).map((s) => [s.service_tag, s])
  );

  const current = serviceMap.get(activeService);
  const isActiveService = current?.status === 'ACTIVE' || current?.status === 'TRIAL';

  return (
    <div className="space-y-6">
      {/* Service tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_SERVICE_TAGS.map((tag) => {
          const entry = serviceMap.get(tag);
          const hasActive = entry?.status === 'ACTIVE' || entry?.status === 'TRIAL';
          return (
            <button
              key={tag}
              onClick={() => setActiveService(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                activeService === tag
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {hasActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {SERVICE_TAG_LABELS[tag]}
            </button>
          );
        })}
      </div>

      {/* Current subscription for this service */}
      {serviceLoading ? (
        <div className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : isActiveService ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Active Plan</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{current?.plan_name ?? current?.plan_code}</p>
            {current?.current_period_end && (
              <p className="text-xs text-slate-500 mt-0.5">
                Renews {new Date(current.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            {current?.status}
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active subscription for <strong>{SERVICE_TAG_LABELS[activeService]}</strong>. Choose a plan below.
          </p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
          Available Plans — {SERVICE_TAG_LABELS[activeService]}
        </h3>

        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-400">No plans available for this service yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter((p) => p.billing_cycle === 'MONTHLY').map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={current?.plan_code === plan.plan_code}
                serviceTag={activeService}
                tenantSlug={tenantSlug}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          For invoices, payment history, and annual plan options, visit the{' '}
          <a
            href={`${SUBSCRIPTIONS_BASE}/plans?service=${activeService}`}
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

function PlanCard({
  plan,
  isCurrentPlan,
  serviceTag,
  tenantSlug,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  serviceTag: string;
  tenantSlug: string;
}) {
  const features = (plan.features ?? []).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all ${
        isCurrentPlan
          ? 'bg-primary/5 border-primary/40 dark:bg-primary/10'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{plan.description}</p>
        </div>
        {isCurrentPlan && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">Current</span>
        )}
      </div>

      <div>
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          KES {plan.base_price.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 ml-1">/mo</span>
      </div>

      {features.length > 0 && (
        <ul className="space-y-1 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="capitalize">{f.name || f.code || String(f)}</span>
            </li>
          ))}
        </ul>
      )}

      <a
        href={`${SUBSCRIPTIONS_BASE}/plans?service=${serviceTag}&plan=${plan.plan_code}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="sm"
          variant={isCurrentPlan ? 'outline' : 'default'}
          className="w-full rounded-xl gap-1"
        >
          {isCurrentPlan ? 'Manage' : 'Subscribe'}
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </a>
    </motion.div>
  );
}

// ── Support ───────────────────────────────────────────────────────────────────

function SupportTab({ tenant }: { tenant: { slug: string; name: string } }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vera AI Support</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The Vera AI widget is available on this page. Click the chat icon to get instant answers
          or escalate to the {tenant.name} helpdesk team.
        </p>
        <p className="text-xs text-slate-400">
          Powered by Vera AI · Routed to <span className="font-mono">{tenant.slug}</span> helpdesk
        </p>
      </div>
    </div>
  );
}
