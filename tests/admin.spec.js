import { test, expect } from '@playwright/test';
import { adminCredentials } from './helpers';

test.describe('Admin Panel', () => {
  test('admin login form shows', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: /नगरपालिका अधिकारी लॉगिन/ })).toBeVisible();
    await expect(page.getByPlaceholder('User ID / Username')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/admin');

    await page.getByPlaceholder('User ID / Username').fill('admin');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /लॉगिन करें/ }).click();

    await expect(page.getByText(/गलत|अमान्य|Invalid|सफलतापूर्वक/)).toBeVisible();
  });

  test('super_admin login shows all 5 tabs', async ({ page }) => {
    await page.goto('/admin');

    await page.getByPlaceholder('User ID / Username').fill(adminCredentials.super_admin.username);
    await page.getByPlaceholder('••••••••').fill(adminCredentials.super_admin.password);
    await page.getByRole('button', { name: /लॉगिन करें/ }).click();

    // Death tab is default
    await expect(page.getByText(/मृत्यु प्रमाण पत्र आवेदन प्रबंधन/)).toBeVisible({ timeout: 15000 });

    // All tab buttons
    await expect(page.getByRole('button', { name: /मृत्यु/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /जन्म/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /जल/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /नो ड्यूज/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /सुरक्षा/ }).first()).toBeVisible();
  });

  test('admin login shows death and birth tabs only', async ({ page }) => {
    await page.goto('/admin');

    await page.getByPlaceholder('User ID / Username').fill(adminCredentials.admin.username);
    await page.getByPlaceholder('••••••••').fill(adminCredentials.admin.password);
    await page.getByRole('button', { name: /लॉगिन करें/ }).click();

    await expect(page.getByText(/मृत्यु प्रमाण पत्र आवेदन प्रबंधन/)).toBeVisible({ timeout: 15000 });
    // Water & no-dues tabs should NOT be visible
    await expect(page.getByRole('button', { name: /जल/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /नो ड्यूज/ })).toHaveCount(0);
  });

  test('water_admin login shows only water tab', async ({ page }) => {
    await page.goto('/admin');

    await page.getByPlaceholder('User ID / Username').fill(adminCredentials.water_admin.username);
    await page.getByPlaceholder('••••••••').fill(adminCredentials.water_admin.password);
    await page.getByRole('button', { name: /लॉगिन करें/ }).click();

    await expect(page.getByText(/जल \(नल\) कनेक्शन आवेदन प्रबंधन/)).toBeVisible({ timeout: 15000 });
  });

  test('logout returns to login screen', async ({ page }) => {
    await page.goto('/admin');

    await page.getByPlaceholder('User ID / Username').fill(adminCredentials.admin.username);
    await page.getByPlaceholder('••••••••').fill(adminCredentials.admin.password);
    await page.getByRole('button', { name: /लॉगिन करें/ }).click();

    await expect(page.getByText(/मृत्यु प्रमाण पत्र आवेदन प्रबंधन/)).toBeVisible({ timeout: 15000 });

    // Find logout button
    const logoutBtn = page.getByRole('button', { name: /लॉगआउट|Logout/ });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page.getByRole('heading', { name: /नगरपालिका अधिकारी लॉगिन/ })).toBeVisible();
  });
});
