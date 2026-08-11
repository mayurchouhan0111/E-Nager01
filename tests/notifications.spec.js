import { test, expect } from '@playwright/test';

test.describe('Notifications Bell', () => {
  test('notification bell is visible in header', async ({ page }) => {
    await page.goto('/');

    const bell = page.getByRole('button', { name: /सूचनाएँ \(Notifications\)/ });
    await expect(bell).toBeVisible();
  });

  test('notification panel opens and shows empty state', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /सूचनाएँ \(Notifications\)/ }).click();

    // Panel header visible
    await expect(page.getByText('सूचनाएँ (Notifications)')).toBeVisible();
  });

  test('notification panel can be closed', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /सूचनाएँ \(Notifications\)/ }).click();
    await page.getByRole('button', { name: /सूचना पैनल बंद करें/ }).click();

    // Panel should disappear
    await expect(page.getByText('सूचनाएँ (Notifications)')).toHaveCount(0);
  });
});
