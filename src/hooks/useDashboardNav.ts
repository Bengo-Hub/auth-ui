'use client';

import { useTenant } from '@/components/providers/tenant-provider';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  BookOpen,
  Building2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Handshake,
  Inbox,
  Key,
  KeyRound,
  KeySquare,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Store,
  Terminal,
  User,
  Users,
  Wrench,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  newTab?: boolean;
}

export interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

// '/dashboard' and '/dashboard/developer' are each both a real page AND the "index" of a
// group whose other items nest one level deeper (e.g. '/dashboard/developer/apps') — a plain
// prefix match would highlight the index item on every one of its own sibling's pages too.
// Shared by the desktop sidebar and the mobile drawer so this can't drift between them again.
const EXACT_MATCH_ONLY_HREFS = ['/dashboard', '/dashboard/developer'];

export function isNavItemActive(href: string, pathname: string | null): boolean {
  if (EXACT_MATCH_ONLY_HREFS.includes(href)) return pathname === href;
  return pathname === href || !!pathname?.startsWith(href + '/');
}

const ACCOUNT_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Profile', href: '/dashboard/profile', icon: User },
];

// Usable by any tenant "developer" (Apps is tenant-scoped server-side — see
// AppHandler.CreateApp / hasTenantDeveloperRole, which enforces this same role set).
const DEVELOPER_ITEMS: NavItem[] = [
  { title: 'Overview', href: '/dashboard/developer', icon: Code2 },
  { title: 'Apps', href: '/dashboard/developer/apps', icon: Cpu },
  { title: 'API Docs', href: '/dashboard/developer/docs', icon: BookOpen },
];

// Platform-wide surfaces (API Keys, OAuth Clients, Integrations are all platform-owner-gated
// server-side) — appended only for isPlatformOwner, so a tenant developer never sees a nav link
// that 403s the moment they click it.
const PLATFORM_DEVELOPER_ITEMS: NavItem[] = [
  { title: 'API Keys', href: '/dashboard/developer/api-keys', icon: Terminal },
  { title: 'OAuth Clients', href: '/dashboard/developer/oauth-clients', icon: Key },
  { title: 'Integrations', href: '/dashboard/developer/integrations', icon: Wrench },
];

const SECURITY_ITEMS: NavItem[] = [
  { title: 'Roles', href: '/dashboard/platform/roles', icon: ShieldCheck },
  { title: 'Permissions', href: '/dashboard/platform/permissions', icon: KeySquare },
  { title: 'Password Policy', href: '/dashboard/platform/security/password-policy', icon: KeyRound },
  { title: 'Audit Log', href: '/dashboard/platform/audit', icon: ScrollText },
];

const PLATFORM_ITEMS: NavItem[] = [
  { title: 'Organizations', href: '/dashboard/tenants', icon: Building2 },
  { title: 'Certified Resellers', href: '/dashboard/resellers', icon: Handshake },
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

// Tenant-scoped roles entitled to the Developer Portal (Overview/Apps/API Docs) — must
// stay in sync with auth-api's tenantDeveloperRoles (app_handler.go), which now
// authoritatively enforces the same set server-side for tenant App CRUD.
//
// Deliberately just "developer" — NOT admin/owner/superuser. Those are ordinary
// TenantMembership role strings (e.g. the admin of Urban Loft Cafe), which must never be
// confused with actual platform admin/superuser status (isPlatformOwner, below). A tenant
// admin/owner does not automatically get Developer Portal access; they need the "developer"
// role explicitly granted, same as anyone else on that tenant.
export const DEVELOPER_PORTAL_ROLES = ['developer'];

/**
 * Single source of truth for the dashboard's role-gated nav structure. Both the desktop
 * DashboardSidebar and the mobile DashboardTopNav drawer must consume this instead of
 * keeping their own hard-coded item lists — two independent copies previously drifted
 * out of sync (the mobile drawer gated Developer/Apps on isPlatformOwner only, hiding
 * them from legitimate tenant admins/developers that the desktop sidebar correctly showed).
 */
export function useDashboardNav() {
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
  // anyone explicitly holding the "developer" role on ANY of their tenant memberships —
  // checked across all memberships, not just the active one, since a role granted on a
  // different org than the current session would otherwise leave this nav item (and
  // dashboard/layout.tsx's route guard) permanently hidden despite the role truthfully
  // existing. A bare tenant admin/owner/superuser role does NOT qualify on its own.
  const developerGroup: NavGroup | null = isPlatformOwner || hasAnyRole(DEVELOPER_PORTAL_ROLES)
    ? { label: 'Developer', icon: Code2, items: isPlatformOwner ? [...DEVELOPER_ITEMS, ...PLATFORM_DEVELOPER_ITEMS] : DEVELOPER_ITEMS }
    : null;

  const securityGroup: NavGroup | null = isPlatformOwner
    ? { label: 'Security & Compliance', icon: ShieldCheck, items: SECURITY_ITEMS }
    : null;

  const platformGroup: NavGroup | null = isPlatformOwner
    ? { label: 'Platform', icon: Wrench, items: PLATFORM_ITEMS }
    : null;

  return { accountGroup, orgGroup, developerGroup, securityGroup, platformGroup };
}
