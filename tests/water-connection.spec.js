import { test, expect } from '@playwright/test';

test.describe('Water Connection Application Flow', () => {
  test('form loads correctly', async ({ page }) => {
    await page.goto('/water-connection');

    await expect(page.getByRole('heading', { name: /नल कनेक्शन हेतु ऑनलाइन आवेदन पत्र/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /नया नल कनेक्शन आवेदन भरें/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ })).toBeVisible();
  });

  test('validation shows errors on empty submit', async ({ page }) => {
    await page.goto('/water-connection');

    await page.getByRole('button', { name: /आवेदन प्रस्तुत करें/ }).click();

    // Native HTML5 validation blocks submission
    await expect(page.getByRole('button', { name: /आवेदन प्रस्तुत करें/ })).toBeVisible();
    await expect(page.getByText(/सफलतापूर्वक|submitted!/)).toHaveCount(0);
  });

  test('form shows connection size and usage purpose fields', async ({ page }) => {
    await page.goto('/water-connection');

    // Connection size selector
    await expect(page.getByText(/कनेक्शन साइज \(Connection Size\)/)).toBeVisible();
    await expect(page.getByText(/जल उपयोग प्रयोजन \(Usage Purpose\)/)).toBeVisible();
  });

  test('document checklist available', async ({ page }) => {
    await page.goto('/water-connection');
    await page.getByRole('button', { name: /आवश्यक दस्तावेज चैकलिस्ट/ }).click();

    await expect(page.getByText(/जल \(नल\) कनेक्शन हेतु आवश्यक दस्तावेज/)).toBeVisible();
  });
});
