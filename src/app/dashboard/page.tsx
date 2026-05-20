'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSessions, type Session } from '@/hooks/use-dashboard-api';
import { motion } from 'framer-motion';
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
    User
} from 'lucide-react';
import Link from 'next/link';
import { Greeting } from '@/components/dashboard/Greeting';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const activeCount = sessions.filter((s: Session) => s.status === 'active').length;
  const mfaEnabled = user?.mfa_enabled ?? false;

  const stats = [
    {
      label: 'Active Sessions',
      value: sessionsLoading ? '—' : String(activeCount || 0),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Organizations',
      value: user?.tenants?.length ?? (user?.tenant ? 1 : 0),
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Security Status',
      value: mfaEnabled ? 'Secure' : 'Review',
      icon: mfaEnabled ? ShieldCheck : ShieldAlert,
      color: mfaEnabled ? 'text-green-500' : 'text-amber-500',
      bg: mfaEnabled ? 'bg-green-50' : 'bg-amber-50',
    },
  ];

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-12">
      <header>
        <Greeting userName={user?.name || user?.email?.split('@')[0]} />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/profile"
            className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-orange-500" />
              </div>
              <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 font-light">Change your display name, email, and profile picture.</p>
          </Link>

          <Link
            href="/dashboard/profile?tab=security"
            className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-blue-500" />
              </div>
              <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Security Settings</h3>
            <p className="text-slate-600 dark:text-slate-400 font-light">
              {mfaEnabled
                ? 'MFA is enabled. Manage sessions and review login history.'
                : 'Enable MFA to secure your account and manage active sessions.'}
            </p>
          </Link>
        </div>
      </section>

      {/* Recent Activity — live from sessions API */}
      <section className="p-8 rounded-[2rem] bg-slate-900 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-6">Recent Sessions</h2>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <p className="text-slate-400">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const { label: deviceLabel, icon: DeviceIcon } = parseDevice(session.user_agent);
                const isActive = session.status === 'active';
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                      <DeviceIcon className={`h-5 w-5 ${isActive ? 'text-green-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">
                        {deviceLabel}
                        {session.is_current && (
                          <span className="ml-2 text-xs font-normal text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">current</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-400 truncate">
                        {session.ip_address} · {formatRelative(session.issued_at)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {recentSessions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href="/dashboard/profile?tab=security"
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
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
