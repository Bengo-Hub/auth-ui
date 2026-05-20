'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { Globe, Loader2, Mail, Palette, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Preferences {
  language?: string;
  country?: string;
  timezone?: string;
  email_alerts?: boolean;
  push_notifications?: boolean;
}

export function GeneralTab() {
  const { user, refetch } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState<Preferences>({
    language: 'English (US)',
    country: '',
    timezone: '',
    email_alerts: true,
    push_notifications: false,
  });

  // Hydrate from user profile on mount
  useEffect(() => {
    if (!user) return;
    const stored = (user.profile?.preferences ?? {}) as Preferences;
    setPrefs({
      language: stored.language ?? 'English (US)',
      country: stored.country ?? '',
      timezone: stored.timezone ?? '',
      email_alerts: stored.email_alerts ?? true,
      push_notifications: stored.push_notifications ?? false,
    });
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/api/v1/auth/me', { preferences: prefs });
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
    }
  };

  const setToggle = (key: keyof Preferences, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const setField = (key: keyof Preferences, value: string) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

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
            <Button variant="outline" size="sm" className="rounded-lg font-bold">
              {prefs.language}
            </Button>
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
            <Switch
              checked={prefs.email_alerts}
              onCheckedChange={(v) => setToggle('email_alerts', v)}
            />
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
            <Switch
              checked={prefs.push_notifications}
              onCheckedChange={(v) => setToggle('push_notifications', v)}
            />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Regional Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Country</Label>
            <Input
              value={prefs.country}
              onChange={(e) => setField('country', e.target.value)}
              placeholder="e.g. Kenya"
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Timezone</Label>
            <Input
              value={prefs.timezone}
              onChange={(e) => setField('timezone', e.target.value)}
              placeholder="e.g. Africa/Nairobi"
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 justify-end">
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
