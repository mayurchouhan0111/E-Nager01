import { test, expect } from '@playwright/test';

test.describe('Homepage - All Services & Navigation', () => {
  test('hero buttons navigate to all 4 services', async ({ page }) => {
    await page.goto('/');

    // Verify hero section shows
    await expect(page.getByRole('heading', { name: /नगर पालिका नागरिक ई-सेवाएँ/ })).toBeVisible();

    // All 4 service hero buttons
    const deathBtn = page.getByRole('link', { name: /मृत्यु प्रमाण पत्र/ }).first();
    const birthBtn = page.getByRole('link', { name: /जन्म प्रमाण पत्र/ }).first();
    const waterBtn = page.getByRole('link', { name: /जल कनेक्शन आवेदन/ }).first();
    const noduesBtn = page.getByRole('link', { name: /नो ड्यूज प्रमाण पत्र/ }).first();

    await expect(deathBtn).toBeVisible();
    await expect(birthBtn).toBeVisible();
    await expect(waterBtn).toBeVisible();
    await expect(noduesBtn).toBeVisible();

    // Click each and verify navigation
    await deathBtn.click();
    await expect(page).toHaveURL(/\/death-certificate/);
    await page.goBack();

    await page.getByRole('link', { name: /जन्म प्रमाण पत्र/ }).first().click();
    await expect(page).toHaveURL(/\/birth-certificate/);
    await page.goBack();

    await page.getByRole('link', { name: /जल कनेक्शन आवेदन/ }).first().click();
    await expect(page).toHaveURL(/\/water-connection/);
    await page.goBack();

    await page.getByRole('link', { name: /नो ड्यूज प्रमाण पत्र/ }).first().click();
    await expect(page).toHaveURL(/\/no-dues-certificate/);
  });

  test('all 4 service cards are visible on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /हमारी ऑनलाइन नागरिक सेवाएँ/ })).toBeVisible();

    // Service card headings
    await expect(page.getByRole('heading', { name: /मृत्यु प्रमाण पत्र ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /जन्म प्रमाण पत्र ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /जल \(नल\) कनेक्शन ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /नो ड्यूज प्रमाण पत्र/ })).toBeVisible();
  });

  test('document checklist tabs work', async ({ page }) => {
    await page.goto('/');

    // Scroll to checklist section
    const allTab = page.getByRole('button', { name: /सभी सूची/ });
    await expect(allTab).toBeVisible();

    await page.getByRole('button', { name: /जन्म प्रमाण पत्र/ }).click();
    await expect(page.getByText(/जन्म प्रमाण पत्र \(घर पर जन्म होने पर\)/)).toBeVisible();

    await page.getByRole('button', { name: /मृत्यु प्रमाण पत्र/ }).click();
    await expect(page.getByText(/मृत्यु प्रमाण पत्र \(घर पर मृत्यु होने पर\)/)).toBeVisible();

    await page.getByRole('button', { name: /जल कनेक्शन/ }).click();
    await expect(page.getByText(/जल \(नल\) कनेक्शन हेतु आवश्यक दस्तावेज/)).toBeVisible();
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    // Wait for main content to render instead of networkidle (Firebase keeps connections open)
    await expect(page.getByRole('heading', { name: /हमारी ऑनलाइन नागरिक सेवाएँ/ })).toBeVisible();
    await page.waitForTimeout(2000);

    expect(errors).toEqual([]);
  });
});
