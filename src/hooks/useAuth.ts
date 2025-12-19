'use client';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  roles: string[];
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    roles: string[];
  }>;
}

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();

  const { isLoading, error } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<User>('/api/v1/auth/me');
        setUser(response.data);
        return response.data;
      } catch (err) {
        logout();
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hasRole = (role: string, tenantSlug?: string) => {
    if (!user) return false;
    
    // System-wide roles
    if (user.roles.includes('admin') || user.roles.includes('super_admin')) return true;
    
    if (tenantSlug) {
      const tenant = user.tenants.find(t => t.slug === tenantSlug);
      return tenant?.roles.includes(role) || false;
    }
    
    return user.roles.includes(role);
  };

  return { 
    user, 
    isLoading, 
    hasRole,
    isAuthenticated: !!user,
    error 
  };
}
