'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Mail } from 'lucide-react';
import { PlatformTab } from '@/components/dashboard/platform-tab';
import { EmailHostingTab } from '@/components/dashboard/email-hosting-tab';

function greetingWord(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const TAB_TRIGGER_CLS =
  'rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

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

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="h-12 inline-flex w-auto bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm gap-1 mb-6">
          <TabsTrigger value="platform" className={TAB_TRIGGER_CLS}>
            <LayoutDashboard className="h-4 w-4" /> Platform
          </TabsTrigger>
          <TabsTrigger value="email-hosting" className={TAB_TRIGGER_CLS}>
            <Mail className="h-4 w-4" /> Email Hosting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform"><PlatformTab /></TabsContent>
        <TabsContent value="email-hosting"><EmailHostingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
