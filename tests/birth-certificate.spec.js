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

    // ── Section 1: Child details ────────────────────────────
    await page.getByPlaceholder('यदि नामकरण हो गया हो (जैसे: आरव शर्मा)').fill(data.childName);
    await page.locator('#field_child_dateOfBirth').fill(data.dateOfBirth);
    await page.getByPlaceholder('2.8 kg').fill(data.birthWeight);
    await page.locator('select').filter({ hasText: 'Cesarean' })
      .selectOption({ label: 'सिजेरियन (Cesarean)' });

    // ── Section 2: Place of birth & address ─────────────────
    await page.getByPlaceholder('जिला चिकित्सालय झाबुआ / निजी अस्पताल').fill('जिला चिकित्सालय झाबुआ');

    // ── Section 3: Mother details ───────────────────────────
    await page.locator('#field_mother_fullName').fill(data.motherName);
    await page.getByPlaceholder('गृहणी / नौकरी / व्यापार').fill('गृहणी');

    // ── Section 4: Father details ───────────────────────────
    await page.locator('#field_father_fullName').fill(data.fatherName);
    await page.locator('#field_father_aadhaarNo').fill(data.aadhaar);
    await page.getByPlaceholder('कृषि / व्यापार / शासकीय सेवा').fill('व्यापार');

    // ── Section 5: Applicant / Informant details ────────────
    await page.locator('#field_applicant_fullName').fill(data.applicantName);
    await page.locator('#field_applicant_mobile').fill(data.mobile);
    await page.getByPlaceholder('citizen@example.com').fill('citizen.test@example.com');
    await page.getByPlaceholder('मकान नंबर, वार्ड नंबर, झाबुआ').last().fill('मकान 5, वार्ड 7');

    // DPDP consent (native required)
    await page.locator('#field_dpdpConsent input[type="checkbox"]').check();

    // ── Save Draft ──────────────────────────────────────────
    await page.getByRole('button', { name: /ड्राफ्ट सहेजें \(Save Draft\)/ }).click();

    // Success message with application number
    await expect(page.getByText(/प्रारूप सहेजा गया \(Draft saved! App No:/)).toBeVisible({ timeout: 15000 });

    // ── Track tab shows the saved draft ─────────────────────
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();
    await expect(page.getByText(data.childName)).toBeVisible();
    await expect(page.getByText(data.motherName)).toBeVisible();
    await expect(page.getByText(data.fatherName)).toBeVisible();
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
