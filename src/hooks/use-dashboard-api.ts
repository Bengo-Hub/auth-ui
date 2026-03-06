'use client';

import apiClient from '@/lib/api-client';
import { treasuryApi } from '@/lib/service-clients';
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

// ── Platform gateways (via treasury service) ──────────────────────────────────

export const gatewayKeys = { all: () => ['platform', 'gateways'] as const };

export function usePlatformGateways() {
  return useQuery({
    queryKey: gatewayKeys.all(),
    queryFn: async () => {
      const response = await treasuryApi.get<unknown>('/api/v1/platform/gateways');
      const data = (response as { data?: unknown }).data ?? response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: STALE_MS,
  });
}
