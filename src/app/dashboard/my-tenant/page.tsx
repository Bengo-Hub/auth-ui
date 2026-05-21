'use client';

import { BrandingTab } from '@/components/settings/BrandingTab';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useAuth } from '@/hooks/useAuth';
import { useTenantMembers, type MemberFilters, type TenantMember } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { subscriptionApi, type Plan, type ServiceSubscriptionEntry, type ServiceChargePlan } from '@/lib/subscription-api';
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
import { useState, useEffect, useCallback } from 'react';
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

// Front-end plans portal (subscriptions-ui), NOT the API
const SUBSCRIPTIONS_BASE = 'https://pricing.codevertexitsolutions.com';

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
  const { data: membersResult } = useTenantMembers(tenant.id, true);

  const stats = [
    { label: 'Organization', value: tenant.name, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Members', value: String(membersResult?.total || '—'), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
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

// Standard global roles as seeded by auth-api. Service-specific roles (e.g. inventory_admin,
// finance_admin) are JIT-provisioned by each service and not listed here.
const TEAM_ROLES = [
  'admin',                // Full tenant admin (all services)
  'manager',             // Store/operations manager
  'staff',               // General cross-service staff
  'member',              // Basic ordering/tenant member
  'viewer',              // Read-only access for auditors/observers
  'cashier',             // POS cashier / treasury cashier
  'waiter',              // POS hospitality waiter
  'kitchen',             // POS kitchen display
  'bar',                 // POS bar display
  'receptionist',        // POS hotel receptionist
  'rider',               // Logistics motorcycle delivery rider
  'driver',              // Logistics fleet/cargo driver
  'delivery_coordinator',// Ordering/logistics dispatch coordinator
  'technician',          // Field technician (ISP billing / IT services)
  'customer',            // B2C end-user / ordering customer / ISP subscriber
];

function TeamTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [pinTarget, setPinTarget] = useState<TenantMember | null>(null);
  const [pin, setPin] = useState('');
  const [pinService, setPinService] = useState('pos');
  const [isPinSaving, setIsPinSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const resetPage = useCallback(() => setPage(1), []);

  useEffect(() => { resetPage(); }, [debouncedSearch, roleFilter, statusFilter, resetPage]);

  const { data, isLoading, refetch } = useTenantMembers(tenantId, true, {
    page,
    limit: LIMIT,
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
  });

  const members = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;

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
          <div className="w-44 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</Label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              {TEAM_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
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
          className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-40">
          <option value="">All Roles</option>
          {TEAM_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-36">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Members list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Team Members</h2>
          <span className="text-sm text-slate-400 font-medium">{total} member{total !== 1 ? 's' : ''}</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : members.length === 0 ? (
          <div className="p-16 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No members found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.user_id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {(m.name ?? m.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{m.name ?? m.email}</p>
                    {m.name && m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{m.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {m.roles.slice(0, 2).map((r) => (
                    <span key={r} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize hidden sm:inline">
                      {r}
                    </span>
                  ))}
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

        <Pagination page={page} total={total} limit={LIMIT} hasMore={hasMore} onPageChange={setPage} />
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

  const { data: allPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans-by-service', activeService],
    queryFn: () => subscriptionApi.getPlansByService(activeService),
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

  const current = serviceMap.get(activeService);
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
    sc.applicable_services?.includes(activeService)
  );

  return (
    <div className="space-y-6">
      {/* Service tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_SERVICE_TAGS.map((tag) => {
          const entry = serviceMap.get(tag);
          const hasActive = entry?.status === 'ACTIVE' || entry?.status === 'TRIAL';
          const isExpired = entry?.status === 'EXPIRED';
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
              <a href={`${SUBSCRIPTIONS_BASE}/plans?service=${activeService}&plan=${current?.plan_code}`} target="_blank" rel="noopener noreferrer">
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
            No active subscription for <strong>{SERVICE_TAG_LABELS[activeService]}</strong>. Choose a plan below.
          </p>
        </div>
      )}

      {/* Monthly Plans */}
      {(plansLoading || monthlyPlans.length > 0) && (
        <PlanSection
          title={`Monthly Plans — ${SERVICE_TAG_LABELS[activeService]}`}
          plans={monthlyPlans}
          isLoading={plansLoading}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="/mo"
          serviceTag={activeService}
          tenantSlug={tenantSlug}
        />
      )}

      {/* Annual Plans */}
      {(plansLoading || annualPlans.length > 0) && (
        <PlanSection
          title={`Annual Plans — ${SERVICE_TAG_LABELS[activeService]}`}
          subtitle="Save up to 10% vs monthly billing"
          plans={annualPlans}
          isLoading={plansLoading}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="/yr"
          serviceTag={activeService}
          tenantSlug={tenantSlug}
          monthlyPlans={monthlyPlans}
        />
      )}

      {/* One-Time Plans */}
      {oneTimePlans.length > 0 && (
        <PlanSection
          title={`One-Time Licence — ${SERVICE_TAG_LABELS[activeService]}`}
          subtitle="Pay once, use forever. No recurring fees."
          plans={oneTimePlans}
          isLoading={false}
          currentEntry={current}
          currentPlanTierOrder={currentPlanObj?.tier_order}
          hasEverSubscribed={hasEverSubscribed}
          billingLabel="one-time"
          serviceTag={activeService}
          tenantSlug={tenantSlug}
        />
      )}

      {/* Service Charge Plans */}
      {!chargesLoading && serviceCharges.length > 0 && (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Service Charge Plans — {SERVICE_TAG_LABELS[activeService]}
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
          <p className="text-sm text-slate-400">No plans available for {SERVICE_TAG_LABELS[activeService]} yet.</p>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          For invoices, payment history, and upgrade options, visit the{' '}
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

function PlanSection({
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

function ServiceChargePlanCard({ plan }: { plan: ServiceChargePlan }) {
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
