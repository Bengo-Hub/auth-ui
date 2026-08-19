'use client';

import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface IntegrationRequestRow {
  id: string;
  request_type: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed' | 'go_live_requested';
  created_at: string;
  admin_notes?: string;
}

export type DocsAccessStatus = 'none' | 'pending' | 'in_review' | 'approved' | 'rejected';

function requestTypeFor(resourceKey: string): string {
  return `docs_access_${resourceKey}`;
}

/**
 * Gates a developer-docs page (e.g. the notifications-api reference) behind the same
 * request/review workflow already used for eTIMS integration and app go-live — reuses
 * IntegrationRequest with a resource-specific request_type rather than a new table.
 */
export function useDocsAccess(resourceKey: string) {
  const { user, isPlatformOwner, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const requestType = requestTypeFor(resourceKey);

  const query = useQuery({
    queryKey: ['my-integration-requests'],
    queryFn: async () => {
      const res = await apiClient.get<IntegrationRequestRow[]>('/api/v1/integration-requests/mine');
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const mine = (query.data ?? []).filter((r) => r.request_type === requestType);
  // Most recent request for this resource wins (a rejected request can be re-requested).
  const latest = mine[0];
  const status: DocsAccessStatus = isPlatformOwner ? 'approved' : (latest?.status as DocsAccessStatus) ?? 'none';

  const requestAccess = useMutation({
    mutationFn: async (opts: { notes?: string; requesterName?: string; requesterEmail?: string; companyName?: string }) =>
      apiClient.post('/api/v1/integration-requests', {
        request_type: requestType,
        requester_name: opts.requesterName || user?.name || user?.email || 'Developer',
        requester_email: opts.requesterEmail || user?.email,
        company_name: opts.companyName,
        integration_mode: 'self_serve',
        notes: opts.notes || `Requesting developer docs access: ${resourceKey}.`,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-integration-requests'] }),
  });

  return {
    isLoggedIn: !!user,
    isLoading: authLoading || (!!user && query.isLoading),
    status,
    requestAccess,
  };
}
