'use client';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Logout that clears server session, Zustand store, and React Query cache
 * so the UI (e.g. Navbar) immediately shows "Log In" / "Start Free" instead of "Dashboard".
 * Without clearing the 'me' query cache, query.data can still hold the previous user.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Proceed to clear local state even if server call fails (e.g. already logged out)
    }
    useAuthStore.getState().logout();
    queryClient.removeQueries({ queryKey: ['me'] });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };
}
