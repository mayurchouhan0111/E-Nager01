import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn, execSync } from 'child_process';
import fs from 'fs';

const baseUrl = 'http://127.0.0.1:3000';
const routes = [
  { name: 'Home', path: '/' },
  { name: 'Birth Certificate', path: '/birth-certificate' },
  { name: 'Death Certificate', path: '/death-certificate' },
  { name: 'Water Connection', path: '/water-connection' },
  { name: 'No Dues Certificate', path: '/no-dues-certificate' },
  { name: 'Grievance', path: '/grievance' }
];

async function isServerRunning(url) {
  try {
    const res = await fetch(url);
    return res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function runAxeAudit() {
  console.log('\n--- 1. AXE ACCESSIBILITY AUDIT (WCAG 2.1 AA) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const axeResults = {};
  let totalViolations = 0;

  for (const r of routes) {
    const url = `${baseUrl}${r.path}`;
    console.log(`Auditing Axe for ${r.name} (${r.path})...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
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
        nodesCount: v.nodes.length,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }));

      axeResults[r.path] = {
        name: r.name,
        passesCount: results.passes.length,
        violationsCount: violations.length,
        violations
      };

      totalViolations += violations.length;
      console.log(`  -> Passes: ${results.passes.length}, Violations: ${violations.length}`);
      if (violations.length > 0) {
        violations.forEach(v => {
          console.log(`     [${(v.impact || 'minor').toUpperCase()}] ${v.id}: ${v.help} (${v.nodesCount} nodes)`);
        });
      }
    } catch (e) {
      console.error(`  -> Failed: ${e.message}`);
      axeResults[r.path] = { error: e.message };
    }
  }

  await browser.close();
  return { axeResults, totalViolations };
}

function runLighthouseAudit() {
  console.log('\n--- 2. LIGHTHOUSE MOBILE AUDIT ---');
  let lhResults = {};
  if (fs.existsSync('lighthouse_report.json')) {
    try {
      lhResults = JSON.parse(fs.readFileSync('lighthouse_report.json', 'utf-8'));
    } catch {}
  }

  for (const r of routes) {
    // If already succeeded with numeric score, keep it
    if (lhResults[r.path] && typeof lhResults[r.path].accessibility === 'number') {
      console.log(`Skipping ${r.name} (${r.path}), already completed: Acc ${lhResults[r.path].accessibility}`);
      continue;
    }

    const url = `${baseUrl}${r.path}`;
    console.log(`Running Lighthouse Mobile for ${r.name} (${r.path})...`);
    const tmpDir = `C:\\temp\\lh_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {}
    }

    try {
      const cmd = `npx lighthouse ${url} --form-factor=mobile --output=json --quiet --chrome-flags="--headless=new --no-sandbox --user-data-dir=${tmpDir} --ignore-certificate-errors"`;
      const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 });
      const json = JSON.parse(output);
      const scores = {
        performance: Math.round((json.categories.performance?.score || 0) * 100),
        accessibility: Math.round((json.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((json.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((json.categories.seo?.score || 0) * 100)
      };
      lhResults[r.path] = {
        name: r.name,
        ...scores
      };
      console.log(`  -> Performance: ${scores.performance}, Accessibility: ${scores.accessibility}, Best Practices: ${scores.bestPractices}, SEO: ${scores.seo}`);
    } catch (e) {
      console.error(`  -> Lighthouse failed for ${r.path}:`, e.message);
      lhResults[r.path] = { error: e.message };
    }
  }

  return lhResults;
}

function verifyFrozenComponents() {
  console.log('\n--- 3. VERIFY FROZEN COMPONENTS (GIT DIFF AGAINST HEAD) ---');
  const files = [
    'src/components/ServiceHeader.js',
    'src/app/page.js'
  ];

  const results = {};
  for (const file of files) {
    try {
      const diff = execSync(`git diff HEAD -- ${file}`, { encoding: 'utf-8' }).trim();
      results[file] = {
        modified: diff.length > 0,
        diffLength: diff.length,
        status: diff.length === 0 ? 'UNTOUCHED / FROZEN' : 'MODIFIED'
      };
      console.log(`  -> ${file}: ${results[file].status}`);
    } catch (e) {
      results[file] = { error: e.message };
    }
  }
  return results;
}

async function main() {
  console.log('Starting Complete UI Redesign Verification Workflow...');

  let serverProcess = null;
  const running = await isServerRunning(baseUrl);
  if (!running) {
    console.log('Spawning next start on port 3000...');
    serverProcess = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', '3000'], {
      stdio: 'pipe',
      detached: false
    });
    serverProcess.stdout.on('data', d => process.stdout.write(d));
    serverProcess.stderr.on('data', d => process.stderr.write(d));

    const ready = await waitForServer(baseUrl, 40000);
    if (!ready) {
      console.error('Server failed to start on port 3000');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  console.log('Next.js server ready at ' + baseUrl);

  // 1. Frozen components check
  const frozenCheck = verifyFrozenComponents();

  // 2. Axe accessibility audit
  const { axeResults, totalViolations } = await runAxeAudit();
  fs.writeFileSync('axe_audit_report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalViolations,
    routes: axeResults
  }, null, 2));

  // 3. Lighthouse Mobile audit
  const lhResults = runLighthouseAudit();
  fs.writeFileSync('lighthouse_report.json', JSON.stringify(lhResults, null, 2));

  if (serverProcess) {
    console.log('\nShutting down Next.js server...');
    serverProcess.kill();
  }

  console.log('\n======================================================');
  console.log('UI REDESIGN VERIFICATION COMPLETE');
  console.log(`- Frozen Components: ${Object.values(frozenCheck).every(f => f.status === 'UNTOUCHED / FROZEN') ? 'ALL UNTOUCHED (PASS)' : 'MODIFIED (FAIL)'}`);
  console.log(`- Axe Violations Total: ${totalViolations}`);
  console.log(`- Lighthouse Reports saved to lighthouse_report.json`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
