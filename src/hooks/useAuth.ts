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
  mfa_enabled?: boolean;
  profile?: Record<string, any>;
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
    // Always run on client when enabled so we hydrate from session (cookie) on every page,
    // including public ones like /. Otherwise after login redirect to / the navbar would
    // show "Log In" / "Start Free" if the session cookie wasn't sent or /me wasn't called.
    enabled: enabled && typeof window !== 'undefined',
    staleTime: ME_STALE_MS,
    gcTime: ME_STALE_MS * 2,
    retry: false, // Auth should fail fast to show login buttons
    throwOnError: false,
  });

  // When /me returns 401/403, clear the user store only if we don't already have
  // a user from a successful login (storeUser). Otherwise a brief /me failure or
  // race after redirect (e.g. cookie not yet sent) would clear the user and
  // make the navbar show "Log In" / "Start Free" again.
  useEffect(() => {
    if (query.isError && enabled && !storeUser) {
      logout();
    }
  }, [query.isError, enabled, storeUser, logout]);

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

  // Platform-owner gate. auth-api mints is_platform_owner=true for users whose
  // primary tenant is "codevertex". Pages that manage the whole platform —
  // OAuth clients, all tenants, integration secrets, DB backups — must use
  // this flag, not individual roles.
  const isPlatformOwner = !!user?.is_platform_owner;

  return {
    user,
    isLoading,
    isError: query.isError,
    error: query.error,
    hasRole,
    hasPermission,
    isPlatformOwner,
    isAuthenticated: !!user && !query.isError,
    refetch: query.refetch,
  };
}
