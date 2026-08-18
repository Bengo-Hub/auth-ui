'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMyPhone,
  changePassword,
  deleteMyEmail,
  deleteMyPhone,
  listMyEmails,
  listMyPhones,
  sendAddEmailCode,
  sendMyEmailCode,
  setPrimaryMyEmail,
  setPrimaryMyPhone,
  updateNotificationSettings,
  updateProfile,
  verifyAddEmailCode,
  verifyMyEmailCode,
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

/**
 * Email verification for the signed-in user. Verifying an address that differs from the
 * one on file REPLACES it — this is how accounts created with a placeholder email get a
 * real, proven one. Invalidates ['me'] so the banner/stage clears immediately.
 */
export function useVerifyMyEmail() {
  const queryClient = useQueryClient();
  const sendCode = useMutation({
    mutationFn: (email: string) => sendMyEmailCode(email),
  });
  const verifyCode = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyMyEmailCode(email, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
  return { sendCode, verifyCode };
}

// --- My Email Addresses / My Mobile Numbers ---

export function useMyEmails() {
  return useQuery({ queryKey: ['my-emails'], queryFn: listMyEmails, staleTime: 60 * 1000 });
}

export function useAddMyEmail() {
  const queryClient = useQueryClient();
  const sendCode = useMutation({ mutationFn: (email: string) => sendAddEmailCode(email) });
  const verifyCode = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyAddEmailCode(email, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-emails'] }),
  });
  return { sendCode, verifyCode };
}

export function useSetPrimaryMyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setPrimaryMyEmail(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-emails'] }),
  });
}

export function useDeleteMyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMyEmail(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-emails'] }),
  });
}

export function useMyPhones() {
  return useQuery({ queryKey: ['my-phones'], queryFn: listMyPhones, staleTime: 60 * 1000 });
}

export function useAddMyPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => addMyPhone(phone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-phones'] }),
  });
}

export function useSetPrimaryMyPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setPrimaryMyPhone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-phones'] }),
  });
}

export function useDeleteMyPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMyPhone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-phones'] }),
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
