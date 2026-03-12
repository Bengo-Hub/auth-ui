import { expect, test } from '@playwright/test';

const PLATFORM_ADMIN_EMAIL = process.env.E2E_PLATFORM_ADMIN_EMAIL || 'admin@codevertexitsolutions.com';
const PLATFORM_ADMIN_PASSWORD = process.env.E2E_PLATFORM_ADMIN_PASSWORD || 'ChangeMe123!';
const TENANT_ADMIN_EMAIL = process.env.E2E_TENANT_ADMIN_EMAIL || 'admin@theurbanloftcafe.com';
const TENANT_ADMIN_PASSWORD = process.env.E2E_TENANT_ADMIN_PASSWORD || 'TenantAdmin2024!';

test.describe('SSO RBAC and permissions', () => {
  test('platform admin can log in and sees nav or home', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(PLATFORM_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(PLATFORM_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 });
    await expect(page.locator('header').or(page.locator('nav')).first()).toBeVisible({ timeout: 5_000 });
  });

  test('tenant admin can log in and leaves login page (tenant resolved from user primary_tenant_id when no ?tenant= in URL)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(TENANT_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: /password/i }).fill(TENANT_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).not.toHaveURL(/\/login$/, { timeout: 20_000 });
  });

  test('unauthenticated user on dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
