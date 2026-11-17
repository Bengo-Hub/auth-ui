'use client';

import { useAuth } from '@/hooks/useAuth';
import { isDeveloperOnly } from '@/lib/developer-access';

/** True for a signed-in account whose only roles are developer roles (never a platform owner). */
export function useDeveloperOnly(): boolean {
  const { user, isPlatformOwner } = useAuth();
  return !!user && !isPlatformOwner && isDeveloperOnly(user.roles, user.tenants);
}
