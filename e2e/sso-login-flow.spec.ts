import { expect, test } from '@playwright/test';

const DEMO_EMAIL = process.env.E2E_LOGIN_EMAIL || 'demo@bengobox.dev';
const DEMO_PASSWORD = process.env.E2E_LOGIN_PASSWORD || 'DemoUser2024!';

test.describe('SSO login flow', () => {
  test('login page loads and shows email/password form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|welcome back/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login with seeded demo user redirects away from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(DEMO_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).not.toHaveURL(/\/login$/, { timeout: 20_000 });
  });

  test('authenticated user sees home or dashboard content after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(DEMO_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 });
    await expect(page.locator('header').or(page.locator('nav')).first()).toBeVisible({ timeout: 5_000 });
  });
});
