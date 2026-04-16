'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralTab } from '@/components/settings/GeneralTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { BrandingTab } from '@/components/settings/BrandingTab';
import { useAuth } from '@/hooks/useAuth';
import { Settings2, Plug2, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { isPlatformOwner } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="px-4">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
          Account & Org Settings
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Manage your personal preferences and organization branding.
        </p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <div className="px-4 mb-8 overflow-x-auto custom-scrollbar">
          <TabsList className="h-16 inline-flex w-auto bg-slate-100 dark:bg-slate-800/50 p-2 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-800 shadow-sm gap-2">
            <TabsTrigger
              value="general"
              className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-none data-[state=active]:text-primary transition-all"
            >
              <Settings2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-none data-[state=active]:text-primary transition-all"
            >
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            {isPlatformOwner && (
              <TabsTrigger
                value="integrations"
                className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-none data-[state=active]:text-primary transition-all"
              >
                <Plug2 className="h-4 w-4" />
                Integrations
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="px-4">
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>
          {isPlatformOwner && (
            <TabsContent value="integrations">
              <IntegrationsTab />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
