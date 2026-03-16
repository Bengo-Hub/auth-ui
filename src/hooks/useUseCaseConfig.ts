'use client';

import apiClient from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface UseCaseConfig {
  use_case: string;
  features: string[];
  settings: Record<string, any>;
  display_name: string;
}

/**
 * useUseCaseConfig fetches the configuration for a specific use case
 * or the current tenant's use case if none is provided.
 */
export function useUseCaseConfig(useCase?: string) {
  const { user, isAuthenticated } = useAuth();
  
  // Try to determine the use case from the user profile if not provided
  const resolvedUseCase = useCase || (user?.profile as any)?.use_case;

  return useQuery({
    queryKey: ['use_case_config', resolvedUseCase],
    queryFn: async () => {
      const params = resolvedUseCase ? { use_case: resolvedUseCase } : {};
      const response = await apiClient.get<UseCaseConfig>('/api/v1/auth/use-case/config', {
        params,
      });
      return response.data;
    },
    // Only fetch if resolving config specifically or if we are authenticated
    // Note: The backend also handles unauthenticated requests by defaulting or resolving via context
    enabled: !!resolvedUseCase || isAuthenticated,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
