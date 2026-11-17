'use client';

import { AppSplash } from '@/components/layout/AppSplash';
import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopNav } from '@/components/layout/DashboardTopNav';
import { VeraWidget } from '@/components/vera/VeraWidget';
import { VerifyEmailPrompt } from '@/components/auth/VerifyEmailPrompt';
import { LegalConsentPrompt } from '@/components/auth/LegalConsentPrompt';
import { TenantBrandScope } from '@/components/providers/tenant-brand-scope';
import { useAuth } from '@/hooks/useAuth';
import { DEVELOPER_PORTAL_ROLES } from '@/hooks/useDashboardNav';
import { DEVELOPER_LOGIN_PATH, isDeveloperOnly } from '@/lib/developer-access';
import { MFA_SETUP_PATH, mfaEnrollmentHref } from '@/lib/mfa-enrollment';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  // The dashboard wears the active organisation's brand (logo, name, colour); platform
  // owners and Codevertex staff keep the Codevertex look.
  const activeTenantSlug = useAuthStore((s) => s.activeTenant?.slug ?? null);
  const { user, isLoading: meLoading, isPlatformOwner, hasAnyRole } = useAuth(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !meLoading) {
      // Developer console links go to the developer sign-in, which never offers business sign-up.
      const onDeveloperPages = pathname === '/dashboard/developer' || pathname?.startsWith('/dashboard/developer/');
      router.push(onDeveloperPages
        ? `${DEVELOPER_LOGIN_PATH}?return_to=${encodeURIComponent(pathname ?? '/dashboard/developer')}`
        : '/login?return_to=/dashboard');
    }
  }, [isAuthenticated, isLoading, meLoading, router, pathname]);

  // A developer-only account (every role it holds is a developer role) has nothing on the
  // business dashboard, so its home is the developer console.
  const developerOnly = !!user && !isPlatformOwner && isDeveloperOnly(user.roles, user.tenants);
  useEffect(() => {
    if (meLoading || !developerOnly) return;
    if (pathname === '/dashboard' || pathname === '/dashboard/') router.replace('/dashboard/developer');
  }, [developerOnly, pathname, meLoading, router]);

  // Platform-owner-only routes: every section under /dashboard/platform/*,
  // plus cross-tenant and platform-secret surfaces. Tenant-users should not
  // reach these even by typing the URL directly.
  const PLATFORM_OWNER_ROUTES = [
    '/dashboard/platform',
    '/dashboard/tenants',
    '/dashboard/resellers',
    // Apps & Keys / OAuth Clients / Integrations under Developer are platform-owner-only
    // surfaces server-side (isPlatformOrS2SAdmin in apikey_handler.go / AdminCreateClient /
    // AdminListIntegrationConfigs) — a tenant admin who holds a DEVELOPER_PORTAL_ROLE below
    // can reach /dashboard/developer itself, but must not be able to land on these three
    // subpages (every call there would 403 anyway; better to redirect before rendering a
    // broken page). Integrations moved here from the old top-level /dashboard/integrations.
    '/dashboard/developer/oauth-clients',
    '/dashboard/developer/integrations',
  ];
  // The developer console needs the "developer" role (in any membership, hence hasAnyRole) or
  // platform ownership; auth-api enforces the same rule (tenantDeveloperRoles).
  const DEVELOPER_PORTAL_ROUTES = ['/dashboard/developer'];

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

  // An enrolment-only session (the organisation's MFA policy covers this member and no
  // authenticator app is set up) opens only the setup page; everything else would answer 403.
  const enrolling = !!user?.mfa_enrollment_required;
  const onMfaSetup = pathname === MFA_SETUP_PATH;
  useEffect(() => {
    if (meLoading || !enrolling || onMfaSetup) return;
    router.replace(mfaEnrollmentHref(developerOnly ? DEVELOPER_LOGIN_PATH : '/login'));
  }, [enrolling, onMfaSetup, router, meLoading, developerOnly]);

  // Admin-provisioned / reset accounts must set a new password before using the
  // dashboard. Gate everything except the Security tab where they change it.
  useEffect(() => {
    if (meLoading || enrolling || !user?.must_change_password) return;
    const onSecurity = pathname === '/dashboard/profile' || pathname?.startsWith('/dashboard/profile');
    if (!onSecurity) {
      router.replace('/dashboard/profile?tab=security&force=1');
    }
  }, [user?.must_change_password, pathname, router, meLoading, enrolling]);

  if (isLoading || meLoading) {
    return <AppSplash />;
  }

  if (!isAuthenticated && !user) {
    return null;
  }

  // The setup page alone, without the navigation (whose calls the session cannot make).
  if (enrolling) {
    if (!onMfaSetup) return <AppSplash />;
    return (
      <div className="min-h-screen bg-muted/40 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <TenantBrandScope slug={isPlatformOwner ? null : activeTenantSlug}>
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopNav />
        {/* Graduated email-verification prompt. Non-blocking: notification-bearing roles
            escalate (warning → forced wait), everyone else just sees a standing reminder. */}
        <VerifyEmailPrompt />
        {/* Re-acceptance after a material Terms of Service or Privacy Policy change. */}
        <LegalConsentPrompt />
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-20 md:pb-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <VeraWidget />
      <DashboardBottomNav />
    </div>
    </TenantBrandScope>
  );
}
