'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasskeysSection } from '@/components/settings/PasskeysSection';
import { useRevokeSession, useSessions } from '@/hooks/use-dashboard-api';
import { useUpdateProfile, useUpdateNotificationSettings, useChangePassword } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle,
  Fingerprint,
  Globe,
  History,
  Key,
  Loader2,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Save,
  Shield,
  Smartphone,
  User as UserIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const TIMEZONES = [
  'UTC', 'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Cairo',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'sw', label: 'Swahili' },
  { value: 'ar', label: 'Arabic' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
];

function parseUserAgent(ua: string): { device: string; browser: string } {
  const isPhone = /mobile|iphone|android|phone/i.test(ua);
  let browser = 'Unknown Browser';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';

  let os = '';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';

  return { device: isPhone ? 'phone' : 'desktop', browser: `${browser}${os ? ' on ' + os : ''}` };
}

function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      {children}
    </motion.div>
  );
}

function ProfileTab() {
  const { user } = useAuthStore();
  const profile = (user as any)?.profile as Record<string, any> ?? {};
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile.name ?? user?.name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [timezone, setTimezone] = useState(profile.timezone ?? 'UTC');
  const [locale, setLocale] = useState(profile.locale ?? 'en');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const isSaving = updateProfile.isPending;
  const isSavingAvatar = updateProfile.isPending;
  const avatarSrc = profile.profile_picture_url as string | undefined;

  const handleSaveAvatar = async () => {
    if (!avatarUrl.trim()) return;
    try {
      await updateProfile.mutateAsync({ profile_picture_url: avatarUrl.trim() });
      setAvatarDialogOpen(false);
      setAvatarUrl('');
      setMessage({ type: 'success', text: 'Avatar updated!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update avatar' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile.mutateAsync({ name, phone, bio, country, timezone, locale });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  const inputCls = 'h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Avatar card */}
      <div className="lg:col-span-1">
        <FieldCard>
          <div className="flex flex-col items-center text-center">
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="h-14 w-14 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setAvatarDialogOpen(true)}
                className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name || 'No Name Set'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{user?.email}</p>
            {timezone !== 'UTC' && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                <Globe className="h-3 w-3" />{timezone}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {user?.roles?.map((role) => (
                <span key={role} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </FieldCard>
      </div>

      {/* Form */}
      <div className="lg:col-span-2">
        <FieldCard>
          <form onSubmit={handleSave} className="space-y-6">
            {message && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'}`}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+254 700 000 000" type="tel" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Country
                </Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} placeholder="e.g. Kenya" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Bio</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="A brief description about yourself…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-slate-400 text-right">{bio.length}/280</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Timezone
                </Label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Language / Locale</Label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {LOCALES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSaving} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20">
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
              </Button>
            </div>
          </form>
        </FieldCard>
      </div>

      {/* Avatar dialog */}
      {avatarDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Update Avatar</h3>
            <p className="text-sm text-slate-500">Paste a public image URL for your profile picture.</p>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setAvatarDialogOpen(false); setAvatarUrl(''); }} className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="button" onClick={handleSaveAvatar} disabled={isSavingAvatar || !avatarUrl.trim()} className="px-4 py-2 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {isSavingAvatar ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const { user } = useAuthStore();
  const profile = (user as any)?.profile as Record<string, any> ?? {};
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

function SecurityTab() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMfaEnabled = user?.mfa_enabled ?? false;
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { data: sessions = [], isLoading: sessionsLoading, refetch: fetchSessions } = useSessions();
  const revokeMutation = useRevokeSession();
  const changePassword = useChangePassword();
  const changingPassword = changePassword.isPending;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' }); return; }
    if (newPassword.length < 12) { toast({ title: 'Error', description: 'Password must be at least 12 characters.', variant: 'destructive' }); return; }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || err?.message || 'Failed to change password.', variant: 'destructive' });
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try { await revokeMutation.mutateAsync(sessionId); toast({ title: 'Session revoked' }); }
    catch { toast({ title: 'Error', description: 'Failed to revoke session.', variant: 'destructive' }); }
    finally { setRevokingId(null); }
  };

  const revokeAllSessions = async () => {
    setRevokingAll(true);
    try { await apiClient.post('/api/v1/auth/sessions/revoke-all'); toast({ title: 'All other sessions revoked' }); fetchSessions(); }
    catch { toast({ title: 'Error', description: 'Failed to revoke sessions.', variant: 'destructive' }); }
    finally { setRevokingAll(false); }
  };

  const inputCls = 'h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white';

  return (
    <div className="space-y-6">
      {/* Password */}
      <FieldCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><Key className="h-5 w-5 text-blue-500" /></div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Update your password to keep your account secure.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Current Password</Label>
            <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">New Password</Label>
            <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
          </div>
          <Button type="submit" disabled={changingPassword} className="h-11 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
            {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating…</> : 'Update Password'}
          </Button>
        </form>
      </FieldCard>

      {/* 2FA */}
      <FieldCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-purple-500" /></div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Button
            variant={isMfaEnabled ? 'outline' : 'default'}
            className={`h-11 px-6 rounded-xl font-bold ${!isMfaEnabled ? 'bg-primary hover:bg-primary/90' : 'dark:border-slate-700 dark:text-white'}`}
            onClick={() => { if (!isMfaEnabled) router.push('/dashboard/security/2fa-setup'); else toast({ title: '2FA Active', description: 'Two-factor authentication is currently enabled.' }); }}
          >
            {isMfaEnabled ? '2FA Enabled' : 'Enable 2FA'}
          </Button>
        </div>
        {isMfaEnabled ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
            <Key className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Two-factor authentication is active</p>
              <p className="text-emerald-700 dark:text-emerald-500 text-xs mt-0.5">Your account is protected with TOTP-based 2FA.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-400 text-sm">Your account is less secure</p>
              <p className="text-amber-700 dark:text-amber-500 text-xs mt-0.5">We highly recommend enabling 2FA to protect your account.</p>
            </div>
          </div>
        )}
      </FieldCard>

      {/* Passkeys */}
      <FieldCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><Fingerprint className="h-5 w-5 text-emerald-500" /></div>
        </div>
        <PasskeysSection />
      </FieldCard>

      {/* Sessions */}
      <FieldCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><History className="h-5 w-5 text-green-500" /></div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Sessions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage where you're signed in.</p>
            </div>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" className="rounded-xl border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold" disabled={revokingAll} onClick={revokeAllSessions}>
              {revokingAll && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Sign Out Others
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No active sessions found.</div>
          ) : (
            sessions.map((s) => {
              const ua = parseUserAgent(s.user_agent);
              const isPhone = ua.device === 'phone';
              return (
                <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${s.is_current ? 'bg-slate-50 dark:bg-slate-800/50 border-primary/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                      {isPhone ? <Smartphone className="h-4 w-4 text-slate-400" /> : <Monitor className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {ua.browser}
                        {s.is_current && <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black">Current</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.ip_address} &middot; {timeAgo(s.issued_at)}</p>
                    </div>
                  </div>
                  {!s.is_current && (
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold rounded-xl" disabled={revokingId === s.id} onClick={() => revokeSession(s.id)}>
                      {revokingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke'}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </FieldCard>
    </div>
  );
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const mustChange = !!user?.must_change_password;
  const defaultTab = mustChange || searchParams.get('tab') === 'security' ? 'security' : searchParams.get('tab') === 'notifications' ? 'notifications' : 'profile';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">My Account</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile, security settings, and notification preferences.</p>
      </header>

      {mustChange && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          For your security, please set a new password before continuing.
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="h-14 inline-flex w-auto bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-800 shadow-sm gap-1 mb-6">
          <TabsTrigger value="profile" className="rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
            <UserIcon className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-5 text-sm font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
