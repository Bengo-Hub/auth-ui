import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

import { earliestEffectiveDate, publishErrorMessage } from './legal-admin';

describe('earliestEffectiveDate', () => {
  it('moves a time later in the day to the next date', () => {
    expect(earliestEffectiveDate('2026-11-28T19:10:00Z')).toBe('2026-11-29');
  });

  it('keeps an exact midnight UTC', () => {
    expect(earliestEffectiveDate('2026-11-28T00:00:00Z')).toBe('2026-11-28');
  });

  it('returns nothing for junk', () => {
    expect(earliestEffectiveDate('soon')).toBe('');
  });
});

describe('publishErrorMessage', () => {
  it('explains the notice rule', () => {
    const err = {
      response: {
        data: { code: 'notice_too_short', details: { min_notice_days: 14, earliest: '2026-11-28T19:10:00Z' } },
      },
    };
    expect(publishErrorMessage(err)).toBe(
      'The effective date must be at least 14 days away (2026-11-29 or later), unless you skip the notice.',
    );
  });

  it('falls back to the server message, then a generic one', () => {
    expect(publishErrorMessage({ response: { data: { code: 'x', error: 'boom' } } })).toBe('boom');
    expect(publishErrorMessage(new Error('network'))).toBe('Publishing failed. Please try again.');
  });
});
