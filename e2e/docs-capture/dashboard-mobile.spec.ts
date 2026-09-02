import { devices, expect, test } from '@playwright/test';
import { login } from './lib/login';
import { screenshotWithCallouts } from './lib/annotate';
import { assetPath } from './lib/paths';

// Mobile counterpart to org-management.spec.ts's dashboard landing shot — split into its own
// file since devices['iPhone 13'] must be a top-level test.use(), not inside a describe block.
// Not a regression suite. Run with:
//   E2E_LOGIN_EMAIL=admin@demo.codevertexafrica.com E2E_LOGIN_PASSWORD=DemoAdmin2024! \
//   npx playwright test e2e/docs-capture/dashboard-mobile.spec.ts --project=chromium --reporter=list

test.use({ ...devices['iPhone 13'] });

const OUT = (name: string) => assetPath(name);

test('mobile dashboard — open menu', async ({ page }) => {
  await login(page);
  // A longer settle wait — the dashboard's own entrance animation plus the real "days until
  // disabled" email-verification banner both need a beat, and the real PWA "Install Codevertex
  // Account" prompt (shared-ui-lib's PwaInstallPrompt) can pop up over the bottom of the screen
  // a moment after load, covering the header/hamburger area of a documentation screenshot.
  await page.waitForTimeout(1800);

  const dismissInstall = page.getByRole('button', { name: 'Dismiss' });
  if (await dismissInstall.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await dismissInstall.click();
    await page.waitForTimeout(400);
  }

  // Confirmed live: the page can end up scrolled down a little by this point (the dismiss
  // click, or the Vera chat bubble mounting), which pushes the sticky header above the visible
  // viewport — the callout badge then points at a target that's genuinely off-screen. Reset
  // scroll position before measuring/screenshotting.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // The sidebar (DashboardSidebar.tsx) is `hidden lg:flex` — on mobile it's fully hidden, and
  // the header's hamburger (DashboardTopNav.tsx) is icon-only with no aria-label, so it isn't
  // reachable by accessible name. Target it as the first button inside the header instead.
  const openMenu = page.locator('header').getByRole('button').first();
  await screenshotWithCallouts(page, OUT('signing-in/03-dashboard-mobile.png'), [
    { locator: openMenu, number: 1, color: '#dc2626' },
  ]);
});
