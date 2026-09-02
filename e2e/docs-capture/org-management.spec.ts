import { expect, test } from '@playwright/test';
import { login } from './lib/login';
import { screenshotWithCallouts } from './lib/annotate';
import { assetPath } from './lib/paths';

// Documentation screenshots for shared-docs' new "Account & Organisation" guide — signing in via
// the centralized SSO portal (accounts.codevertexafrica.com) and the "My Organization" hub tenant
// admins use to manage branding, branches, team/staff, billing, and support. Not a regression
// suite. Run with:
//   E2E_LOGIN_EMAIL=admin@demo.codevertexafrica.com E2E_LOGIN_PASSWORD=DemoAdmin2024! \
//   npx playwright test e2e/docs-capture --project=chromium --reporter=list
//
// This app is a marketing-styled landing/dashboard with framer-motion entrance animations
// throughout — resolving a callout's position mid-animation puts the badge visibly off the
// settled field, so every annotated shot below waits ~600-800ms after the triggering
// navigation/click before measuring anything.

const OUT = (name: string) => assetPath(name);

// Taller than the default Desktop Chrome viewport so the Team Members table (and other
// long single-scroll tabs like Branding) render without needing an extra scroll step first.
test.use({ viewport: { width: 1440, height: 1200 } });

test.describe('Docs capture: Signing in', () => {
  test('login page', async ({ page }) => {
    await page.goto('/login');
    const email = page.getByRole('textbox', { name: /email/i });
    const password = page.getByRole('textbox', { name: /password/i });
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(email).toBeVisible();
    await page.waitForTimeout(800);
    await screenshotWithCallouts(page, OUT('signing-in/01-login-form.png'), [
      { locator: email, number: 1 },
      { locator: password, number: 2 },
      { locator: signIn, number: 3 },
    ]);
  });

  test('signed in — dashboard landing', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(600);
    const sidebarNav = page.getByRole('navigation').first();
    await screenshotWithCallouts(page, OUT('signing-in/02-dashboard.png'), [{ locator: sidebarNav, number: 1 }]);
  });
});

test.describe('Docs capture: Managing Your Organisation', () => {
  test('Overview tab', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await expect(page.getByRole('heading', { name: 'My Organization' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/01-overview.png'), []);
  });

  test('Branding tab', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Branding', exact: true }).click();
    await page.waitForTimeout(800);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/02-branding.png'), []);
  });

  test('Branches tab — Add Branch form', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Branches', exact: true }).click();
    await expect(page.getByText('Branches & Outlets')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/03-branches-list.png'), []);

    await page.getByRole('button', { name: 'Add Branch' }).click();
    const nameInput = page.getByPlaceholder('Westlands Branch');
    // exact: true — "WESTLANDS" is otherwise a case-insensitive substring of the Name field's
    // own placeholder ("Westlands Branch"), matching both.
    const codeInput = page.getByPlaceholder('WESTLANDS', { exact: true });
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Docs Example Branch');
    await codeInput.fill('DOCS');
    await page.waitForTimeout(500);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/04-add-branch.png'), [
      { locator: nameInput, number: 1 },
      { locator: codeInput, number: 2 },
    ]);
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Team tab — Add Member form', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Team', exact: true }).click();
    await expect(page.getByText('Add Member')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);

    const emailInput = page.getByPlaceholder('colleague@company.com');
    const pinInput = page.getByPlaceholder('POS PIN');
    await emailInput.fill('docs-example@example.com');
    await screenshotWithCallouts(page, OUT('managing-your-organisation/05-add-member.png'), [
      { locator: emailInput, number: 1 },
      { locator: pinInput, number: 2, color: '#dc2626' },
    ]);

    // Don't submit — this would really create/invite an account. Clear the field instead.
    await emailInput.fill('');

    // The actual Team Members list sits below the Add Member card — scroll it into view so this
    // screenshot shows what its filename promises, not a second copy of the Add Member form.
    const membersHeading = page.getByRole('heading', { name: 'Team Members' });
    await membersHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/06-team-members-list.png'), []);
  });

  test('Team tab — Set PIN dialog', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Team', exact: true }).click();
    await expect(page.getByText('Add Member')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);

    const setPinBtn = page.getByRole('button', { name: /set pin/i }).first();
    if (await setPinBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await setPinBtn.click();
      const pinField = page.getByPlaceholder('••••');
      await expect(pinField).toBeVisible({ timeout: 5_000 });
      await pinField.fill('1234');
      await page.waitForTimeout(500);
      await screenshotWithCallouts(page, OUT('managing-your-organisation/07-set-pin-dialog.png'), [
        { locator: pinField, number: 1, color: '#dc2626' },
      ]);
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });

  test('Billing tab', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Billing', exact: true }).click();
    await page.waitForTimeout(600);
    // Plan cards render as animate-pulse skeletons until pricing data loads — an 800ms flat wait
    // sometimes captured the skeletons, not the real cards.
    await page.locator('.animate-pulse').first().waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(500);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/08-billing.png'), []);
  });

  test('Support tab', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/my-tenant');
    await page.getByRole('button', { name: 'Support', exact: true }).click();
    await expect(page.getByText('Vera AI Support')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);
    await screenshotWithCallouts(page, OUT('managing-your-organisation/09-support.png'), []);
  });
});
