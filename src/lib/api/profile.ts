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
  gender?: string;
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

/**
 * POST /api/v1/auth/me/email/send-code — emails a 6-digit code to the address the user
 * wants to prove. This may be a NEW address: SSO accounts provisioned with a placeholder
 * (e.g. <id>@unknown.local) use this to supply a real one.
 */
export async function sendMyEmailCode(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/email/send-code', { email });
}

/**
 * POST /api/v1/auth/me/email/verify-code — confirms the code. On success the address is
 * marked verified and, when it differs from the one on file, REPLACES it (auth-api emits
 * auth.user.updated so every service re-mirrors the new email).
 */
export async function verifyMyEmailCode(email: string, code: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/email/verify-code', { email, code });
}

// --- My Email Addresses / My Mobile Numbers (Zoho-style additional contact
// entries, distinct from the single primary User.email column above) ---

export interface UserEmail {
  id: string;
  email: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface UserPhone {
  id: string;
  phone: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

/** GET /api/v1/auth/me/emails */
export async function listMyEmails(): Promise<UserEmail[]> {
  const res = await apiClient.get('/api/v1/auth/me/emails');
  const raw = (res as { data?: { emails?: UserEmail[] } }).data ?? res;
  return (raw as { emails?: UserEmail[] }).emails ?? [];
}

/** POST /api/v1/auth/me/emails/send-code — proves ownership of a NEW additional address. */
export async function sendAddEmailCode(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/emails/send-code', { email });
}

/** POST /api/v1/auth/me/emails/verify-code — confirms the code and adds the address. */
export async function verifyAddEmailCode(email: string, code: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/emails/verify-code', { email, code });
}

/** POST /api/v1/auth/me/emails/{id}/primary */
export async function setPrimaryMyEmail(id: string): Promise<void> {
  await apiClient.post(`/api/v1/auth/me/emails/${id}/primary`, {});
}

/** DELETE /api/v1/auth/me/emails/{id} */
export async function deleteMyEmail(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/auth/me/emails/${id}`);
}

/** GET /api/v1/auth/me/phones */
export async function listMyPhones(): Promise<UserPhone[]> {
  const res = await apiClient.get('/api/v1/auth/me/phones');
  const raw = (res as { data?: { phones?: UserPhone[] } }).data ?? res;
  return (raw as { phones?: UserPhone[] }).phones ?? [];
}

/**
 * POST /api/v1/auth/me/phones — adds a number with NO verification step. This
 * platform has no SMS-OTP provider wired anywhere yet, so phones are stored
 * as unverified contact info only (a deliberate scope limit, not a bug).
 */
export async function addMyPhone(phone: string): Promise<void> {
  await apiClient.post('/api/v1/auth/me/phones', { phone });
}

/** POST /api/v1/auth/me/phones/{id}/primary */
export async function setPrimaryMyPhone(id: string): Promise<void> {
  await apiClient.post(`/api/v1/auth/me/phones/${id}/primary`, {});
}

/** DELETE /api/v1/auth/me/phones/{id} */
export async function deleteMyPhone(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/auth/me/phones/${id}`);
}
