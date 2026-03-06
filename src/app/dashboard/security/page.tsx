'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRevokeSession, useSessions, type Session } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    History,
    Key,
    Loader2,
    Monitor,
    Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const { data: sessions = [], isLoading: sessionsLoading, refetch: fetchSessions } = useSessions();
  const revokeMutation = useRevokeSession();

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await revokeMutation.mutateAsync(sessionId);
      toast({ title: 'Session revoked', description: 'The session has been signed out.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke session.', variant: 'destructive' });
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      await apiClient.post('/api/v1/auth/sessions/revoke-all');
      toast({ title: 'Sessions revoked', description: 'All other sessions have been signed out.' });
      fetchSessions();
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke sessions.', variant: 'destructive' });
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Security Settings</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
          Protect your account with multi-factor authentication and monitor active sessions.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
              <p className="text-slate-500 dark:text-slate-400">Update your password to keep your account secure.</p>
            </div>
          </div>

          <form className="space-y-6 max-w-md">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Current Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
              Update Password
            </Button>
          </form>
        </motion.div>

        {/* MFA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <Button
              variant={isMfaEnabled ? "outline" : "default"}
              className={`h-14 px-8 rounded-2xl font-bold ${!isMfaEnabled ? 'bg-primary hover:bg-primary/90' : 'dark:border-slate-700 dark:text-white'}`}
              onClick={() => {
                if (!isMfaEnabled) {
                  router.push('/dashboard/security/2fa-setup');
                } else {
                  setIsMfaEnabled(false);
                }
              }}
            >
              {isMfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>

          {!isMfaEnabled && (
            <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-400">Your account is less secure</p>
                <p className="text-amber-700 dark:text-amber-500 text-sm">We highly recommend enabling two-factor authentication to protect your account from unauthorized access.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <History className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Sessions</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage and sign out of your active sessions on other devices.</p>
            </div>
          </div>

          <div className="space-y-4">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No active sessions found.
              </div>
            ) : (
              sessions.map((s) => {
                const ua = parseUserAgent(s.user_agent);
                const isPhone = ua.device === 'phone';
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-6 rounded-2xl border ${
                      s.is_current
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                        {isPhone ? (
                          <Smartphone className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Monitor className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ua.browser}
                          {s.is_current && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] uppercase font-black">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {s.ip_address} &middot; {timeAgo(s.issued_at)}
                        </p>
                      </div>
                    </div>
                    {!s.is_current && (
                      <Button
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold"
                        disabled={revokingId === s.id}
                        onClick={() => revokeSession(s.id)}
                      >
                        {revokingId === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Sign Out'
                        )}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {sessions.length > 1 && (
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold"
                disabled={revokingAll}
                onClick={revokeAllSessions}
              >
                {revokingAll ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Sign Out of All Other Sessions
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
