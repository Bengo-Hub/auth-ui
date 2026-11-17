/**
 * Helpers for rotating an App's consumer secret or API key with a grace period. auth-api keeps
 * the replaced credential working for `grace_hours` (24 by default, 0 stops it at once) and
 * reports when it stops in `previous_client_secret_expires_at` / `previous_key_expires_at`.
 */

/** Hours the old credential keeps working when the developer keeps it (the server default). */
export const DEFAULT_GRACE_HOURS = 24;

/** Request body for POST /admin/apps/{id}/rotate and /rotate-secret. */
export function rotationBody(keepOld: boolean): { grace_hours: number } {
  return { grace_hours: keepOld ? DEFAULT_GRACE_HOURS : 0 };
}

/**
 * Which environment a secret or key was issued for, read from its prefix:
 * bng_cs_live_ / bng_app_live_ are production, bng_cs_test_ / bng_app_test_ are sandbox.
 * Values issued before the markers existed are "unmarked"; they still work.
 */
export function credentialEnvironment(value: string | undefined | null): 'live' | 'test' | 'unmarked' | null {
  if (!value) return null;
  const m = /^bng_(?:cs|app)_(live|test)_/.exec(value);
  if (m) return m[1] as 'live' | 'test';
  return value.startsWith('bng_') ? 'unmarked' : null;
}

/**
 * Plain wording for how long a replaced credential still works, e.g. "in 23 hours",
 * "in 40 minutes". Returns null once the time has passed or when there is no time.
 */
export function graceRemaining(expiresAt: string | undefined | null, now: Date = new Date()): string | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return null;
  const ms = end - now.getTime();
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `in ${days} days`;
}
