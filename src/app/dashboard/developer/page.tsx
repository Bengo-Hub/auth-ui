'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDeveloperOnly } from '@/hooks/use-developer-only';
import { useDeveloperApps, useOAuthClients, useOpenAccessRequests, type DeveloperAppSummary } from '@/hooks/use-dashboard-api';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  FileCode2,
  Globe,
  Inbox,
  Plus,
  Rocket,
  Send,
  Terminal,
  Wrench,
} from 'lucide-react';

const DOCS_SITE = 'https://docs.codevertexafrica.com';

/** Developer console home: live counts, recent apps, and grouped docs and resources. */
export default function DeveloperPortalOverview() {
  const { isPlatformOwner } = useAuth();
  const developerOnly = useDeveloperOnly();
  const apps = useDeveloperApps();
  const clients = useOAuthClients(isPlatformOwner);
  const requests = useOpenAccessRequests(isPlatformOwner);

  const list = (apps.data ?? []).filter((a) => isPlatformOwner || a.app_type === 'tenant');
  const live = list.filter((a) => a.environment === 'production' && a.status === 'active').length;
  const sandbox = list.filter((a) => a.environment === 'sandbox' && a.status === 'active').length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {developerOnly ? 'Developer console' : 'Developer portal'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {developerOnly ? 'Build on the Codevertex APIs' : 'Apps, clients and API access'}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {developerOnly
              ? 'Create an app for each integration, test it in the free sandbox, then request go-live.'
              : 'Every credential on the platform, the OAuth clients behind sign-in, and the requests waiting for review.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/dashboard/developer/docs"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookOpen className="h-4 w-4" aria-hidden /> API reference
          </Link>
          <Link
            href="/dashboard/developer/apps?new=1"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden /> New app
          </Link>
        </div>
      </header>

      {developerOnly && apps.isSuccess && list.length === 0 ? (
        <FirstAppSteps />
      ) : (
        <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric label="Apps" value={apps.isSuccess ? list.length : undefined} hint="All credentials" icon={Cpu} />
          <Metric label="Live" value={apps.isSuccess ? live : undefined} hint="Active in production" icon={Rocket} />
          <Metric label="Sandbox" value={apps.isSuccess ? sandbox : undefined} hint="Active for testing" icon={Terminal} />
          {isPlatformOwner ? (
            <Metric label="OAuth clients" value={clients.isSuccess ? clients.data.length : undefined} hint="Sign-in clients" icon={Globe} href="/dashboard/developer/oauth-clients" />
          ) : (
            <Metric label="Open requests" value={requests.isSuccess ? requests.data : undefined} hint="Access awaiting review" icon={Inbox} />
          )}
        </section>
      )}

      {list.length > 0 && <RecentApps apps={list} />}

      <Resources developerOnly={developerOnly} isPlatformOwner={isPlatformOwner} pendingRequests={isPlatformOwner ? requests.data : undefined} />
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-primary/70" aria-hidden />
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
        {value === undefined ? <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-muted" aria-label="Loading" /> : value.toLocaleString('en-KE')}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </>
  );
  const cls = 'block rounded-2xl border border-border/70 bg-card p-5 transition-colors';
  return href ? (
    <Link href={href} className={`${cls} hover:border-primary/40`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function RecentApps({ apps }: { apps: DeveloperAppSummary[] }) {
  const recent = [...apps].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')).slice(0, 5);
  return (
    <section aria-labelledby="recent-apps" className="rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 id="recent-apps" className="text-sm font-semibold text-slate-900 dark:text-white">Recent apps</h2>
        <Link href="/dashboard/developer/apps" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          All apps <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="divide-y divide-border/70">
        {recent.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{a.name}</p>
              <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">{a.client_id}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={a.environment === 'production' ? 'live' : 'sandbox'}>{a.environment === 'production' ? 'Production' : 'Sandbox'}</Badge>
              {a.status !== 'active' && <Badge tone="muted">{a.status}</Badge>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Badge({ tone, children }: { tone: 'live' | 'sandbox' | 'muted'; children: React.ReactNode }) {
  const cls = {
    live: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    sandbox: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    muted: 'bg-muted text-muted-foreground',
  }[tone];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>{children}</span>;
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
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

interface ResourceLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  external?: boolean;
  badge?: string;
}

interface ResourceGroup {
  title: string;
  links: ResourceLink[];
}

function Resources({ developerOnly, isPlatformOwner, pendingRequests }: { developerOnly: boolean; isPlatformOwner: boolean; pendingRequests?: number }) {
  const groups: ResourceGroup[] = [
    {
      title: 'Reference',
      links: [
        { href: '/dashboard/developer/docs', icon: Code2, title: 'API reference', desc: 'Endpoints, authentication and request examples for each API.' },
        { href: '/dashboard/developer/docs#quick-start', icon: FileCode2, title: 'Quick start', desc: 'Your first token call and request, step by step.' },
        { href: 'https://sso.codevertexafrica.com/v1/docs/', icon: Terminal, title: 'API explorer', desc: 'Try the public endpoints in the browser.', external: true },
      ],
    },
    {
      title: 'Guides',
      links: [
        { href: `${DOCS_SITE}/integrations/etims-api/`, icon: BookOpen, title: 'eTIMS API guide', desc: 'Send invoices to KRA, pricing, tokens and go-live.', external: true },
        { href: `${DOCS_SITE}/integrations/developer-portal/`, icon: BookOpen, title: 'Developer portal guide', desc: 'Apps, consumer keys and secrets, sandbox and production.', external: true },
      ],
    },
    {
      title: 'Access',
      links: [
        { href: '/developer/apply', icon: Send, title: developerOnly ? 'Request another API' : 'Apply for API access', desc: 'eTIMS and payments, notifications, or sign in with Codevertex.' },
        ...(isPlatformOwner
          ? [
              { href: '/dashboard/platform/integration-requests', icon: Inbox, title: 'Access requests', desc: 'Review and approve developer and integration requests.', badge: pendingRequests ? `${pendingRequests} pending` : undefined },
              { href: '/dashboard/developer/oauth-clients', icon: Globe, title: 'OAuth clients', desc: 'Sign-in clients for Codevertex and partner apps.' },
              { href: '/dashboard/developer/integrations', icon: Wrench, title: 'Integrations', desc: 'Platform provider settings and credentials.' },
            ]
          : []),
      ],
    },
  ];

  return (
    <section aria-labelledby="resources" className="space-y-5">
      <h2 id="resources" className="text-lg font-bold text-slate-900 dark:text-white">Docs and resources</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {groups.map((g, gi) => (
          <div key={g.title} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{g.title}</h3>
            <ul className="space-y-2">
              {g.links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (gi * 3 + i) * 0.04, ease: [0.22, 1, 0.36, 1] }}>
                  <a
                    href={l.href}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noopener noreferrer' : undefined}
                    className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <l.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {l.title}
                        {l.badge && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">{l.badge}</span>}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{l.desc}</span>
                    </span>
                    {l.external ? (
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary" aria-hidden />
                    ) : (
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                    )}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
