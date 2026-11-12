/**
 * Time zones. SSO owns every person's and organisation's zone; the apps read them from /auth/me.
 * Sign-up starts from the zone the browser reports, so most people never have to choose.
 */

/** The fallback when the browser reports nothing useful: East Africa Time. */
export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

/** The zone this browser is set to, or Africa/Nairobi when it reports none or plain UTC. */
export function detectTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== 'UTC' && tz !== 'Etc/UTC') return tz;
  } catch {
    /* very old browsers */
  }
  return DEFAULT_TIMEZONE;
}

const COMMON = [
  'Africa/Nairobi', 'Africa/Kampala', 'Africa/Dar_es_Salaam', 'Africa/Kigali', 'Africa/Addis_Ababa',
  'Africa/Lagos', 'Africa/Accra', 'Africa/Johannesburg', 'Africa/Cairo', 'Europe/London', 'Asia/Dubai',
  'Asia/Kolkata', 'America/New_York',
];

/** Every zone the browser knows, the common East African ones first. */
export function timeZoneOptions(current?: string): string[] {
  let all: string[] = [];
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    all = intl.supportedValuesOf ? intl.supportedValuesOf('timeZone') : [];
  } catch {
    all = [];
  }
  const out = [...COMMON, ...all.filter((z) => !COMMON.includes(z))];
  if (current && !out.includes(current)) out.unshift(current);
  return out;
}

/** "Africa/Nairobi (GMT+3)" for a picker. */
export function timeZoneLabel(tz: string): string {
  try {
    const part = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part ? `${tz.replace(/_/g, ' ')} (${part.value})` : tz;
  } catch {
    return tz;
  }
}
