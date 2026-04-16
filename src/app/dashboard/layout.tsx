'use client';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopNav } from '@/components/layout/DashboardTopNav';
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
    '/dashboard/developer',
    '/dashboard/api-keys',
  ];

  useEffect(() => {
    if (meLoading) return;
    const requiresPlatform = PLATFORM_OWNER_ROUTES.some(
      (prefix) => pathname === prefix || pathname?.startsWith(prefix + '/'),
    );
    if (user && requiresPlatform && !isPlatformOwner) {
      router.replace('/unauthorized');
    }
  }, [user, pathname, router, isPlatformOwner, meLoading]);

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
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
