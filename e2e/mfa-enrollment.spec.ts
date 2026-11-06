import { expect, test } from '@playwright/test';

import { mfaEnrollmentHref, safeSignInNext, signInAfterEnrollment } from '../src/lib/mfa-enrollment';

// The helpers need no browser or server.
test.describe('MFA enrolment links', () => {
  test('only the sign-in page is accepted as the way back', () => {
    expect(safeSignInNext('/login?tenant=hadia')).toBe('/login?tenant=hadia');
    expect(safeSignInNext('/login')).toBe('/login');
    for (const bad of ['https://evil.example/login', '//evil.example', '/loginx', '/dashboard', '', null, undefined]) {
      expect(safeSignInNext(bad)).toBe('/login');
    }
  });

  test('the setup link carries the way back, and never an outside address', () => {
    expect(mfaEnrollmentHref('/login?tenant=hadia')).toBe('/dashboard/security/2fa-setup?required=1&next=%2Flogin%3Ftenant%3Dhadia');
    expect(mfaEnrollmentHref('https://evil.example')).toBe('/dashboard/security/2fa-setup?required=1&next=%2Flogin');
  });

  test('back at sign-in the note replaces the reason and the flow is kept', () => {
    const url = new URL(signInAfterEnrollment('/login?tenant=hadia&reason=mfa_required', 'Ready'), 'https://x.test');
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('tenant')).toBe('hadia');
    expect(url.searchParams.get('message')).toBe('Ready');
    expect(url.searchParams.has('reason')).toBe(false);
  });
});

// These open real pages with the API mocked, so they only run against a local server: never the
// production default in playwright.config.ts. Set BASE_URL to run them.
test.describe('MFA screens', () => {
  test.skip(!process.env.BASE_URL, 'needs a local auth-ui (BASE_URL)');

  const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

  test('a covered sign-in without an authenticator goes to the required setup', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (r) =>
      r.fulfill(json({ access_token: 't', mfa_enrollment_required: true, roles: [], permissions: [], user: { id: 'u1', email: 'staff@example.com' } })));
    await page.route('**/api/v1/auth/me', (r) =>
      r.fulfill(json({ id: 'u1', email: 'staff@example.com', roles: [], permissions: [], mfa_enrollment_required: true })));
    await page.route('**/api/v1/auth/mfa/totp/start', (r) =>
      r.fulfill(json({ secret: 'ABC', provisioning: 'otpauth://totp/x?secret=ABC' })));

    await page.goto('/login?tenant=hadia');
    await page.getByRole('textbox', { name: /email/i }).fill('staff@example.com');
    await page.getByLabel('Password', { exact: true }).fill('correct horse');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await page.waitForURL(/\/dashboard\/security\/2fa-setup\?required=1/);
    await expect(page.getByRole('heading', { name: /set up your authenticator app to continue/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to security/i })).toHaveCount(0);
  });

  test('a platform owner edits the platform default', async ({ page }) => {
    let sent: unknown = null;
    await page.route('**/api/v1/auth/me', (r) =>
      r.fulfill(json({ id: 'o1', email: 'owner@example.com', roles: ['admin'], permissions: [], is_platform_owner: true })));
    await page.route('**/api/v1/admin/mfa-policy', (r) => {
      const empty = { required_roles: [], all_accounts: false };
      if (r.request().method() === 'PATCH') {
        sent = r.request().postDataJSON();
        return r.fulfill(json({ policy: sent, inherited: false, effective: sent, available_roles: ['hadia_admin'] }));
      }
      return r.fulfill(json({ policy: empty, inherited: false, effective: empty, available_roles: ['hadia_admin'] }));
    });

    await page.goto('/dashboard/platform/security/mfa-policy');
    await page.getByRole('switch', { name: 'hadia_admin' }).click();
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect.poll(() => sent).toEqual({ required_roles: ['hadia_admin'], all_accounts: false });
  });
});
