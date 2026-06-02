'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  updateNotificationSettings,
  updateProfile,
  type NotificationSettings,
  type ProfileUpdate,
} from '@/lib/api/profile';
import { useAuthStore } from '@/store/auth-store';

// Merges the PATCH /me response back into the auth store and refreshes the
// cached ['me'] query so every consumer (navbar, profile tabs) stays in sync.
function useApplyUpdatedUser() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  return (updated: Record<string, unknown> | undefined) => {
    if (updated && user) {
      setUser({
        ...user,
        ...(updated as Record<string, unknown>),
        roles: (updated as { roles?: string[] }).roles ?? user.roles ?? [],
        permissions: (updated as { permissions?: string[] }).permissions ?? user.permissions ?? [],
        tenants: (updated as { tenants?: unknown[] }).tenants ?? user.tenants ?? [],
      } as typeof user);
    }
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };
}

export function useUpdateProfile() {
  const apply = useApplyUpdatedUser();
  return useMutation({
    mutationFn: (payload: ProfileUpdate) => updateProfile(payload),
    onSuccess: (data) => apply(data),
  });
}

export function useUpdateNotificationSettings() {
  const apply = useApplyUpdatedUser();
  return useMutation({
    mutationFn: (settings: NotificationSettings) => updateNotificationSettings(settings),
    onSuccess: (data) => apply(data),
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      // Clears must_change_password gating on next /me load.
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
