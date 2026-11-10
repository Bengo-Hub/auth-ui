import { describe, expect, it } from 'vitest';
import { roleLabel } from './invitations';
import { isValidReturnUrl } from './utils';

describe('roleLabel', () => {
  it('reads roles as plain words', () => {
    expect(roleLabel(['marketflow_member'])).toBe('Marketflow member');
    expect(roleLabel(['cashier', 'store_manager'])).toBe('Cashier, Store manager');
    expect(roleLabel([])).toBe('Member');
  });
});

// Security audit H4: the invite email's link signs the person in and returns them here.
describe('invitations return path', () => {
  it('lets the sign-in return to the invitations page', () => {
    expect(isValidReturnUrl('/invitations')).toBe(true);
    expect(isValidReturnUrl('/invitationsx')).toBe(false);
  });
});
