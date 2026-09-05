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
    // Subscription fields are returned nested under `tenant` by /api/v1/auth/me
    // (NOT at the top level). The Billing/Overview tabs read live plan data from
    // the pricing API; these are the denormalized auth-api cache values.
    subscription_plan?: string;
    subscription_status?: string;
    // Business vertical(s) — e.g. "retail", "hospitality". use_case is the legacy
    // single value; use_cases (multi-select) is the current source of truth when
    // present. The Billing tab uses these to only show services/plans relevant to
    // what this tenant actually is.
    use_case?: string | null;
    use_cases?: string[];
  };
  // /api/v1/auth/me returns BOTH `tenant` (the active session's tenant — singular,
  // matches the minted token) and `tenants` (every membership the user has, each with its
  // own roles) — the top-level `roles` field above is scoped to `tenant` only, so checking
  // "does this user have role X anywhere" means walking `tenants[].roles`, not just `roles`.
  // See hasAnyRole below. Both kept optional so callers still degrade gracefully.
  tenants?: Array<{
    id: string;
    name: string;
    slug: string;
    roles: string[];
  }>;
  /** @deprecated never populated at the top level — read user.tenant.subscription_plan or the Billing tab instead. */
  subscription_plan?: string;
  /** @deprecated see subscription_plan. */
  subscription_status?: string;
  is_platform_owner?: boolean;
  // True when this session belongs to the shared public demo tenant
  // (codevertex-demo). Self-service password/2FA changes are blocked
  // server-side for these accounts — the UI hides those controls too.
  is_demo?: boolean;
  mfa_enabled?: boolean;
  // Set when an admin-provisioned/reset account must pick a new password before
  // using the dashboard. Cleared once the password is changed.
  must_change_password?: boolean;
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

  // hasAnyRole checks a role list against BOTH the active-tenant roles (user.roles) and every
  // other tenant the user belongs to (user.tenants[].roles). Roles are granted per-tenant
  // membership, so a role held on a tenant that isn't the current active session (see /me's
  // active-tenant scoping) would otherwise look "missing" even though it truthfully exists —
  // use this for coarse UI nav-gates (e.g. "can this user reach the developer portal at all")
  // where showing/hiding a page is fine to decide across all memberships; the actual data and
  // actions on that page still resolve to whichever tenant is active, exactly as before.
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    if (user.roles?.some((r) => roles.includes(r))) return true;
    return !!user.tenants?.some((t) => t.roles?.some((r) => roles.includes(r)));
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

  // Tenant-admin gate. "My Organization" manages the whole tenant (members, billing,
  // branding), so only a tenant admin/owner/superuser may see it. Every other tenant
  // role (cashier, waiter, stock_clerk, ...) gets the Account/Profile section only.
  const TENANT_ADMIN_ROLES = ['admin', 'owner', 'superuser', 'super_admin', 'tenant_admin'];
  const isTenantAdmin = !!user?.roles?.some((r) => TENANT_ADMIN_ROLES.includes(r));

  return {
    user,
    isLoading,
    isError: query.isError,
    error: query.error,
    hasRole,
    hasAnyRole,
    hasPermission,
    isPlatformOwner,
    isTenantAdmin,
    isAuthenticated: !!user && !query.isError,
    refetch: query.refetch,
  };
}
