'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';
import { FileText, LayoutDashboard, Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortal } from './equity-portal-context';

const TABS = [
  { title: 'Dashboard', href: '/equity-holder/dashboard', icon: LayoutDashboard },
  { title: 'Payouts', href: '/equity-holder/payouts', icon: Wallet },
  { title: 'Documents', href: '/equity-holder/documents', icon: FileText },
  { title: 'Tax', href: '/equity-holder/tax', icon: Receipt },
];

/**
 * Persistent header + tab nav shared by every /equity-holder/* page. The portal is
 * token-authenticated (magic-link, no session cookie) — usePortal()'s token must be
 * carried through every nav link's query string, or the destination page's own
 * EquityPortalProvider re-read of useSearchParams() would find no token and bounce
 * to the "Access Denied" state.
 */
export function EquityPortalHeader() {
  const { token } = usePortal();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
            Equity Portal
          </span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto">
        <div className="inline-flex w-auto flex-nowrap items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={`${tab.href}?token=${encodeURIComponent(token)}`}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all',
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
        </div>
      </nav>
    </header>
  );
}
