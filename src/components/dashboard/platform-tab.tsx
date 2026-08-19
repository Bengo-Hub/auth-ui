'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, type Session } from '@/hooks/use-dashboard-api';
import { StatCard } from './stat-card';
import {
  ArrowRight,
  Building2,
  Clock,
  Globe,
  Monitor,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';

function parseDevice(userAgent: string): { label: string; icon: React.ComponentType<{ className?: string }> } {
  if (!userAgent) return { label: 'Unknown device', icon: Monitor };
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return { label: 'Mobile device', icon: Smartphone };
  }
  if (ua.includes('chrome')) return { label: 'Chrome browser', icon: Globe };
  if (ua.includes('firefox')) return { label: 'Firefox browser', icon: Globe };
  if (ua.includes('safari')) return { label: 'Safari browser', icon: Globe };
  return { label: 'Desktop browser', icon: Monitor };
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Platform analytics — account-level stats every signed-in user sees
 * (sessions, organizations, security posture), restyled to library-ui's
 * dense KPI-card pattern (Phase 15). Split out of dashboard/page.tsx to
 * keep it a thin tabbed shell. */
export function PlatformTab() {
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const activeCount = sessions.filter((s: Session) => s.status === 'active').length;
  const mfaEnabled = user?.mfa_enabled ?? false;

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Sessions"
          value={sessionsLoading ? '—' : activeCount || 0}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Organizations"
          value={user?.tenants?.length ?? (user?.tenant ? 1 : 0)}
          icon={Building2}
          color="purple"
        />
        <StatCard
          label="Security Status"
          value={mfaEnabled ? 'Secure' : 'Review'}
          icon={mfaEnabled ? ShieldCheck : ShieldAlert}
          color={mfaEnabled ? 'green' : 'amber'}
        />
        <StatCard
          label="Roles"
          value={user?.roles?.length ?? 0}
          icon={Shield}
          color="slate"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/profile"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="h-5 w-5 text-orange-500" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Update Profile</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Change your display name, email, and profile picture.</p>
          </Link>

          <Link
            href="/dashboard/profile?tab=security"
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Security Settings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mfaEnabled
                ? 'MFA is enabled. Manage sessions and review login history.'
                : 'Enable MFA to secure your account and manage active sessions.'}
            </p>
          </Link>
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-slate-900 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-lg font-black mb-4">Recent Sessions</h2>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <p className="text-slate-400 text-sm">No active sessions found.</p>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map((session) => {
                const { label: deviceLabel, icon: DeviceIcon } = parseDevice(session.user_agent);
                const isActive = session.status === 'active';
                return (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                      <DeviceIcon className={`h-4 w-4 ${isActive ? 'text-green-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {deviceLabel}
                        {session.is_current && (
                          <span className="ml-2 text-[10px] font-normal text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">current</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {session.ip_address} · {formatRelative(session.issued_at)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {session.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {recentSessions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/dashboard/profile?tab=security" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                Manage all sessions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
      </section>
    </div>
  );
}
