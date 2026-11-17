import { describe, expect, it } from 'vitest';
import { isDeveloperOnly } from './developer-access';
import { safeSignInNext } from './mfa-enrollment';

describe('isDeveloperOnly', () => {
  it('is true when every role is a developer role', () => {
    expect(isDeveloperOnly(['developer'], [{ roles: ['developer'] }])).toBe(true);
  });
  it('is false when any membership holds another role', () => {
    expect(isDeveloperOnly(['developer'], [{ roles: ['cashier'] }])).toBe(false);
    expect(isDeveloperOnly(['admin', 'developer'], [])).toBe(false);
  });
  it('is false for an account with no roles', () => {
    expect(isDeveloperOnly([], [])).toBe(false);
    expect(isDeveloperOnly(undefined, undefined)).toBe(false);
  });
});

describe('safeSignInNext', () => {
  it('keeps the developer sign-in page', () => {
    expect(safeSignInNext('/developer/login?return_to=%2Fdashboard%2Fdeveloper')).toBe('/developer/login?return_to=%2Fdashboard%2Fdeveloper');
  });
  it('still refuses anything else', () => {
    expect(safeSignInNext('/developer/apply')).toBe('/login');
    expect(safeSignInNext('//evil.example/login')).toBe('/login');
    expect(safeSignInNext('/loginx')).toBe('/login');
  });
});
