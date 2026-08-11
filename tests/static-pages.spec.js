import { test, expect } from '@playwright/test';

test.describe('Static Pages & Legal', () => {
  test('terms page renders', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /सेवा की शर्तें/ }).first()).toBeVisible();
    await expect(page.getByText(/नगर पालिका परिषद झाबुआ/).first()).toBeVisible();
  });

  test('privacy policy page renders', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.getByRole('heading', { name: /डेटा प्राइवेसी/ }).first()).toBeVisible();
  });

  test('presentation page renders', async ({ page }) => {
    await page.goto('/presentation');
    // Slideshow should render something
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('no broken links on homepage', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('a').evaluateAll(as => as.map(a => a.href).filter(Boolean));

    // Check unique internal links respond
    const internal = [...new Set(links.filter(l => l.includes('localhost')))];
    for (const link of internal.slice(0, 15)) {
      const res = await page.goto(link, { waitUntil: 'domcontentloaded' });
      expect(res.status(), `Broken: ${link}`).toBeLessThan(400);
    }
  });
});
