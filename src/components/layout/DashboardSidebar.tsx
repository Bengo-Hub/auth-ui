'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
    Building2,
    ChevronLeft,
    Code2,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Shield,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Security',
    href: '/dashboard/security',
    icon: Shield,
  },
  {
    title: 'Organizations',
    href: '/dashboard/tenants',
    icon: Building2,
  },
  {
    title: 'Developer',
    href: '/dashboard/developer',
    icon: Code2,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-6">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">BengoBox</span>
          </Link>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'group-hover:text-primary')} />
              {!isCollapsed && <span className="font-bold">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {!isCollapsed && user && (
          <div className="mb-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || user.email}</p>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
