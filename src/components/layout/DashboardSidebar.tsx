'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';
import {
  Building2,
  ChevronLeft,
  Code2,
  Database,
  ExternalLink,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
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
  newTab?: boolean;
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
    title: 'Organizations',
    href: '/dashboard/tenants',
    icon: Building2,
    permission: 'auth.preferences.change',
  },
  {
    title: 'Developer',
    href: '/dashboard/developer',
    icon: Code2,
    permission: 'auth.preferences.change',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'auth.preferences.change',
  },
];

// Payment gateways and notifications are owned by treasury-ui and notifications-ui respectively.
// Platform admin links to those services are available from the service directory (landing).
const PLATFORM_ADMIN_ITEMS: NavItem[] = [
  {
    title: 'OAuth Clients',
    href: '/dashboard/platform/clients',
    icon: Key,
    role: 'superuser',
  },
  {
    title: 'Membership Tiers',
    href: 'https://pricing.codevertexitsolutions.com/codevertex/platform/plans',
    icon: Wrench,
    newTab: true,
    role: 'superuser'
  },
  {
    title: 'DB Backups',
    href: '/dashboard/platform/backups',
    icon: Database,
    role: 'superuser',
  },
];

import { useTenant } from '@/components/providers/tenant-provider';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useLogout();
  const { tenant } = useTenant();
  const { hasRole, hasPermission } = useAuth();

  const isPlatformAdmin = hasRole('superuser') || hasRole('admin') || hasRole('super_admin');

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.href === '/dashboard/tenants' && !isPlatformAdmin) return false;
    if (item.permission) return hasPermission(item.permission);
    if (item.role) return hasRole(item.role);
    return true;
  });

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out z-30',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className={cn(
        "flex items-center px-6 pt-10 mb-8 shrink-0",
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
            className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 mb-8 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-primary-foreground' : 'group-hover:text-sidebar-foreground')} />
              {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest">{item.title}</span>}
            </Link>
          );
        })}

        {/* Platform Admin Section */}
        {isPlatformAdmin && PLATFORM_ADMIN_ITEMS.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-6">
                  <Wrench className="h-3.5 w-3.5 text-sidebar-section" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-section">Platform</span>
                </div>
              )}
              {isCollapsed && <div className="border-t border-sidebar-border mx-2" />}
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
                      ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]'
                      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-primary-foreground' : 'group-hover:text-sidebar-foreground')} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-bold text-xs uppercase tracking-widest">{item.title}</span>
                      {item.href.startsWith('http') && <ExternalLink className="h-3 w-3 opacity-50" />}
                    </div>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-rose-500 dark:text-rose-400 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all duration-300',
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
