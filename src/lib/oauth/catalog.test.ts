import { describe, expect, it } from 'vitest';

import { getProviderById, oauthProviders } from './catalog';

describe('oauth catalog', () => {
  it('has unique provider ids', () => {
    const ids = oauthProviders.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('describes TikTok with client_key, a secret and the SSO callback', () => {
    const tiktok = getProviderById('tiktok');
    expect(tiktok).toBeDefined();
    const keys = tiktok!.fields.map((f) => f.key);
    expect(keys).toEqual(['client_key', 'client_secret', 'redirect_url']);
    expect(keys).not.toContain('client_id');
    expect(tiktok!.fields.find((f) => f.key === 'client_secret')?.secret).toBe(true);
    expect(tiktok!.fields.find((f) => f.key === 'redirect_url')?.default).toBe(
      'https://sso.codevertexafrica.com/api/v1/auth/oauth/tiktok/callback',
    );
  });

  it('marks every secret field as a password input', () => {
    for (const p of oauthProviders) {
      for (const f of p.fields.filter((x) => x.secret)) {
        expect(f.type).toBe('password');
      }
    }
  });
});
