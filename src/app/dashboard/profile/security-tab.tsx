'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasskeysSection } from '@/components/settings/PasskeysSection';
import { useRevokeSession, useSessions } from '@/hooks/use-dashboard-api';
import { useChangePassword } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import {
  AlertTriangle,
  Fingerprint,
  History,
  Key,
  Loader2,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FieldCard } from './field-card';

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

export function SecurityTab() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isPlatformOwner } = useAuth();
  const isMfaEnabled = user?.mfa_enabled ?? false;
  // The shared public demo tenant's credentials are used by every visitor —
  // letting any of them change the password or enroll 2FA would lock
  // everyone else out. Blocked server-side too (see demoSelfServiceBlocked
  // in auth-api); platform admins manage this account from /dashboard/platform/users instead.
  const demoRestricted = !!user?.is_demo && !isPlatformOwner;
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
        {demoRestricted ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Password changes are disabled for this demo account</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">This is a shared public demo login. A platform administrator can change it from the Users admin panel.</p>
            </div>
          </div>
        ) : (
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
        )}
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
          {!demoRestricted && (
            <Button
              variant={isMfaEnabled ? 'outline' : 'default'}
              className={`h-11 px-6 rounded-xl font-bold ${!isMfaEnabled ? 'bg-primary hover:bg-primary/90' : 'dark:border-slate-700 dark:text-white'}`}
              onClick={() => { if (!isMfaEnabled) router.push('/dashboard/security/2fa-setup'); else toast({ title: '2FA Active', description: 'Two-factor authentication is currently enabled.' }); }}
            >
              {isMfaEnabled ? '2FA Enabled' : 'Enable 2FA'}
            </Button>
          )}
        </div>
        {demoRestricted ? (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">2FA setup is disabled for this demo account</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">This is a shared public demo login — enrolling 2FA here would lock out every other visitor. A platform administrator can enforce 2FA on it from the Users admin panel.</p>
            </div>
          </div>
        ) : isMfaEnabled ? (
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
