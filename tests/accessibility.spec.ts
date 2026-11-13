import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/birth-certificate',
  '/death-certificate',
  '/water-connection',
  '/no-dues-certificate',
  '/grievance',
];

for (const route of routes) {
  test(`Accessibility audit for ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
