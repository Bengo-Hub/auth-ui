'use client';

import apiClient from '@/lib/api-client';
import { subscriptionApi, type ServiceSubscriptionsResult } from '@/lib/subscription-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const STALE_MS = 5 * 60 * 1000;

// ── Subscriptions (per-service, from the pricing API) ──────────────────────────
// Shared by the Overview and Billing tabs so the "current plan" shown is always
// the same source of truth (#4).
export function useServiceSubscriptions(tenantId: string | undefined) {
  return useQuery<ServiceSubscriptionsResult | null>({
    queryKey: ['service-subscriptions', tenantId],
    queryFn: () => (tenantId ? subscriptionApi.getServiceSubscriptions(tenantId) : Promise.resolve(null)),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  });
}

// Derive a single "current active plan" label from the per-service subscription
// payload. Returns null when nothing is active.
export function deriveActivePlan(data: ServiceSubscriptionsResult | null | undefined): { name: string; status: string } | null {
  if (!data) return null;
  const sub = data.subscription;
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIAL')) {
    return { name: sub.plan_name || sub.plan_code, status: sub.status };
  }
  const activeService = (data.services ?? []).find((s) => s.status === 'ACTIVE' || s.status === 'TRIAL');
  if (activeService) {
    return { name: activeService.plan_name || activeService.plan_code || 'Active', status: activeService.status };
  }
  return null;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  status: string;
  ip_address: string;
  user_agent: string;
  issued_at: string;
  expires_at: string;
  is_current: boolean;
}

export const sessionKeys = { all: () => ['auth', 'sessions'] as const };

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.all(),
    queryFn: async () => {
      const response = await apiClient.get<{ sessions: Session[] }>('/api/v1/auth/sessions');
      const data = (response as { data?: { sessions?: Session[] } }).data ?? (response as { sessions?: Session[] });
      return data?.sessions ?? [];
    },
    staleTime: STALE_MS,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.post('/api/v1/auth/sessions/revoke', { session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
    },
  });
}

// ── Tenants ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  use_case?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan?: string;
  hq_branch_name?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export const tenantKeys = { all: () => ['admin', 'tenants'] as const };

export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.all(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/tenants');
      // API returns pagination wrapper: { data: Tenant[], total, limit, page, hasMore }
      const body = (response as any).data;
      const items = body?.data ?? body ?? [];
      return Array.isArray(items) ? (items as Tenant[]) : [];
    },
    staleTime: STALE_MS,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; use_case?: string; contact_email?: string; metadata?: Record<string, any> }) => {
      const response = await apiClient.post('/api/v1/admin/tenants', payload);
      return (response as { data?: Tenant }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all() });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; slug: string; use_case?: string; contact_email?: string; metadata?: Record<string, any> }) => {
      const response = await apiClient.put(`/api/v1/admin/tenants/${id}`, payload);
      return (response as { data?: Tenant }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all() });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/admin/tenants/${id}`);
      return (response as { data?: any }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all() });
    },
  });
}

export function useProvisionTenantOAuthRedirects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiClient.post(
        `/api/v1/admin/tenants/${tenantId}/provision-oauth-redirects`,
        {}
      );
      return (response as { data?: any }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthClientKeys.all() });
    },
  });
}

// Payment gateways are owned by treasury-api/ui; auth-ui no longer exposes gateway CRUD.

// ── Tenant Member Management ─────────────────────────────────────────────────

export interface TenantMember {
  id: string;
  user_id: string;
  tenant_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  roles: string[];
  status: string;
  outlet_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  outlet_id?: string;
}

export interface PaginatedMembers {
  data: TenantMember[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface AddTenantMemberPayload {
  user_id?: string;
  email?: string;
  roles: string[];
  outlet_id?: string;
  // Direct-add fields (#3): when email is not an existing account, the backend
  // creates it and returns a one-time temp_password.
  name?: string;
  phone?: string;
  pin?: string;
  service?: string;
}

export interface AddTenantMemberResult {
  id: string;
  user_id: string;
  tenant_id: string;
  roles: string[];
  status: string;
  outlet_id?: string;
  temp_password?: string;
}

export const tenantMemberKeys = (tenantId: string) => ({
  all: () => ['tenant-members', tenantId] as const,
  list: (filters?: MemberFilters) => [...tenantMemberKeys(tenantId).all(), filters ?? {}] as const,
});

export function useTenantMembers(
  tenantId: string | undefined,
  enabled = true,
  filters: MemberFilters = {}
) {
  const { page = 1, limit = 20, search = '', role = '', status = '', outlet_id = '' } = filters;
  return useQuery({
    queryKey: tenantId ? tenantMemberKeys(tenantId).list(filters) : ['tenant-members'],
    queryFn: async (): Promise<PaginatedMembers> => {
      if (!tenantId) return { data: [], total: 0, page: 1, limit, hasMore: false };
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      if (outlet_id) params.set('outlet_id', outlet_id);
      const response = await apiClient.get(
        `/api/v1/admin/tenants/${tenantId}/members?${params.toString()}`
      );
      const raw = (response as { data?: unknown }).data ?? response;
      // Support both paginated { data, total, page, limit, hasMore } and legacy array
      if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
        return raw as PaginatedMembers;
      }
      const arr = Array.isArray(raw) ? (raw as TenantMember[]) : [];
      return { data: arr, total: arr.length, page: 1, limit: arr.length, hasMore: false };
    },
    enabled: enabled && !!tenantId,
    staleTime: STALE_MS,
    placeholderData: (prev) => prev,
  });
}

export function useAddTenantMember(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddTenantMemberPayload): Promise<AddTenantMemberResult> => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.post(
        `/api/v1/admin/tenants/${tenantId}/members`,
        payload
      );
      return ((response as { data?: unknown }).data ?? response) as AddTenantMemberResult;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: tenantMemberKeys(tenantId).all() });
      }
    },
  });
}

interface UpdateTenantMemberPayload {
  user_id: string;
  roles?: string[];
  outlet_id?: string;
  status?: string;
}

export function useUpdateTenantMember(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateTenantMemberPayload) => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const { user_id, ...data } = payload;
      const response = await apiClient.put(
        `/api/v1/admin/tenants/${tenantId}/members/${user_id}`,
        data
      );
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: tenantMemberKeys(tenantId).all() });
      }
    },
  });
}

// Tenant-scoped member lifecycle: active | suspended | deactivated | inactive (#3).
export function useSetTenantMemberStatus(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status, roles }: { userId: string; status: string; roles: string[] }) => {
      if (!tenantId) throw new Error('Tenant ID is required');
      // Include current roles so the PUT doesn't wipe them.
      const response = await apiClient.put(
        `/api/v1/admin/tenants/${tenantId}/members/${userId}`,
        { roles, status }
      );
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: tenantMemberKeys(tenantId).all() });
      }
    },
  });
}

// Sets a 4-digit service PIN for a member (POS/Inventory terminal login).
export function useSetMemberPin(tenantId: string | undefined) {
  return useMutation({
    mutationFn: async ({ userId, pin, service }: { userId: string; pin: string; service: string }) => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.post(
        `/api/v1/admin/tenants/${tenantId}/members/${userId}/service-pin`,
        { pin, service }
      );
      return (response as { data?: unknown }).data ?? response;
    },
  });
}

export function useRemoveTenantMember(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.delete(
        `/api/v1/admin/tenants/${tenantId}/members/${userId}`
      );
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: tenantMemberKeys(tenantId).all() });
      }
    },
  });
}

// Notification templates and providers are owned by notifications-api/ui; auth-ui redirects to notifications-ui.

// ── OAuth Clients ─────────────────────────────────────────────────────────────

export interface OAuthClient {
  id: string;
  client_id: string;
  client_secret?: string;
  name: string;
  redirect_uris: string[];
  allowed_scopes: string[];
  public: boolean;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export const oauthClientKeys = { all: () => ['admin', 'clients'] as const };

export function useOAuthClients() {
  return useQuery({
    queryKey: oauthClientKeys.all(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/clients');
      // API returns pagination wrapper: { data: OAuthClient[], total, limit, page, hasMore }
      const body = (response as any).data;
      const items = body?.data ?? body ?? [];
      return Array.isArray(items) ? (items as OAuthClient[]) : [];
    },
    staleTime: STALE_MS,
  });
}

export function useCreateOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { client_id: string; name: string; redirect_uris: string[]; scopes: string[]; public: boolean }) => {
      const response = await apiClient.post('/api/v1/admin/clients', payload);
      return (response as { data?: OAuthClient }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthClientKeys.all() });
    },
  });
}

export function useUpdateOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; redirect_uris?: string[]; scopes?: string[]; public?: boolean }) => {
      const response = await apiClient.patch(`/api/v1/admin/clients/${id}`, payload);
      return (response as { data?: OAuthClient }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthClientKeys.all() });
    },
  });
}

export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/admin/clients/${id}`);
      return (response as { data?: any }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthClientKeys.all() });
    },
  });
}

// ── Users (platform admin) ───────────────────────────────────────────────────

export interface UserMembership {
  tenant_id: string;
  roles: string[];
  status: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  status: string;
  primary_tenant_id?: string;
  profile?: Record<string, any>;
  last_login_at?: string;
  terms_accepted: boolean;
  memberships?: UserMembership[];
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  users: PlatformUser[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export const userKeys = {
  all: (params?: Record<string, string>) => ['admin', 'users', params ?? {}] as const,
  detail: (id: string) => ['admin', 'users', id] as const,
};

export function useAdminUsers(params: { status?: string; tenant_id?: string; search?: string; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.tenant_id) q.set('tenant_id', params.tenant_id);
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString();

  return useQuery({
    queryKey: userKeys.all(Object.fromEntries(q)),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/admin/users${qs ? '?' + qs : ''}`);
      // API returns pagination wrapper: { data: PlatformUser[], total, limit, page, hasMore }
      // Transform into UsersResponse shape that the users page expects.
      const body = (response as any).data;
      const total = body?.total ?? 0;
      const lim = body?.limit ?? 50;
      return {
        users: (body?.data ?? []) as PlatformUser[],
        pagination: {
          total,
          page: body?.page ?? 1,
          limit: lim,
          pages: lim > 0 ? Math.ceil(total / lim) : 1,
        },
      } as UsersResponse;
    },
    staleTime: STALE_MS,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<PlatformUser>(`/api/v1/admin/users/${id}`);
      return ((response as unknown as { data?: PlatformUser }).data ?? response) as PlatformUser;
    },
    enabled: !!id,
    staleTime: STALE_MS,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; email?: string; profile?: Record<string, any> }) => {
      const response = await apiClient.patch(`/api/v1/admin/users/${id}`, payload);
      return ((response as unknown as { data?: PlatformUser }).data ?? response) as PlatformUser;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.id) });
    },
  });
}

export function useAdminUserAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'deactivate' | 'activate' }) => {
      const response = await apiClient.post(`/api/v1/admin/users/${id}/${action}`, {});
      return (response as { data?: any }).data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export interface CreateUserResult {
  id: string;
  email: string;
  status: string;
  temp_password?: string;
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; name?: string; phone?: string; password?: string; primary_tenant_id?: string }): Promise<CreateUserResult> => {
      const response = await apiClient.post('/api/v1/admin/users', payload);
      return ((response as { data?: CreateUserResult }).data ?? response) as CreateUserResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: async ({ id, new_password }: { id: string; new_password?: string }): Promise<{ temp_password?: string }> => {
      const response = await apiClient.post(`/api/v1/admin/users/${id}/reset-password`, new_password ? { new_password } : {});
      return ((response as { data?: { temp_password?: string } }).data ?? response) as { temp_password?: string };
    },
  });
}

export function useAdminSendResetEmail() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/admin/users/${id}/send-password-reset`, {});
      return (response as { data?: unknown }).data ?? response;
    },
  });
}

export function useAdminSetMfaEnforcement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enforced }: { id: string; enforced: boolean }) => {
      const response = await apiClient.post(`/api/v1/admin/users/${id}/mfa-enforcement`, { enforced });
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.id) });
    },
  });
}

// Add a user (by user_id) to a tenant with roles — used by platform-admin
// membership editing. Reuses the tenant-members endpoint.
export function useAddUserToTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, userId, roles }: { tenantId: string; userId: string; roles: string[] }) => {
      const response = await apiClient.post(`/api/v1/admin/tenants/${tenantId}/members`, { user_id: userId, roles });
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export function useSetUserTenantRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, userId, roles }: { tenantId: string; userId: string; roles: string[] }) => {
      const response = await apiClient.put(`/api/v1/admin/tenants/${tenantId}/members/${userId}`, { roles });
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.userId) });
    },
  });
}

export function useRemoveUserFromTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, userId }: { tenantId: string; userId: string }) => {
      const response = await apiClient.delete(`/api/v1/admin/tenants/${tenantId}/members/${userId}`);
      return (response as { data?: unknown }).data ?? response;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}
