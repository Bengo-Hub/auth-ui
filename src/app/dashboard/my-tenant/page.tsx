'use client';

import { BrandingTab } from '@/components/settings/BrandingTab';
import { useAuth } from '@/hooks/useAuth';
import {
    AlertCircle,
    Building2,
    CreditCard,
    MessageCircle,
    Palette,
    Store,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { TenantOverview } from './overview-tab';
import { BranchesTab } from './branches-tab';
import { TeamTab } from './team-tab';
import { BillingTab } from './billing-tab';
import { SupportTab } from './support-tab';

type Tab = 'overview' | 'branding' | 'branches' | 'team' | 'billing' | 'support';

export default function MyTenantPage() {
  const { user, isTenantAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // The platform owner (codevertex) is itself a real business tenant. It manages
  // its OWN organization here exactly like any tenant; cross-tenant administration
  // of OTHER tenants lives separately under the platform "Organizations" section.
  const tenant = user?.tenant;

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">You are not part of any organization yet.</p>
      </div>
    );
  }

  // Organization administration is tenant-admin only. The nav already hides this for
  // other roles; guard the route itself so it cannot be reached by direct URL.
  if (!isTenantAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">
          Only an organization admin can manage {tenant.name}.
        </p>
        <p className="text-sm text-slate-400">
          You can still manage your own details under Account → Profile.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'branches', label: 'Branches', icon: Store },
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
      {activeTab === 'branches' && <BranchesTab tenantSlug={tenant.slug} />}
      {activeTab === 'team' && <TeamTab tenantId={tenant.id} tenantSlug={tenant.slug} />}
      {activeTab === 'billing' && <BillingTab tenantSlug={tenant.slug} user={user} />}
      {activeTab === 'support' && <SupportTab tenant={tenant} />}
    </div>
  );
}
