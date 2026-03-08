'use client';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
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
  const { user, isLoading: meLoading, hasRole } = useAuth(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !meLoading) {
      router.push('/login?return_to=/dashboard');
    }
  }, [isAuthenticated, isLoading, meLoading, router]);

  useEffect(() => {
    if (meLoading) return; // Skip check while user data is loading
    const isPlatformRoute = pathname?.startsWith('/dashboard/platform');
    const canAccessPlatform = user && (hasRole('superuser') || hasRole('admin') || hasRole('super_admin'));
    if (user && isPlatformRoute && !canAccessPlatform) {
      router.replace('/unauthorized');
    }
  }, [user, pathname, router, hasRole, meLoading]);

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
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
