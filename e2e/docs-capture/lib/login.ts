import type { Page } from '@playwright/test';

const DEMO_EMAIL = process.env.E2E_LOGIN_EMAIL || 'admin@demo.codevertexafrica.com';
const DEMO_PASSWORD = process.env.E2E_LOGIN_PASSWORD || 'DemoAdmin2024!';

/**
 * Plain email/password login — auth-ui has no PIN step (that's an inventory-ui/pos-ui-only
 * concept for terminal staff), so this is much simpler than inventory-ui's pinLogin(). Reuses
 * the exact locator pattern already proven in e2e/sso-login-flow.spec.ts.
 */
export async function login(page: Page, opts: { email?: string; password?: string } = {}) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(opts.email || DEMO_EMAIL);
  await page.getByRole('textbox', { name: /password/i }).fill(opts.password || DEMO_PASSWORD);
  // Exact match: an unanchored /sign in/i also matches the "Sign in with passkey" button below
  // the divider.
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // A successful password login with no registered WebAuthn credential shows a "Set up passkey"
  // interstitial modal BEFORE the redirect to /dashboard (PasskeySetupNudge.tsx) — the app defers
  // navigation until it's dismissed. Whether it shows depends on an async server-side credentials
  // check (LoginForm.tsx's doLogin), so its timing relative to the redirect isn't fixed: on a fast
  // check it can appear well within a couple of seconds, on a slow one it can take much longer, and
  // sometimes it never appears at all (nudge already dismissed recently, or credentials exist).
  // Race both possible outcomes instead of guessing a fixed wait for either — whichever happens
  // first wins immediately, so the common no-nudge path isn't stuck waiting out a timeout for a
  // modal that was never coming.
  const maybeLater = page.getByRole('button', { name: 'Maybe later' });
  const outcome = await Promise.race([
    maybeLater.waitFor({ state: 'visible', timeout: 20_000 }).then(() => 'nudge' as const),
    page
      .waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 })
      .then(() => 'redirected' as const),
  ]).catch(() => null);

  if (outcome === 'nudge') {
    await maybeLater.click();
    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 });
  }
}
