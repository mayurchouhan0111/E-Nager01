import { test, expect } from '@playwright/test';
import { deathTestData } from './helpers';

test.describe('Death Certificate Application Flow', () => {
  test('form loads correctly', async ({ page }) => {
    await page.goto('/death-certificate');

    await expect(page.getByRole('heading', { name: /मृतक प्रमाण पत्र ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /नया ऑनलाइन आवेदन दर्ज करें/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ })).toBeVisible();
  });

  test('validation shows errors on empty submit', async ({ page }) => {
    await page.goto('/death-certificate');

    await page.getByRole('button', { name: /ऑनलाइन आवेदन जमा करें/ }).click();

    // Native HTML5 validation blocks submission
    await expect(page.getByRole('button', { name: /ऑनलाइन आवेदन जमा करें/ })).toBeVisible();
    await expect(page.getByText(/सफलतापूर्वक|submitted!/)).toHaveCount(0);
  });

  test('future death date is rejected', async ({ page }) => {
    await page.goto('/death-certificate');

    // Fill native-required fields so HTML5 validation passes
    await page.locator('#field_deceased_fullName').fill('मृतक TEST');
    await page.locator('#field_deceased_dateOfDeath').fill('2099-01-01');
    await page.getByPlaceholder('आपका नाम').fill('आवेदक TEST');
    await page.getByPlaceholder('98XXXXXXXX').fill('9876543210');
    // Check DPDP consent (native required, second checkbox)
    await page.locator('input[type="checkbox"]').last().check();

    await page.getByRole('button', { name: /ऑनलाइन आवेदन जमा करें/ }).click();

    await expect(page.getByText(/मृत्यु की तिथि भविष्य की नहीं हो सकती/).first()).toBeVisible();
  });

  test('track tab shows empty state', async ({ page }) => {
    await page.goto('/death-certificate');
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();

    await expect(page.getByText(/कोई आवेदन नहीं मिला/)).toBeVisible();
  });

  test('form has all required document upload sections', async ({ page }) => {
    await page.goto('/death-certificate');

    // Document uploaders should be present
    await expect(page.getByText(/मृतक का आधार कार्ड/).first()).toBeVisible();
    await expect(page.getByText(/सूचनादाता का आधार कार्ड/).first()).toBeVisible();
  });
});
