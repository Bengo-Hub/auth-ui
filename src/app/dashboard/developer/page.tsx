'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  ExternalLink,
  Globe,
  Key,
  Package,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

/** Developer Portal Overview (Phase 11) — replaces the old tabbed page.
 * Apps/API Keys/OAuth Clients each moved to their own real route; this is
 * now a real landing page with live counts instead of a static tab switcher. */
export default function DeveloperPortalOverview() {
  const { isPlatformOwner } = useAuth();
  const [appCount, setAppCount] = useState<number | null>(null);
  const [keyCount, setKeyCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const requests: Promise<{ data: unknown[] }>[] = [apiClient.get<unknown[]>('/api/v1/admin/apps').catch(() => ({ data: [] }))];
    // API Keys is a platform-owner-only surface (deprecated in favor of Apps) — skip the call
    // entirely for a tenant developer rather than showing a stat card backed by a 403.
    if (isPlatformOwner) requests.push(apiClient.get<unknown[]>('/api/v1/admin/api-keys').catch(() => ({ data: [] })));
    Promise.all(requests).then(([apps, keys]) => {
      if (cancelled) return;
      const appList = Array.isArray(apps.data) ? apps.data : [];
      setAppCount(isPlatformOwner ? appList.length : appList.filter((a: any) => a.app_type === 'tenant').length);
      if (keys) setKeyCount(Array.isArray(keys.data) ? keys.data.length : 0);
    });
    return () => { cancelled = true; };
  }, [isPlatformOwner]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Developer Portal</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your apps{isPlatformOwner ? ', API keys, and OAuth clients' : ''}.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Apps" value={appCount ?? '—'} icon={Cpu} color="purple" />
        {isPlatformOwner && <StatCard label="API Keys" value={keyCount ?? '—'} icon={Key} color="blue" />}
        {isPlatformOwner && <StatCard label="OAuth Clients" value="—" icon={Globe} color="green" helper="See OAuth Clients" />}
      </div>

      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard href="/dashboard/developer/apps" icon={Cpu} color="purple" title="Apps" desc="Service-to-service app tokens for integrations." />
          {isPlatformOwner && (
            <NavCard href="/dashboard/developer/api-keys" icon={Key} color="blue" title="API Keys" desc="Generate keys for service-to-service authentication." />
          )}
          {isPlatformOwner && (
            <NavCard href="/dashboard/developer/oauth-clients" icon={Globe} color="green" title="OAuth Clients" desc="Register and manage OAuth2 clients." />
          )}
          <NavCard href="/docs" icon={Code2} color="slate" title="API Docs" desc="Endpoints, authentication, and code examples." />
        </div>
      </section>

      <ResourcesSection />
    </div>
  );
}

const NAV_COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-500',
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-500',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

function NavCard({ href, icon: Icon, color, title, desc }: { href: string; icon: React.ComponentType<{ className?: string }>; color: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${NAV_COLOR_MAP[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </Link>
  );
}

function ResourcesSection() {
  const links = [
    { href: '/docs', icon: Code2, color: 'sky', title: 'API Documentation', desc: 'Complete API reference with endpoints, authentication, and code examples.' },
    { href: 'https://github.com/Bengo-Hub/auth-api', icon: BookOpen, color: 'violet', title: 'Auth API', desc: 'Backend authentication service source code and implementation details.', external: true },
    { href: 'https://github.com/Bengo-Hub/shared-auth-client', icon: Package, color: 'amber', title: 'Go SDK', desc: 'Shared Auth Client for Go services. JWT validation, middleware, and JWKS support.', external: true },
    { href: 'https://github.com/Bengo-Hub/bengobox/blob/main/docs/RBAC_IMPLEMENTATION_GUIDE.md', icon: ShieldAlert, color: 'rose', title: 'RBAC Guide', desc: 'Role-based access control patterns and permission enforcement implementation.', external: true },
    { href: 'https://sso.codevertexafrica.com/v1/docs/', icon: Terminal, color: 'emerald', title: 'Swagger UI', desc: 'Interactive API explorer with try-it-out functionality for all endpoints.', external: true },
    { href: '/docs#quick-start', icon: Code2, color: 'primary', title: 'Quick Start', desc: 'Get started with example requests, authentication, and SDK integration.' },
  ];
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-slate-900 dark:text-white">Resources & Documentation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l, i) => (
          <motion.a
            key={l.href}
            href={l.href}
            target={l.external ? '_blank' : undefined}
            rel={l.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[l.color]}`}>
                <l.icon className="h-5 w-5" />
              </div>
              <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{l.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{l.desc}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
