import { describe, expect, it } from 'vitest';
import { credentialEnvironment, DEFAULT_GRACE_HOURS, graceRemaining, rotationBody } from './credential-rotation';

describe('rotationBody', () => {
  it('keeps the old credential for the default grace period', () => {
    expect(rotationBody(true)).toEqual({ grace_hours: DEFAULT_GRACE_HOURS });
    expect(DEFAULT_GRACE_HOURS).toBe(24);
  });
  it('stops the old credential at once', () => {
    expect(rotationBody(false)).toEqual({ grace_hours: 0 });
  });
});

describe('credentialEnvironment', () => {
  it('reads the live and test markers', () => {
    expect(credentialEnvironment('bng_cs_live_abc')).toBe('live');
    expect(credentialEnvironment('bng_cs_test_abc')).toBe('test');
    expect(credentialEnvironment('bng_app_live_abc')).toBe('live');
    expect(credentialEnvironment('bng_app_test_abc')).toBe('test');
  });
  it('treats older values without a marker as unmarked', () => {
    expect(credentialEnvironment('bng_cs_abc')).toBe('unmarked');
    expect(credentialEnvironment('bng_app_abc')).toBe('unmarked');
  });
  it('returns null for anything else', () => {
    expect(credentialEnvironment('')).toBeNull();
    expect(credentialEnvironment(undefined)).toBeNull();
    expect(credentialEnvironment('sk_live_abc')).toBeNull();
  });
});

describe('graceRemaining', () => {
  const now = new Date('2026-11-18T12:00:00Z');
  it('says hours for a day-long grace period', () => {
    expect(graceRemaining('2026-11-19T12:00:00Z', now)).toBe('in 24 hours');
    expect(graceRemaining('2026-11-18T13:00:00Z', now)).toBe('in 1 hour');
  });
  it('says minutes under an hour', () => {
    expect(graceRemaining('2026-11-18T12:40:00Z', now)).toBe('in 40 minutes');
    expect(graceRemaining('2026-11-18T12:00:30Z', now)).toBe('in 1 minute');
  });
  it('says days for long grace periods', () => {
    expect(graceRemaining('2026-11-25T12:00:00Z', now)).toBe('in 7 days');
  });
  it('is null once passed or when missing', () => {
    expect(graceRemaining('2026-11-18T11:00:00Z', now)).toBeNull();
    expect(graceRemaining(undefined, now)).toBeNull();
    expect(graceRemaining('not a date', now)).toBeNull();
  });
});
