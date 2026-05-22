'use client';

import { cn } from '@/lib/utils';
import { Home, Settings, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { title: 'Home',     href: '/dashboard',                      icon: Home },
  { title: 'Profile',  href: '/dashboard/profile',              icon: User },
  { title: 'Security', href: '/dashboard/profile?tab=security', icon: ShieldCheck },
  { title: 'Settings', href: '/dashboard/settings',             icon: Settings },
];

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-area-pb">
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname?.startsWith(item.href.split('?')[0] + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 text-[10px] font-bold uppercase tracking-wide transition-colors relative',
                isActive
                  ? 'text-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-2 h-0.5 rounded-b-full bg-primary" />
              )}
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
