import { afterEach, describe, expect, it } from 'vitest';
import {
  applyUserTimeZone,
  formatDate,
  formatDateTime,
  formatTime,
  resolveTimeZone,
  setActiveTimeZone,
} from './user-timezone';

// 22:30 UTC on 13 Nov is already 14 Nov in Nairobi (UTC+3).
const LATE_UTC = '2026-11-13T22:30:00Z';

afterEach(() => {
  setActiveTimeZone('Africa/Nairobi');
});

describe('resolveTimeZone', () => {
  it('prefers the user zone, then the tenant zone, then Africa/Nairobi', () => {
    expect(resolveTimeZone({ profile: { timezone: 'Africa/Lagos' } }, { timezone: 'Europe/London' })).toBe('Africa/Lagos');
    expect(resolveTimeZone({ profile: {} }, { timezone: 'Europe/London' })).toBe('Europe/London');
    expect(resolveTimeZone(null, null)).toBe('Africa/Nairobi');
  });

  it('skips names the runtime does not know', () => {
    expect(resolveTimeZone({ profile: { timezone: 'Mars/Olympus' } }, { timezone: 'Asia/Dubai' })).toBe('Asia/Dubai');
  });
});

describe('formatters', () => {
  it('follow the zone set from /me', () => {
    applyUserTimeZone({ profile: { timezone: 'America/New_York' } }, { timezone: 'Africa/Nairobi' });
    expect(formatDate(LATE_UTC)).toBe('13 Nov 2026');
    expect(formatTime(LATE_UTC)).toBe('17:30');
  });

  it('keep the en-US look when asked', () => {
    expect(formatDate(LATE_UTC, undefined, { locale: 'en-US', year: 'numeric', month: 'short', day: 'numeric' })).toBe('Nov 14, 2026');
  });

  it('format epoch milliseconds and empty input', () => {
    expect(formatTime(Date.UTC(2026, 10, 13, 22, 30))).toBe('01:30');
    expect(formatDateTime(undefined)).toBe('');
  });
});
