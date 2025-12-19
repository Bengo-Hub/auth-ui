'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  tenantSlug?: string;
}

export function ProtectedRoute({ children, requiredRole, tenantSlug }: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?return_to=${encodeURIComponent(window.location.pathname)}`);
    } else if (!isLoading && requiredRole && !hasRole(requiredRole, tenantSlug)) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, requiredRole, tenantSlug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea8022]"></div>
      </div>
    );
  }

  if (!user || (requiredRole && !hasRole(requiredRole, tenantSlug))) {
    return null;
  }

  return <>{children}</>;
}
