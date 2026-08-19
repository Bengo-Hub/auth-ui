'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUpdateNotificationSettings } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCircle, Loader2, Mail, MessageSquare, Save } from 'lucide-react';
import { FieldCard } from './field-card';

export function NotificationsTab() {
  const { user } = useAuthStore();
  const profile = ((user as any)?.profile as Record<string, any>) ?? {};
  const notifSettings = (profile.notification_settings as Record<string, boolean>) ?? {};
  const updateNotifications = useUpdateNotificationSettings();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    email_marketing: notifSettings.email_marketing ?? true,
    email_security: notifSettings.email_security ?? true,
    email_account: notifSettings.email_account ?? true,
    sms_alerts: notifSettings.sms_alerts ?? false,
    push_notifications: notifSettings.push_notifications ?? false,
    whatsapp_updates: notifSettings.whatsapp_updates ?? false,
  });
  const [saved, setSaved] = useState(false);
  const isSaving = updateNotifications.isPending;

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    setSaved(false);
    try {
      await updateNotifications.mutateAsync(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    }
  };

  const groups = [
    {
      icon: Mail,
      label: 'Email Notifications',
      color: 'blue',
      items: [
        { key: 'email_security' as const, label: 'Security Alerts', desc: 'Login attempts, password changes, new device sign-ins' },
        { key: 'email_account' as const, label: 'Account Updates', desc: 'Profile changes, membership updates, role assignments' },
        { key: 'email_marketing' as const, label: 'Product & Marketing', desc: 'New features, promotions, and platform announcements' },
      ],
    },
    {
      icon: MessageSquare,
      label: 'SMS Notifications',
      color: 'emerald',
      items: [
        { key: 'sms_alerts' as const, label: 'SMS Alerts', desc: 'Critical security and account notifications via SMS' },
      ],
    },
    {
      icon: Bell,
      label: 'Push & Messaging',
      color: 'purple',
      items: [
        { key: 'push_notifications' as const, label: 'Browser / App Push', desc: 'Real-time push notifications in your browser or mobile app' },
        { key: 'whatsapp_updates' as const, label: 'WhatsApp Updates', desc: 'Receive important updates via WhatsApp' },
      ],
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <FieldCard key={group.label}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[group.color]}`}>
              <group.icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{group.label}</h2>
          </div>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings[item.key]}
                  onClick={() => toggle(item.key)}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${settings[item.key] ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${settings[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </FieldCard>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20">
          {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save Preferences</>}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-semibold">
            <CheckCircle className="h-4 w-4" /> Saved!
          </span>
        )}
      </div>
    </div>
  );
}
