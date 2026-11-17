'use client';

import { Button } from '@/components/ui/button';
import { PLATFORM_LOGO, useShellBrand } from '@/components/providers/tenant-brand-scope';
import { useLogout } from '@/hooks/useLogout';
import { isNavItemActive, useDashboardNav, type NavGroup, type NavItem } from '@/hooks/useDashboardNav';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ExternalLink, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function NavLink({
  item,
  isCollapsed,
  pathname,
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
}) {
  const isActive = isNavItemActive(item.href, pathname);

  return (
    <Link
      key={item.href}
      href={item.href}
      target={item.newTab ? '_blank' : undefined}
      rel={item.newTab ? 'noopener noreferrer' : undefined}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.title : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl text-sm transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground font-medium',
      )}
    >
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" aria-hidden />
      )}
      <item.icon
        className={cn(
          'h-4 w-4 shrink-0',
          isActive ? 'text-primary' : 'text-sidebar-muted group-hover:text-sidebar-foreground',
        )}
      />
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="truncate">{item.title}</span>
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
    <div className="pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-1 text-left transition-colors hover:bg-sidebar-hover/50"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-section">
          {group.label}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-sidebar-section opacity-60 transition-transform duration-200', !open && '-rotate-90')}
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-1.5 space-y-0.5">
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
  const brand = useShellBrand();
  const { accountGroup, orgGroup, developerGroup, securityGroup, platformGroup } = useDashboardNav();

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
          'flex h-16 items-center px-5 mb-2 shrink-0 border-b border-sidebar-border',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Link
          href="/"
          className="flex items-center justify-center transition-all hover:scale-105 duration-500 hover:drop-shadow-2xl"
        >
          {brand.logoUrl && !brand.isPlatform ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className={cn(
                'object-contain transition-all duration-500',
                isCollapsed ? 'h-8 w-auto' : 'h-10 w-auto',
              )}
            />
          ) : (
            <img
              src={PLATFORM_LOGO}
              alt="Codevertex"
              className={cn(
                'object-contain transition-all duration-500',
                isCollapsed ? 'h-8 w-auto' : 'h-10 w-auto',
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
      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto custom-scrollbar">
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

        {/* Developer group (platform owners + tenant admin/owner/superuser/developer roles) */}
        {developerGroup && (
          <SectionGroup
            group={developerGroup}
            isCollapsed={isCollapsed}
            pathname={pathname}
            defaultOpen
          />
        )}

        {/* Security & Compliance group (platform owners only) */}
        {securityGroup && (
          <SectionGroup
            group={securityGroup}
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
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-sidebar-muted hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors',
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
