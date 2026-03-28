'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRevokeSession, useSessions } from '@/hooks/use-dashboard-api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  History,
  Key,
  Loader2,
  Monitor,
  Save,
  Shield,
  Smartphone,
  User as UserIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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

  return {
    device: isPhone ? 'phone' : 'desktop',
    browser: `${browser}${os ? ' on ' + os : ''}`,
  };
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

function ProfileTab() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await apiClient.patch('/api/v1/auth/me', { name, email });
      const updated = response.data?.user as Record<string, any> | undefined;
      if (updated && user) {
        setUser({ ...user, ...updated, roles: updated.roles ?? user.roles ?? [], permissions: updated.permissions ?? user.permissions ?? [], tenants: updated.tenants ?? user.tenants ?? [] });
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-1">
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              <UserIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            </div>
            <button className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'No Name Set'}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{user?.email}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {user?.roles.map((role) => (
              <span key={role} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            {message && (
              <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'}`}>
                {message.text}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="John Doe" />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="john@example.com" />
              </div>
            </div>
            <Button type="submit" disabled={isSaving} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20">
              {isSaving ? 'Saving...' : <span className="flex items-center gap-2"><Save className="h-5 w-5" /> Save Changes</span>}
            </Button>
          </form>
        </motion.div>
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
  const [changingPassword, setChangingPassword] = useState(false);
  const { data: sessions = [], isLoading: sessionsLoading, refetch: fetchSessions } = useSessions();
  const revokeMutation = useRevokeSession();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' }); return; }
    if (newPassword.length < 12) { toast({ title: 'Error', description: 'Password must be at least 12 characters.', variant: 'destructive' }); return; }
    setChangingPassword(true);
    try {
      await apiClient.post('/api/v1/auth/password-reset/confirm', { current_password: currentPassword, new_password: newPassword });
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to change password.', variant: 'destructive' });
    } finally { setChangingPassword(false); }
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

  return (
    <div className="space-y-8">
      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><Key className="h-6 w-6 text-blue-500" /></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
            <p className="text-slate-500 dark:text-slate-400">Update your password to keep your account secure.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Current Password</Label>
            <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</Label>
            <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <Button type="submit" disabled={changingPassword} className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
            {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</> : 'Update Password'}
          </Button>
        </form>
      </motion.div>

      {/* 2FA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><Smartphone className="h-6 w-6 text-purple-500" /></div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
              <p className="text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Button
            variant={isMfaEnabled ? 'outline' : 'default'}
            className={`h-14 px-8 rounded-2xl font-bold ${!isMfaEnabled ? 'bg-primary hover:bg-primary/90' : 'dark:border-slate-700 dark:text-white'}`}
            onClick={() => { if (!isMfaEnabled) router.push('/dashboard/security/2fa-setup'); else toast({ title: '2FA Active', description: 'Two-factor authentication is currently enabled.' }); }}
          >
            {isMfaEnabled ? '2FA Enabled' : 'Enable 2FA'}
          </Button>
        </div>
        {isMfaEnabled ? (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
            <Key className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-400">Two-factor authentication is active</p>
              <p className="text-emerald-700 dark:text-emerald-500 text-sm">Your account is protected with TOTP-based two-factor authentication.</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-400">Your account is less secure</p>
              <p className="text-amber-700 dark:text-amber-500 text-sm">We highly recommend enabling two-factor authentication to protect your account.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><History className="h-6 w-6 text-green-500" /></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Sessions</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage and sign out of your active sessions.</p>
          </div>
        </div>
        <div className="space-y-4">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">No active sessions found.</div>
          ) : (
            sessions.map((s) => {
              const ua = parseUserAgent(s.user_agent);
              const isPhone = ua.device === 'phone';
              return (
                <div key={s.id} className={`flex items-center justify-between p-6 rounded-2xl border ${s.is_current ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      {isPhone ? <Smartphone className="h-5 w-5 text-slate-400" /> : <Monitor className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {ua.browser}
                        {s.is_current && <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] uppercase font-black">Current</span>}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{s.ip_address} &middot; {timeAgo(s.issued_at)}</p>
                    </div>
                  </div>
                  {!s.is_current && (
                    <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold" disabled={revokingId === s.id} onClick={() => revokeSession(s.id)}>
                      {revokingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out'}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
        {sessions.length > 1 && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold" disabled={revokingAll} onClick={revokeAllSessions}>
              {revokingAll && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              Sign Out of All Other Sessions
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">My Account</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
          Manage your profile, security settings, and active sessions.
        </p>
      </header>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="h-16 inline-flex w-auto bg-slate-100 dark:bg-slate-800/50 p-2 rounded-[1.25rem] border border-slate-200/50 dark:border-slate-800 shadow-sm gap-2 mb-8">
          <TabsTrigger value="profile" className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
            <UserIcon className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
