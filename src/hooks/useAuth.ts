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
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    roles: string[];
  }>;
}

export function useAuth(enabled = true) {
  const { user: storeUser, setUser, logout } = useAuthStore();

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/api/v1/auth/me');
      const data = (response as { data?: User }).data ?? (response as User);
      setUser(data as User);
      return data as User;
    },
    enabled,
    staleTime: ME_STALE_MS,
    gcTime: ME_STALE_MS * 2,
    retry: (_, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) return false;
      return true;
    },
    throwOnError: false,
  });

  const user = (query.data ?? storeUser) as User | null;

  useEffect(() => {
    if (query.isError && enabled) {
      logout();
    }
  }, [query.isError, enabled, logout]);

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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasRole,
    hasPermission,
    isAuthenticated: !!user,
    refetch: query.refetch,
  };
}
