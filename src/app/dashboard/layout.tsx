'use client';

import { AppSplash } from '@/components/layout/AppSplash';
import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopNav } from '@/components/layout/DashboardTopNav';
import { VeraWidget } from '@/components/vera/VeraWidget';
import { VerifyEmailPrompt } from '@/components/auth/VerifyEmailPrompt';
import { useAuth } from '@/hooks/useAuth';
import { DEVELOPER_PORTAL_ROLES } from '@/hooks/useDashboardNav';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { user, isLoading: meLoading, isPlatformOwner, hasAnyRole } = useAuth(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !meLoading) {
      router.push('/login?return_to=/dashboard');
    }
  }, [isAuthenticated, isLoading, meLoading, router]);

  // Platform-owner-only routes: every section under /dashboard/platform/*,
  // plus cross-tenant and platform-secret surfaces. Tenant-users should not
  // reach these even by typing the URL directly.
  const PLATFORM_OWNER_ROUTES = [
    '/dashboard/platform',
    '/dashboard/tenants',
    // Apps & Keys / OAuth Clients / Integrations under Developer are platform-owner-only
    // surfaces server-side (isPlatformOrS2SAdmin in apikey_handler.go / AdminCreateClient /
    // AdminListIntegrationConfigs) — a tenant admin who holds a DEVELOPER_PORTAL_ROLE below
    // can reach /dashboard/developer itself, but must not be able to land on these three
    // subpages (every call there would 403 anyway; better to redirect before rendering a
    // broken page). Integrations moved here from the old top-level /dashboard/integrations.
    '/dashboard/developer/api-keys',
    '/dashboard/developer/oauth-clients',
    '/dashboard/developer/integrations',
  ];
  // /dashboard/developer (and /dashboard/api-keys, which just redirects there) needs the
  // explicit "developer" tenant role (or platform owner) — NOT a bare tenant admin/owner/
  // superuser role string, and not just any authenticated member (a cashier/waiter shouldn't
  // land on an integrations/API-credentials page either). DEVELOPER_PORTAL_ROLES is imported
  // from useDashboardNav (not redeclared here) so the nav-visibility gate and this route guard
  // can never drift apart again — they previously did, independently, in two different ways
  // (see useDashboardNav's own history). It must also stay in sync with auth-api's
  // tenantDeveloperRoles (app_handler.go), which enforces the same set server-side for tenant
  // App CRUD — so this gate reflects who can actually act, not just who sees the page.
  // Platform-only actions within it (OAuth clients, promoting an app to production) are
  // separately gated by isPlatformOwner, authoritatively on the backend. Checked via
  // hasAnyRole (not the active-tenant-scoped user.roles) since the role may live on a tenant
  // membership other than the session's current active tenant — a real, hit bug where a user
  // granted "developer" on one org still got bounced because their active org was another.
  const DEVELOPER_PORTAL_ROUTES = ['/dashboard/developer', '/dashboard/api-keys'];

  useEffect(() => {
    if (meLoading) return;
    const requiresPlatform = PLATFORM_OWNER_ROUTES.some(
      (prefix) => pathname === prefix || pathname?.startsWith(prefix + '/'),
    );
    if (user && requiresPlatform && !isPlatformOwner) {
      router.replace('/unauthorized');
      return;
    }
    const requiresDeveloperRole = DEVELOPER_PORTAL_ROUTES.some(
      (prefix) => pathname === prefix || pathname?.startsWith(prefix + '/'),
    );
    if (
      user &&
      requiresDeveloperRole &&
      !isPlatformOwner &&
      !hasAnyRole(DEVELOPER_PORTAL_ROLES)
    ) {
      router.replace('/unauthorized');
    }
  }, [user, pathname, router, isPlatformOwner, meLoading, hasAnyRole]);

  // Admin-provisioned / reset accounts must set a new password before using the
  // dashboard. Gate everything except the Security tab where they change it.
  useEffect(() => {
    if (meLoading || !user?.must_change_password) return;
    const onSecurity = pathname === '/dashboard/profile' || pathname?.startsWith('/dashboard/profile');
    if (!onSecurity) {
      router.replace('/dashboard/profile?tab=security&force=1');
    }
  }, [user?.must_change_password, pathname, router, meLoading]);

  if (isLoading || meLoading) {
    return <AppSplash />;
  }

  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopNav />
        {/* Graduated email-verification prompt. Non-blocking: notification-bearing roles
            escalate (warning → forced wait), everyone else just sees a standing reminder. */}
        <VerifyEmailPrompt />
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-20 md:pb-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <VeraWidget />
      <DashboardBottomNav />
    </div>
  );
}
