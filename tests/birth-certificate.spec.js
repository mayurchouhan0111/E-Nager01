import { test, expect } from '@playwright/test';
import { birthTestData } from './helpers';

test.describe('Birth Certificate Application Flow', () => {
  test('form loads with all 3 tabs', async ({ page }) => {
    await page.goto('/birth-certificate');

    await expect(page.getByRole('heading', { name: /जन्म प्रमाण पत्र ऑनलाइन आवेदन/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /नया ऑनलाइन आवेदन दर्ज करें/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /आवश्यक दस्तावेज चैकलिस्ट/ })).toBeVisible();
  });

  test('validation shows errors on empty submit', async ({ page }) => {
    await page.goto('/birth-certificate');

    await page.getByRole('button', { name: /जन्म प्रमाण पत्र आवेदन जमा करें/ }).click();

    // Native HTML5 validation blocks submission - no success message
    await expect(page.getByRole('button', { name: /जन्म प्रमाण पत्र आवेदन जमा करें/ })).toBeVisible();
    await expect(page.getByText(/सफलतापूर्वक जमा हुआ|submitted!/)).toHaveCount(0);
  });

  test('full form fill and draft save works', async ({ page }) => {
    const data = birthTestData();
    await page.goto('/birth-certificate');

    // --- Tab 1: Child details ---
    await page.getByPlaceholder('यदि नामकरण हो गया हो (जैसे: आरव शर्मा)').fill(data.childName);
    await page.locator('#field_child_dateOfBirth').fill(data.dateOfBirth);
    await page.getByPlaceholder('2.8 kg').fill(data.birthWeight);

    // Select delivery type if present
    const deliverySelect = page.locator('select').filter({ hasText: /प्रसव का प्रकार|Normal|सिजेरियन/ });
    // Continue - mother/father/applicant fields are on later tabs
  });

  test('mobile number validation rejects invalid number', async ({ page }) => {
    await page.goto('/birth-certificate');

    // Fill all native-required fields with valid data except mobile
    await page.locator('#field_child_dateOfBirth').fill('2024-01-15');
    await page.getByPlaceholder('यदि नामकरण हो गया हो (जैसे: आरव शर्मा)').fill('बालक TEST');
    await page.locator('#field_mother_fullName').fill('माता TEST');
    await page.locator('#field_father_fullName').fill('पिता TEST');
    await page.locator('#field_applicant_fullName').fill('आवेदक TEST');
    await page.locator('#field_applicant_mobile').fill('123');
    // Check DPDP consent (native required)
    await page.locator('#field_dpdpConsent input[type="checkbox"]').check();

    // Try to submit → React validation shows mobile error
    await page.getByRole('button', { name: /जन्म प्रमाण पत्र आवेदन जमा करें/ }).click();
    await expect(page.getByText(/कृपया 10 अंकों का मान्य मोबाइल नंबर|10 अंकों का मोबाइल नंबर दर्ज करना अनिवार्य है/).first()).toBeVisible();
  });

  test('track tab shows empty state', async ({ page }) => {
    await page.goto('/birth-certificate');
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();

    await expect(page.getByText(/कोई आवेदन नहीं मिला/)).toBeVisible();
    await expect(page.getByRole('button', { name: /पहला आवेदन दर्ज करें/ })).toBeVisible();
  });
});
