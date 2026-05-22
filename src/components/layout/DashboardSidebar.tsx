'use client';

import { Button } from '@/components/ui/button';
import { useTenant } from '@/components/providers/tenant-provider';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Store,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  newTab?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const ACCOUNT_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
];

const PLATFORM_ADMIN_ITEMS: NavItem[] = [
  { title: 'Organizations', href: '/dashboard/tenants', icon: Building2 },
  { title: 'OAuth Clients', href: '/dashboard/platform/clients', icon: Key },
  { title: 'Integrations', href: '/dashboard/integrations', icon: Wrench },
  { title: 'Developer', href: '/dashboard/developer', icon: Code2 },
  { title: 'Users', href: '/dashboard/platform/users', icon: Users },
  { title: 'Apps & Keys', href: '/dashboard/platform/apps', icon: Cpu },
  { title: 'DB Backups', href: '/dashboard/platform/backups', icon: Database },
  {
    title: 'Membership Tiers',
    href: 'https://pricing.codevertexitsolutions.com/codevertex/platform/plans',
    icon: ExternalLink,
    newTab: true,
  },
];

function NavLink({
  item,
  isCollapsed,
  pathname,
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
}) {
  const isActive =
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      key={item.href}
      href={item.href}
      target={item.newTab ? '_blank' : undefined}
      rel={item.newTab ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group',
        isActive
          ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground',
      )}
    >
      <item.icon
        className={cn(
          'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110',
          isActive ? 'text-primary-foreground' : 'group-hover:text-sidebar-foreground',
        )}
      />
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="font-bold text-xs uppercase tracking-widest truncate">{item.title}</span>
          {item.newTab && <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />}
        </div>
      )}
    </Link>
  );
}

function SectionGroup({
  group,
  isCollapsed,
  pathname,
  defaultOpen = true,
}: {
  group: NavGroup;
  isCollapsed: boolean;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <>
        <div className="border-t border-sidebar-border mx-2 my-2" />
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
        ))}
      </>
    );
  }

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-6 py-1.5 group rounded-xl hover:bg-sidebar-hover/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <group.icon className="h-3.5 w-3.5 text-sidebar-section" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-section">
            {group.label}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3 w-3 text-sidebar-section opacity-70" />
        ) : (
          <ChevronDown className="h-3 w-3 text-sidebar-section opacity-70" />
        )}
      </button>

      {open && (
        <div className="mt-1 space-y-0.5">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useLogout();
  const { tenant } = useTenant();
  const { isPlatformOwner } = useAuth();

  const accountGroup: NavGroup = {
    label: 'Account',
    icon: User,
    items: ACCOUNT_ITEMS,
  };

  const orgGroup: NavGroup | null =
    !isPlatformOwner && !!tenant
      ? {
          label: 'Organization',
          icon: Store,
          items: [{ title: 'My Organization', href: '/dashboard/my-tenant', icon: Store }],
        }
      : null;

  const platformGroup: NavGroup | null = isPlatformOwner
    ? { label: 'Platform', icon: Wrench, items: PLATFORM_ADMIN_ITEMS }
    : null;

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out z-30',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          'flex items-center px-6 pt-10 mb-6 shrink-0',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link
          href="/"
          className="flex items-center justify-center transition-all hover:scale-105 duration-500 hover:drop-shadow-2xl"
        >
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className={cn(
                'object-contain transition-all duration-500',
                isCollapsed ? 'w-10 h-10' : 'h-12 w-auto',
              )}
            />
          ) : (
            <img
              src="/images/logo/codevertex.png"
              alt="Codevertex"
              className={cn(
                'object-contain transition-all duration-500',
                isCollapsed ? 'w-12 h-12' : 'w-48 h-16',
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

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 mb-6 shrink-0">
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

      {/* Nav groups */}
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {/* Account group (always visible) */}
        <SectionGroup
          group={accountGroup}
          isCollapsed={isCollapsed}
          pathname={pathname}
          defaultOpen
        />

        {/* Organization group (tenant members only) */}
        {orgGroup && (
          <SectionGroup
            group={orgGroup}
            isCollapsed={isCollapsed}
            pathname={pathname}
            defaultOpen
          />
        )}

        {/* Platform group (platform owners only) */}
        {platformGroup && (
          <SectionGroup
            group={platformGroup}
            isCollapsed={isCollapsed}
            pathname={pathname}
            defaultOpen
          />
        )}
      </nav>

      {/* Sign out */}
      <div className="p-6 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-rose-500 dark:text-rose-400 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all duration-300',
            isCollapsed ? 'justify-center' : '',
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
