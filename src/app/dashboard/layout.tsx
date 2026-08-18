'use client';

import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopNav } from '@/components/layout/DashboardTopNav';
import { VeraWidget } from '@/components/vera/VeraWidget';
import { VerifyEmailPrompt } from '@/components/auth/VerifyEmailPrompt';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { user, isLoading: meLoading, isPlatformOwner } = useAuth(true);
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
    '/dashboard/integrations',
  ];
  // /dashboard/developer (and /dashboard/api-keys, which just redirects there) needs the
  // "admin" or new "developer" tenant role (or platform owner) — not just any authenticated
  // member (a cashier/waiter shouldn't land on an integrations/API-credentials page). This is
  // a UX/discoverability gate only: App/API-key management itself is already tenant-scoped
  // (not role-scoped) server-side (see AppHandler.CreateApp), so this doesn't change who CAN
  // act, only who sees the page. Platform-only actions within it (OAuth clients, promoting an
  // app to production) are separately gated by isPlatformOwner, authoritatively on the backend.
  const DEVELOPER_PORTAL_ROUTES = ['/dashboard/developer', '/dashboard/api-keys'];
  const DEVELOPER_PORTAL_ROLES = ['admin', 'developer', 'superuser', 'owner'];

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
      !user.roles?.some((r) => DEVELOPER_PORTAL_ROLES.includes(r))
    ) {
      router.replace('/unauthorized');
    }
  }, [user, pathname, router, isPlatformOwner, meLoading]);

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
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
