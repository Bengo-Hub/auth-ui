'use client';

import { BrandingTab } from '@/components/settings/BrandingTab';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTenantMembers } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Building2,
    CreditCard,
    ExternalLink,
    Loader2,
    MessageCircle,
    Palette,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function TeamTab({ tenantId }: { tenantId: string }) {
  const { data: members = [], isLoading, refetch } = useTenantMembers(tenantId, true);
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

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
              <option value="admin">Admin</option>
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

      {/* Members list */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Team Members</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : members.length === 0 ? (
          <div className="p-16 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No members yet. Invite someone above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m: { user_id: string; email?: string; name?: string; roles?: string[] }) => (
              <div key={m.user_id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                    {(m.name ?? m.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{m.name ?? m.email}</p>
                    {m.name && m.email && <p className="text-xs text-slate-400">{m.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {m.roles?.[0] ?? 'member'}
                  </span>
                  <Button variant="ghost" size="icon"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                    onClick={() => handleRemove(m.user_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Billing ───────────────────────────────────────────────────────────────────

function BillingTab({ tenantSlug, user }: { tenantSlug: string; user: ReturnType<typeof useAuth>['user'] }) {
  const plan = user?.subscription_plan ?? 'Free';
  const status = user?.subscription_status ?? 'active';
  const isActive = status === 'active';

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Current Plan</h2>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white capitalize">{plan}</p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                       : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>{status}</span>
          </div>
          <a
            href={`https://pricing.codevertexitsolutions.com/${tenantSlug}/plans`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
              Upgrade Plan <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          For detailed usage, invoices, and payment methods, visit the{' '}
          <a href={`https://pricing.codevertexitsolutions.com/${tenantSlug}`} target="_blank" rel="noopener noreferrer"
            className="underline font-bold">billing portal</a>.
        </p>
      </div>
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
