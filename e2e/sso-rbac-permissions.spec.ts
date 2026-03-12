import { expect, test } from '@playwright/test';

const PLATFORM_ADMIN_EMAIL = process.env.E2E_PLATFORM_ADMIN_EMAIL || 'admin@codevertexitsolutions.com';
const PLATFORM_ADMIN_PASSWORD = process.env.E2E_PLATFORM_ADMIN_PASSWORD || 'ChangeMe123!';
const TENANT_ADMIN_EMAIL = process.env.E2E_TENANT_ADMIN_EMAIL || 'admin@theurbanloftcafe.com';
const TENANT_ADMIN_PASSWORD = process.env.E2E_TENANT_ADMIN_PASSWORD || 'TenantAdmin2024!';

test.describe('SSO RBAC and permissions', () => {
  test('platform admin can log in and navbar shows Dashboard, not Log In / Start Free', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(PLATFORM_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(PLATFORM_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 });
    const nav = page.locator('nav').first();
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible({ timeout: 10_000 });
    await expect(nav.getByRole('link', { name: /log in/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /start free|get started/i })).not.toBeVisible();
  });

  test('tenant admin can log in with email and password only (no tenant in URL; backend resolves org from user)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(TENANT_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TENANT_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).not.toHaveURL(/\/login$/, { timeout: 20_000 });
  });

  test('tenant admin after login sees Dashboard in navbar and not Log In / Start Free', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(TENANT_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TENANT_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 });
    const nav = page.locator('nav').first();
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible({ timeout: 10_000 });
    await expect(nav.getByRole('link', { name: /log in/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /start free|get started/i })).not.toBeVisible();
  });

  test('unauthenticated user on dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
