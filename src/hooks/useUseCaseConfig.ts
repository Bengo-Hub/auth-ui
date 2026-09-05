'use client';

import apiClient from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface UseCaseConfig {
  use_case: string;
  features: string[];
  settings: Record<string, any>;
  display_name: string;
  /** Downstream services this use case applies to, e.g. ["pos-api", "inventory-api"]. */
  applicable_services?: string[];
}

/**
 * useUseCaseConfig fetches the configuration for a specific use case, or — when
 * called with no argument — the CURRENT TENANT's use case(s), resolved server-side
 * from the session (GetUseCaseConfig reads claims.TenantSlug and unions every
 * use_case a multi-vertical tenant has selected). Never read `user.profile.use_case`
 * here: that's a user-level field, not the tenant's, and would silently bypass the
 * backend's own correct resolution for the (common) no-argument call.
 */
export function useUseCaseConfig(useCase?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['use_case_config', useCase ?? 'session-tenant'],
    queryFn: async () => {
      const params = useCase ? { use_case: useCase } : {};
      const response = await apiClient.get<UseCaseConfig>('/api/v1/auth/use-case/config', {
        params,
      });
      return response.data;
    },
    // Only fetch if resolving config specifically or if we are authenticated
    // Note: The backend also handles unauthenticated requests by defaulting or resolving via context
    enabled: !!useCase || isAuthenticated,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
