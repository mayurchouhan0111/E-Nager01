import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

const routes = [
  { name: 'Home', path: '/' },
  { name: 'Birth Certificate', path: '/birth-certificate' },
  { name: 'Death Certificate', path: '/death-certificate' },
  { name: 'Water Connection', path: '/water-connection' },
  { name: 'No Dues Certificate', path: '/no-dues-certificate' },
  { name: 'Grievance', path: '/grievance' }
];

async function main() {
  const baseUrl = 'http://localhost:3000';
  console.log(`Starting Axe Accessibility Audit against ${baseUrl}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Test on mobile viewport
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const auditResults = {};
  let totalViolations = 0;

  for (const r of routes) {
    const url = `${baseUrl}${r.path}`;
    console.log(`\nAuditing route: ${r.name} (${url})`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const violations = results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }));

      auditResults[r.path] = {
        name: r.name,
        url,
        passesCount: results.passes.length,
        violationsCount: violations.length,
        violations
      };

      totalViolations += violations.length;
      console.log(`  -> Passes: ${results.passes.length}, Violations: ${violations.length}`);
      if (violations.length > 0) {
        violations.forEach(v => {
          console.log(`     [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
        });
      }
    } catch (err) {
      console.error(`  -> Error auditing ${url}:`, err.message);
      auditResults[r.path] = { error: err.message };
    }
  }

  await browser.close();

  fs.writeFileSync('axe_audit_report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalViolations,
    routes: auditResults
  }, null, 2));

  console.log(`\nAxe audit complete. Total violations: ${totalViolations}. Saved to axe_audit_report.json`);
}

main().catch(err => {
  console.error('Fatal error in axe audit:', err);
  process.exit(1);
});
