'use client';

import apiClient from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const STALE_MS = 5 * 60 * 1000;

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
      const response = await apiClient.get<Tenant[]>('/api/v1/admin/tenants');
      const data = (response as any).data ?? response;
      return Array.isArray(data) ? (data as Tenant[]) : [];
    },
    staleTime: STALE_MS,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; use_case?: string; contact_email?: string }) => {
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
    mutationFn: async ({ id, ...payload }: { id: string; name: string; slug: string; use_case?: string; contact_email?: string }) => {
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

// Payment gateways are owned by treasury-api/ui; auth-ui no longer exposes gateway CRUD.

// ── Tenant Member Management ─────────────────────────────────────────────────

export interface TenantMember {
  id: string;
  user_id: string;
  tenant_id: string;
  email?: string;
  name?: string;
  roles: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface AddTenantMemberPayload {
  user_id: string;
  roles: string[];
}

export const tenantMemberKeys = (tenantId: string) => ({
  all: () => ['tenant-members', tenantId] as const,
  list: () => [...tenantMemberKeys(tenantId).all()] as const,
});

export function useTenantMembers(tenantId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: tenantId ? tenantMemberKeys(tenantId).list() : ['tenant-members'],
    queryFn: async () => {
      if (!tenantId) return [];
      const response = await apiClient.get(`/api/v1/admin/tenants/${tenantId}/members`);
      const data = (response as { data?: unknown }).data ?? response;
      return Array.isArray(data) ? (data as TenantMember[]) : [];
    },
    enabled: enabled && !!tenantId,
    staleTime: STALE_MS,
  });
}

export function useAddTenantMember(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddTenantMemberPayload) => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.post(
        `/api/v1/admin/tenants/${tenantId}/members`,
        payload
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

export function useUpdateTenantMember(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddTenantMemberPayload & { user_id: string }) => {
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
      const response = await apiClient.get<OAuthClient[]>('/api/v1/admin/clients');
      const data = (response as any).data ?? response;
      return Array.isArray(data) ? (data as OAuthClient[]) : [];
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
      const response = await apiClient.get<UsersResponse>(`/api/v1/admin/users${qs ? '?' + qs : ''}`);
      return ((response as unknown as { data?: UsersResponse }).data ?? response) as UsersResponse;
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
