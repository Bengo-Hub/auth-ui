'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useServiceSubscriptions } from '@/hooks/use-dashboard-api';
import { LayoutDashboard, Mail } from 'lucide-react';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { EmailHostingTab } from '@/components/dashboard/email-hosting-tab';

const EMAIL_HOSTING_SERVICE_TAG = 'email-hosting';

function greetingWord(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const TAB_TRIGGER_CLS =
  'rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all';

export default function DashboardPage() {
  const { user, isPlatformOwner } = useAuth();
  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  // REAL GAP, caught before shipping: the Email Hosting tab was showing live
  // mailbox/storage stats and a direct link to mail-ui's admin console to
  // every signed-in user, regardless of whether their tenant actually has an
  // active email-hosting subscription. Platform owners operate the whole
  // platform and aren't tenant-subscription-gated; every other user only
  // sees the tab if their own tenant's subscription includes it.
  const { data: subscriptions } = useServiceSubscriptions(user?.tenant?.id);
  const hasEmailHosting = (subscriptions?.services ?? []).some(
    (s) => s.service_tag === EMAIL_HOSTING_SERVICE_TAG && (s.status === 'ACTIVE' || s.status === 'TRIAL'),
  );
  const canSeeEmailHosting = isPlatformOwner || hasEmailHosting;

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{greetingWord()}, {displayName} — here's what's happening across your account.</p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-12 inline-flex w-auto bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm gap-1 mb-6">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLS}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          {canSeeEmailHosting && (
            <TabsTrigger value="email-hosting" className={TAB_TRIGGER_CLS}>
              <Mail className="h-4 w-4" /> Email Hosting
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        {canSeeEmailHosting && (
          <TabsContent value="email-hosting"><EmailHostingTab isPlatformOwner={isPlatformOwner} /></TabsContent>
        )}
      </Tabs>
    </div>
  );
}
