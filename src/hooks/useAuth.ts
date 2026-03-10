'use client';

import apiClient from '@/lib/api-client';
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
    enabled,
    staleTime: ME_STALE_MS,
    gcTime: ME_STALE_MS * 2,
    retry: (_, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // Never retry auth errors — fail fast and treat as unauthenticated
      if (status === 401 || status === 403) return false;
      return true;
    },
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

  // isLoading should only be true while the *initial* fetch is in-flight AND
  // there is no cached user to show. If the query errored (e.g. 401),
  // we are NOT loading — we are definitively unauthenticated.
  // Using `query.isPending` (= no data yet) combined with `query.isFetching`
  // avoids the stale-loading state that keeps the skeleton visible after 401.
  const isLoading = !query.isError && query.isPending && query.isFetching && !storeUser;

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
