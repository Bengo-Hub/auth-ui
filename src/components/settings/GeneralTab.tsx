'use client';

import { useTenant } from '@/components/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Globe, Mail, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function GeneralTab() {
  const { tenant } = useTenant();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Basic Preferences
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Language</p>
                <p className="text-xs text-slate-500">Display language for your dashboard.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg font-bold">English (US)</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Email Alerts</p>
                <p className="text-xs text-slate-500">Security and billing updates.</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Push Notifications</p>
                <p className="text-xs text-slate-500">Real-time alerts on mobile.</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Regional Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Country</Label>
            <Input defaultValue="Kenya" className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Timezone</Label>
            <Input defaultValue="Africa/Nairobi (GMT+3)" className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
