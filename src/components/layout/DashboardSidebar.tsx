'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
    Building2,
    ChevronLeft,
    Code2,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Shield,
    User,
    Wrench
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  role?: string;
}

const NAV_ITEMS: NavItem[] = [
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
    permission: 'settings:read',
  },
  {
    title: 'Organizations',
    href: '/dashboard/tenants',
    icon: Building2,
    permission: 'tenants:read',
  },
  {
    title: 'Developer',
    href: '/dashboard/developer',
    icon: Code2,
    permission: 'catalog:view',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'settings:manage',
  },
];

// Payment gateways and notifications are owned by treasury-ui and notifications-ui respectively.
// Platform admin links to those services are available from the service directory (landing).
const PLATFORM_ADMIN_ITEMS: NavItem[] = [
  {
    title: 'Membership Tiers',
    href: 'https://pricing.codevertexitsolutions.com/codevertex/platform/plans',
    icon: Wrench,
    role: 'super_admin'
  }
];

import { useTenant } from '@/components/providers/tenant-provider';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const { tenant } = useTenant();
  const { hasRole, hasPermission } = useAuth();

  const isPlatformAdmin = hasRole('superuser') || hasRole('admin') || hasRole('super_admin');

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.permission) return hasPermission(item.permission);
    if (item.role) return hasRole(item.role);
    return true;
  });

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-brand-dark text-brand-light border-r border-white/10 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn(
        "flex items-center px-6 pt-10 mb-8",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/" className="flex items-center justify-center transition-all hover:scale-105 duration-500 hover:drop-shadow-2xl">
          {tenant?.logoUrl ? (
            <img 
              src={tenant.logoUrl} 
              alt={tenant.name} 
              className={cn(
                "object-contain transition-all duration-500",
                isCollapsed ? "w-10 h-10" : "h-12 w-auto"
              )} 
            />
          ) : (
            <img
              src="/images/logo/codevertex.png"
              alt="Codevertex"
              className={cn(
                "object-contain transition-all duration-500",
                isCollapsed ? "w-12 h-12" : "w-48 h-16"
              )}
            />
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-2">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group',
                isActive
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-white' : 'group-hover:text-primary')} />
              {!isCollapsed && <span className="font-black text-sm uppercase tracking-widest">{item.title}</span>}
            </Link>
          );
        })}

        {/* Platform Admin Section — gateways/notifications live in treasury-ui and notifications-ui */}
        {isPlatformAdmin && PLATFORM_ADMIN_ITEMS.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-6">
                  <Wrench className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</span>
                </div>
              )}
              {isCollapsed && <div className="border-t border-slate-200 dark:border-slate-800 mx-2" />}
            </div>
            {PLATFORM_ADMIN_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group',
                    isActive
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-white' : 'group-hover:text-primary')} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-black text-sm uppercase tracking-widest">{item.title}</span>
                      {item.href.startsWith('http') && <ExternalLink className="h-3 w-3 opacity-50" />}
                    </div>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800/50">
        {!isCollapsed && (
           <div className="mb-6">
             <ThemeToggle />
           </div>
        )}
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
