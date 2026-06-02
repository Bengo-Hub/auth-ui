/**
 * Self-service profile / account API.
 * Wraps the shared apiClient (session-cookie auth) against auth-api's
 * /api/v1/auth/me endpoints. Consumed via the TanStack Query hooks in
 * hooks/useProfile.ts — pages should not call apiClient directly.
 */

import apiClient from '@/lib/api-client';

export interface NotificationSettings {
  email_marketing?: boolean;
  email_security?: boolean;
  email_account?: boolean;
  sms_alerts?: boolean;
  push_notifications?: boolean;
  whatsapp_updates?: boolean;
  [key: string]: boolean | undefined;
}

export interface ProfileUpdate {
  name?: string;
  profile_picture_url?: string;
  phone?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  locale?: string;
  preferences?: Record<string, unknown>;
  notification_settings?: NotificationSettings;
}

/** PATCH /api/v1/auth/me — merges the supplied fields into the user's profile. */
export async function updateProfile(payload: ProfileUpdate): Promise<Record<string, unknown>> {
  const res = await apiClient.patch('/api/v1/auth/me', payload);
  return ((res as { data?: Record<string, unknown> }).data ?? res) as Record<string, unknown>;
}

/** PATCH /api/v1/auth/me with only notification_settings. */
export async function updateNotificationSettings(settings: NotificationSettings): Promise<Record<string, unknown>> {
  return updateProfile({ notification_settings: settings });
}

/** POST /api/v1/auth/me/change-password — requires the current password. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
