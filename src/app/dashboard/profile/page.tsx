'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Bell, Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { PersonalInfoTab } from './personal-info-tab';
import { EmailAddressesTab } from './email-addresses-tab';
import { MobileNumbersTab } from './mobile-numbers-tab';
import { SecurityTab } from './security-tab';
import { NotificationsTab } from './notifications-tab';

const TAB_TRIGGER_CLS =
  'rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all';

const VALID_TABS = ['personal', 'email', 'mobile', 'security', 'notifications'];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const mustChange = !!user?.must_change_password;
  const requestedTab = searchParams.get('tab');
  const defaultTab = mustChange
    ? 'security'
    : requestedTab && VALID_TABS.includes(requestedTab)
      ? requestedTab
      : 'personal';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">My Account</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile, contact details, security settings, and notification preferences.</p>
      </header>

      {mustChange && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          For your security, please set a new password before continuing.
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="h-14 inline-flex w-auto flex-wrap bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-800 shadow-sm gap-1 mb-6">
          <TabsTrigger value="personal" className={TAB_TRIGGER_CLS}>
            <UserIcon className="h-4 w-4" /> Personal Info
          </TabsTrigger>
          <TabsTrigger value="email" className={TAB_TRIGGER_CLS}>
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="mobile" className={TAB_TRIGGER_CLS}>
            <Phone className="h-4 w-4" /> Mobile
          </TabsTrigger>
          <TabsTrigger value="security" className={TAB_TRIGGER_CLS}>
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className={TAB_TRIGGER_CLS}>
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal"><PersonalInfoTab /></TabsContent>
        <TabsContent value="email"><EmailAddressesTab /></TabsContent>
        <TabsContent value="mobile"><MobileNumbersTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
