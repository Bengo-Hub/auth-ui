import { describe, expect, it } from 'vitest';

import { isLastSignInMethod, type LinkedIdentity } from '@/components/settings/SignInMethodsSection';

import { socialLinkHint } from './link-hint';

describe('socialLinkHint', () => {
  it('names the provider after an organisation refusal', () => {
    expect(socialLinkHint('you do not have access to this organisation', 'tiktok')).toBe(
      'Already have an account? Sign in with your email, then link TikTok in Account settings.',
    );
  });

  it('shows for an email the provider cannot vouch for', () => {
    expect(socialLinkHint('an account with this email already exists: sign in with your email, then link this provider in Account settings', 'microsoft')).toContain('link Microsoft');
  });

  it('stays quiet for other errors or without a provider', () => {
    expect(socialLinkHint('access_denied', 'google')).toBeNull();
    expect(socialLinkHint('you do not have access to this organisation', null)).toBeNull();
    expect(socialLinkHint(null, 'google')).toBeNull();
  });
});

describe('isLastSignInMethod', () => {
  const one = [{ id: '1', provider: 'google' } as LinkedIdentity];
  it('protects the only method of a password-less account', () => {
    expect(isLastSignInMethod(one, false)).toBe(true);
    expect(isLastSignInMethod([...one, { id: '2', provider: 'tiktok' } as LinkedIdentity], false)).toBe(false);
    expect(isLastSignInMethod(one, true)).toBe(false);
  });
});
