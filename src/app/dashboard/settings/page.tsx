'use client';

import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { useAuth } from '@/hooks/useAuth';
import { Plug2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  const { isPlatformOwner } = useAuth();

  if (!isPlatformOwner) {
    redirect('/dashboard/profile');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="px-4">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
          Platform Settings
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Manage platform-level integrations and OAuth configurations.
        </p>
      </header>

      <div className="px-4 flex items-center gap-2 mb-2">
        <Plug2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Integrations</h2>
      </div>

      <div className="px-4">
        <IntegrationsTab />
      </div>
    </div>
  );
}
