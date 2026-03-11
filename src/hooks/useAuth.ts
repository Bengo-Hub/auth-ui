'use client';

import apiClient, { isPublicRoute } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const ME_STALE_MS = 5 * 60 * 1000; // 5 min TTL

export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions?: string[];
  primary_tenant?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    roles: string[];
  }>;
  subscription_plan?: string;
  subscription_status?: string;
  is_platform_owner?: boolean;
}

export function useAuth(enabled = true) {
  const { user: storeUser, setUser, logout } = useAuthStore();

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/api/v1/auth/me');
      const data = response.data as User;
      setUser(data);
      return data;
    },
    // Only query if:
    // 1. Explicitly enabled AND
    // 2. We have a stored user (likely session refresh) OR we are on a protected route
    enabled: enabled && (!!storeUser || (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname))),
    staleTime: ME_STALE_MS,
    gcTime: ME_STALE_MS * 2,
    retry: false, // Auth should fail fast to show login buttons
    throwOnError: false,
  });

  // When /me returns 401/403, immediately clear the user store so the UI
  // switches to the unauthenticated state without staying in an infinite load.
  useEffect(() => {
    if (query.isError && enabled) {
      logout();
    }
  }, [query.isError, enabled, logout]);

  // Derive the resolved user: prefer fresh query data, fall back to store.
  const user = (query.data ?? storeUser) as User | null;

  // isLoading should only be true while we have no data and the query is still "loading"
  // query.isLoading in v5 is equivalent to isPending && isFetching
  const isLoading = query.isLoading && !storeUser;

  const hasRole = (role: string, tenantSlug?: string) => {
    if (!user) return false;
    if (user.roles?.includes('superuser') || user.roles?.includes('admin') || user.roles?.includes('super_admin')) return true;
    if (tenantSlug && user.tenants) {
      const tenant = user.tenants.find((t) => t.slug === tenantSlug);
      return tenant?.roles?.includes(role) ?? false;
    }
    return user.roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.roles?.includes('superuser') || user.roles?.includes('admin') || user.roles?.includes('super_admin')) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return {
    user,
    isLoading,
    isError: query.isError,
    error: query.error,
    hasRole,
    hasPermission,
    isAuthenticated: !!user && !query.isError,
    refetch: query.refetch,
  };
}
