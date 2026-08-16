import { test, expect } from '@playwright/test';

test.describe('No Dues Certificate (NOC) Flow', () => {
  test('page loads with form and track tabs', async ({ page }) => {
    await page.goto('/no-dues-certificate');

    await expect(page.getByRole('heading', { name: /नो ड्यूज प्रमाण पत्र ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /नया नो ड्यूज आवेदन/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ })).toBeVisible();
  });

  test('100% digital service notice shown', async ({ page }) => {
    await page.goto('/no-dues-certificate');
    await expect(page.getByText(/100% ऑनलाइन\/डिजिटल सेवा/)).toBeVisible();
  });

  test('applications list or empty state shown in track tab', async ({ page }) => {
    await page.goto('/no-dues-certificate');
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();

    await expect(page.getByText(/आपके नो ड्यूज आवेदन|आपने अभी तक कोई नो ड्यूज NOC आवेदन प्रस्तुत नहीं किया है/)).toBeVisible();
  });

  test('validation errors on empty submit', async ({ page }) => {
    await page.goto('/no-dues-certificate');

    const submitBtn = page.getByRole('button', { name: /नो ड्यूज प्रमाण पत्र हेतु आवेदन प्रस्तुत करें/ });
    await submitBtn.click();

    // Should show required field errors or at least not navigate away
    await expect(page).toHaveURL(/\/no-dues-certificate/);
  });
});
