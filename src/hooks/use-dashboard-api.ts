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

// ── Platform gateways (via auth-api integration configs) ──────────────────────

export const gatewayKeys = { all: () => ['platform', 'gateways'] as const };

export function usePlatformGateways() {
  return useQuery({
    queryKey: gatewayKeys.all(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/integrations?service=payment_gateway');
      const data = (response as { data?: unknown }).data ?? response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: STALE_MS,
  });
}

// ── Tenant Member Management ─────────────────────────────────────────────────

export interface TenantMember {
  id: string;
  user_id: string;
  tenant_id: string;
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

// ── Notification Providers ───────────────────────────────────────────────────

export interface NotificationProvider {
  id: string;
  channel: string;
  provider_name: string;
  is_active: boolean;
  is_primary: boolean;
  status: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const notificationKeys = { all: () => ['notification-providers'] as const };

export function useNotificationProviders() {
  return useQuery({
    queryKey: notificationKeys.all(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/integrations?service=notification_provider');
      const data = (response as { data?: unknown }).data ?? response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: STALE_MS,
  });
}
