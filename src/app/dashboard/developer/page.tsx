'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDeveloperOnly } from '@/hooks/use-developer-only';
import apiClient from '@/lib/api-client';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  ExternalLink,
  Globe,
  Package,
  Plus,
  Send,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

const ETIMS_GUIDE_URL = 'https://docs.codevertexafrica.com/integrations/etims-api/';

/** Developer portal landing page with live counts. */
export default function DeveloperPortalOverview() {
  const { isPlatformOwner } = useAuth();
  const developerOnly = useDeveloperOnly();
  const [appCount, setAppCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<unknown[]>('/api/v1/admin/apps').catch(() => ({ data: [] })).then((apps) => {
      if (cancelled) return;
      const appList = Array.isArray(apps.data) ? apps.data : [];
      setAppCount(isPlatformOwner ? appList.length : appList.filter((a: any) => a.app_type === 'tenant').length);
    });
    return () => { cancelled = true; };
  }, [isPlatformOwner]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {developerOnly ? 'Developer console' : 'Developer Portal'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {developerOnly
            ? 'Create an app for each integration, test it in the sandbox, then request go-live.'
            : `Manage your apps${isPlatformOwner ? ', API keys, and OAuth clients' : ''}.`}
        </p>
      </header>

      {developerOnly && appCount === 0 ? (
        <FirstAppSteps />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Apps" value={appCount ?? '—'} icon={Cpu} color="purple" />
          {isPlatformOwner && <StatCard label="OAuth Clients" value="—" icon={Globe} color="green" helper="See OAuth Clients" />}
        </div>
      )}

      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard
            href="/dashboard/developer/apps"
            icon={Cpu}
            color="purple"
            title="Apps"
            desc={developerOnly ? 'Consumer keys, secrets, sandbox and go-live for each integration.' : 'Every credential: platform services, partners and tenant integrations.'}
          />
          {isPlatformOwner && (
            <NavCard href="/dashboard/developer/oauth-clients" icon={Globe} color="green" title="OAuth Clients" desc="Register and manage OAuth2 clients." />
          )}
          <NavCard href="/dashboard/developer/docs" icon={Code2} color="slate" title="API Docs" desc="Endpoints, authentication, and code examples." />
        </div>
      </section>

      <ResourcesSection developerOnly={developerOnly} />
    </div>
  );
}

const FIRST_APP_STEPS = [
  { title: 'Create an app', body: 'Pick the API it talks to. You get a consumer key straight away.' },
  { title: 'Generate the consumer secret', body: 'It is shown once. Keep it on your server, never in browser code.' },
  { title: 'Get a token and test', body: 'Trade the key and secret for a 15 minute token and call the sandbox.' },
  { title: 'Request go-live', body: 'We review the integration and switch the app to production.' },
];

/** Empty state for a developer account with no apps yet: the path from nothing to a live call. */
function FirstAppSteps() {
  return (
    <section aria-labelledby="first-app-heading" className="rounded-[1.75rem] border border-border/70 bg-card p-6 sm:p-8 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 id="first-app-heading" className="text-lg font-bold text-slate-900 dark:text-white">You have no apps yet</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Four steps take you from here to your first live API call.</p>
        </div>
        <Link
          href="/dashboard/developer/apps?new=1"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden /> Create your first app
        </Link>
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIRST_APP_STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl bg-muted/60 p-4">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden>{i + 1}</span>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
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

interface ResourceLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
  external?: boolean;
}

function ResourcesSection({ developerOnly }: { developerOnly: boolean }) {
  const links: ResourceLink[] = developerOnly ? [
    { href: '/developer/apply', icon: Send, color: 'primary', title: 'Request another API', desc: 'Ask for access to eTIMS and payments, notifications or sign in with Codevertex.' },
    { href: '/dashboard/developer/docs', icon: Code2, color: 'sky', title: 'API reference', desc: 'Endpoints, the token call and request examples for each API you can use.' },
    { href: ETIMS_GUIDE_URL, icon: BookOpen, color: 'emerald', title: 'eTIMS API guide', desc: 'The public guide to sending invoices to KRA through the eTIMS API.', external: true },
  ] : [
    { href: '/developer/apply', icon: Send, color: 'primary', title: 'Apply for API Access', desc: 'Request a scoped credential for a service you don’t have access to yet (treasury, notifications, SSO).' },
    { href: '/dashboard/developer/docs', icon: Code2, color: 'sky', title: 'API Documentation', desc: 'Complete API reference with endpoints, authentication, and code examples.' },
    { href: 'https://github.com/Bengo-Hub/auth-api', icon: BookOpen, color: 'violet', title: 'Auth API', desc: 'Backend authentication service source code and implementation details.', external: true },
    { href: 'https://github.com/Bengo-Hub/shared-auth-client', icon: Package, color: 'amber', title: 'Go SDK', desc: 'Shared Auth Client for Go services. JWT validation, middleware, and JWKS support.', external: true },
    { href: 'https://github.com/Bengo-Hub/bengobox/blob/main/docs/RBAC_IMPLEMENTATION_GUIDE.md', icon: ShieldAlert, color: 'rose', title: 'RBAC Guide', desc: 'Role-based access control patterns and permission enforcement implementation.', external: true },
    { href: 'https://sso.codevertexafrica.com/v1/docs/', icon: Terminal, color: 'emerald', title: 'Swagger UI', desc: 'Interactive API explorer with try-it-out functionality for all endpoints.', external: true },
    { href: '/dashboard/developer/docs#quick-start', icon: Code2, color: 'primary', title: 'Quick Start', desc: 'Get started with example requests, authentication, and SDK integration.' },
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
      <h2 className="text-lg font-black text-slate-900 dark:text-white">{developerOnly ? 'Guides and references' : 'Resources & Documentation'}</h2>
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
