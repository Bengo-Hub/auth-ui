'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { BookOpen, Code2, Cpu, Globe, Send, Terminal, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DeveloperTab {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  platformOnly?: boolean;
  external?: boolean;
}

const DEVELOPER_TABS: DeveloperTab[] = [
  { title: 'Overview', href: '/dashboard/developer', icon: Code2 },
  { title: 'Apps', href: '/dashboard/developer/apps', icon: Cpu },
  { title: 'API Keys', href: '/dashboard/developer/api-keys', icon: Terminal, platformOnly: true },
  { title: 'OAuth Clients', href: '/dashboard/developer/oauth-clients', icon: Globe, platformOnly: true },
  { title: 'Integrations', href: '/dashboard/developer/integrations', icon: Wrench, platformOnly: true },
  { title: 'API Docs', href: '/docs', icon: BookOpen, external: true },
];

const TAB_CLS =
  'flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all';

/**
 * Shared shell for every page under the consolidated /dashboard/developer folder
 * (Overview/Apps/API Keys/OAuth Clients/Integrations) — a persistent tab strip so
 * moving between developer surfaces no longer means detouring back through the main
 * sidebar. Platform-only tabs (API Keys/OAuth Clients/Integrations) are hidden from a
 * tenant admin/developer the same way the sidebar hides them — see useDashboardNav.
 */
export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const { isPlatformOwner } = useAuth();
  const pathname = usePathname();
  const tabs = DEVELOPER_TABS.filter((t) => !t.platformOnly || isPlatformOwner);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        <nav className="inline-flex w-auto flex-nowrap items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
          {tabs.map((tab) => {
            const isActive = tab.external
              ? false
              : tab.href === '/dashboard/developer'
                ? pathname === tab.href
                : pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                target={tab.external ? '_blank' : undefined}
                rel={tab.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  TAB_CLS,
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.title}
              </Link>
            );
          })}
          <Link
            href="/developer/apply"
            className={cn(TAB_CLS, 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white')}
          >
            <Send className="h-4 w-4" />
            Apply for Access
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
