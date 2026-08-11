import { test, expect } from '@playwright/test';

test.describe('Grievance Flow', () => {
  test('page loads with form', async ({ page }) => {
    await page.goto('/grievance');

    await expect(page.getByText(/ऑनलाइन शिकायत \/ डेटा प्राइवेसी अनुरोध दर्ज करें/)).toBeVisible();
    await expect(page.getByRole('button', { name: /शिकायत सबमिट करें/ })).toBeVisible();
  });

  test('validation requires name, mobile and details', async ({ page }) => {
    await page.goto('/grievance');

    await page.getByRole('button', { name: /शिकायत सबमिट करें/ }).click();
    // Toast error shown (no inline message)
    await expect(page.getByText(/शिकायत सबमिट करें/)).toBeVisible();
  });

  test('form accepts valid data and shows ticket number', async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    await page.goto('/grievance');

    await page.getByPlaceholder('आपका नाम दर्ज करें').fill(`E2E TEST नागरिक ${suffix}`);
    await page.getByPlaceholder('10 अंकों का मोबाइल नंबर').fill('9876543210');
    await page.getByPlaceholder(/कृपया अपनी समस्या का विस्तृत विवरण/).fill('E2E TEST grievance - please ignore');

    await page.getByRole('button', { name: /शिकायत सबमिट करें/ }).click();

    // Should show success ticket screen
    await expect(page.getByText(/आपकी शिकायत दर्ज कर ली गई है/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/टिकिट क्र\./).first()).toBeVisible();
  });
});
