'use client';

import { Button } from '@/components/ui/button';
import { useTenant } from '@/components/providers/tenant-provider';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';
import {
  Activity,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Inbox,
  Key,
  KeyRound,
  KeySquare,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  ShieldCheck,
  Store,
  Terminal,
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
  { title: 'Profile', href: '/dashboard/profile', icon: User },
];

// Consolidates what were 4 flat, un-nested entries (Developer/Apps & Keys/
// OAuth Clients/Integrations) into one categorized group, matching the Zoho
// Mail Admin reference's grouped left-nav pattern. Docs is a net-new sidebar
// entry — /docs already exists as a real page but had no dashboard nav link
// at all before this. Pure re-categorization: role-gating (isPlatformOwner)
// is unchanged from today.
// Usable by any tenant "developer" (Apps is tenant-scoped server-side — see AppHandler.CreateApp).
const DEVELOPER_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/dashboard/developer', icon: Code2 },
  { title: 'Apps', href: '/dashboard/developer/apps', icon: Cpu },
  { title: 'API Docs', href: '/docs', icon: BookOpen },
];

// Platform-wide surfaces (API Keys, OAuth Clients, Integrations are all platform-owner-gated
// server-side) — appended only for isPlatformOwner, so a tenant developer never sees a nav link
// that 403s the moment they click it.
const PLATFORM_DEVELOPER_ITEMS: NavItem[] = [
  { title: 'API Keys', href: '/dashboard/developer/api-keys', icon: Terminal },
  { title: 'OAuth Clients', href: '/dashboard/developer/oauth-clients', icon: Key },
  { title: 'Integrations', href: '/dashboard/integrations', icon: Wrench },
];

const SECURITY_ITEMS: NavItem[] = [
  { title: 'Roles', href: '/dashboard/platform/roles', icon: ShieldCheck },
  { title: 'Permissions', href: '/dashboard/platform/permissions', icon: KeySquare },
  { title: 'Password Policy', href: '/dashboard/platform/security/password-policy', icon: KeyRound },
  { title: 'Audit Log', href: '/dashboard/platform/audit', icon: ScrollText },
];

const PLATFORM_ITEMS: NavItem[] = [
  { title: 'Organizations', href: '/dashboard/tenants', icon: Building2 },
  { title: 'Users', href: '/dashboard/platform/users', icon: Users },
  { title: 'Integration Requests', href: '/dashboard/platform/integration-requests', icon: Inbox },
  { title: 'DB Backups', href: '/dashboard/platform/backups', icon: Database },
  { title: 'Infra Monitor', href: '/dashboard/platform/monitoring', icon: Activity },
  {
    title: 'Membership Tiers',
    href: 'https://pricing.codevertexafrica.com/codevertex/platform/plans',
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
        'flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 group text-sm',
        isActive
          ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02] font-semibold'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground font-medium',
      )}
    >
      <item.icon
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110',
          isActive ? 'text-primary-foreground' : 'group-hover:text-sidebar-foreground',
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
    <div className="pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-6 py-1.5 group rounded-xl hover:bg-sidebar-hover/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <group.icon className="h-3.5 w-3.5 text-sidebar-section" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-section">
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
  const { isPlatformOwner, isTenantAdmin, hasAnyRole } = useAuth();

  const accountGroup: NavGroup = {
    label: 'Account',
    icon: User,
    items: ACCOUNT_ITEMS,
  };

  // "My Organization" administers the whole tenant, so it is limited to tenant
  // admins/owners/superusers. All other tenant roles see only the Account section
  // (profile, security) — which every SSO user can manage for themselves.
  const orgGroup: NavGroup | null =
    !isPlatformOwner && !!tenant && isTenantAdmin
      ? {
          label: 'Organization',
          icon: Store,
          items: [{ title: 'My Organization', href: '/dashboard/my-tenant', icon: Store }],
        }
      : null;

  // Security/Platform stay platform-owner-only. Developer is shown to platform owners AND
  // anyone holding the "developer" (or admin/superuser/owner) role on ANY of their tenant
  // memberships — checked across all memberships, not just the active one, since a role
  // granted on a different org than the current session would otherwise leave this nav item
  // (and dashboard/layout.tsx's route guard) permanently hidden despite the role truthfully
  // existing. Matches the same DEVELOPER_PORTAL_ROLES list dashboard/layout.tsx gates on.
  const DEVELOPER_PORTAL_ROLES = ['admin', 'developer', 'superuser', 'owner'];
  const developerGroup: NavGroup | null = isPlatformOwner || hasAnyRole(DEVELOPER_PORTAL_ROLES)
    ? { label: 'Developer', icon: Code2, items: isPlatformOwner ? [...DEVELOPER_ITEMS, ...PLATFORM_DEVELOPER_ITEMS] : DEVELOPER_ITEMS }
    : null;

  const securityGroup: NavGroup | null = isPlatformOwner
    ? { label: 'Security & Compliance', icon: ShieldCheck, items: SECURITY_ITEMS }
    : null;

  const platformGroup: NavGroup | null = isPlatformOwner
    ? { label: 'Platform', icon: Wrench, items: PLATFORM_ITEMS }
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
                isCollapsed ? 'h-10 w-auto' : 'h-14 w-auto',
              )}
            />
          ) : (
            <img
              src="/images/logo/codevertex.png"
              alt="Codevertex"
              className={cn(
                'object-contain transition-all duration-500',
                isCollapsed ? 'h-10 w-auto' : 'h-16 w-auto',
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

        {/* Developer group (platform owners only, for now — see Phase 11) */}
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
