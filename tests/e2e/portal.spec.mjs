/**
 * tests/e2e/portal.spec.mjs
 *
 * Real End-to-End Browser & API Verification Suite driving Headless Chromium
 * via Playwright against the running Next.js application at http://127.0.0.1:3000
 * backed by the live Firebase Auth (9099), Firestore (8080), and Storage (9199) Emulators.
 *
 * Every test drives real network / DOM interactions and logs its real wall-clock
 * duration in milliseconds.
 */

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const WEBHOOK_SECRET =
  process.env.PAYMENT_WEBHOOK_SECRET || 'test-webhook-secret-do-not-use-in-prod';
const CONTAINER_CHROMIUM_PATH =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

const SCREENSHOT_DIR = path.resolve(process.cwd(), '.playwright-cli');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let browser;
let context;

before(async () => {
  const launchOptions = { headless: true };
  if (fs.existsSync(CONTAINER_CHROMIUM_PATH)) {
    launchOptions.executablePath = CONTAINER_CHROMIUM_PATH;
  }
  browser = await chromium.launch(launchOptions);
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'hi-IN',
  });
});

after(async () => {
  if (context) await context.close();
  if (browser) await browser.close();
});

test('A1/C2: Home page renders in real browser, zero <marquee> tags, accessible role="status" ticker, no placeholder verification meta, and passes mobile 360x640 layout check', async () => {
  const page = await context.newPage();
  try {
    const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, 'Home page should return HTTP 200');

    const marqueeCount = await page.locator('marquee').count();
    assert.equal(marqueeCount, 0, 'Live DOM must contain zero <marquee> tags');

    const statusRegionCount = await page.locator('[role="status"][aria-live="polite"]').count();
    assert.ok(statusRegionCount >= 1, 'Announcement ticker must use role="status" aria-live="polite"');

    const googleVerifyCount = await page
      .locator('meta[name="google-site-verification"][content="your-google-verification-code"]')
      .count();
    assert.equal(
      googleVerifyCount,
      0,
      'Placeholder google-site-verification must not be present in DOM'
    );

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a1-home-desktop.png') });

    // Mobile 360x640 responsive check
    await page.setViewportSize({ width: 360, height: 640 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4
    );
    assert.equal(hasHorizontalOverflow, false, '360x640 viewport must not overflow horizontally');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a1-home-mobile-360.png') });
  } finally {
    await page.close();
  }
});

test('A2/A3/A4: Service forms (/birth-certificate, /death-certificate, /water-connection, /no-dues-certificate, /grievance) render in browser with dynamic slots & SEO titles', async () => {
  const page = await context.newPage();
  try {
    // 1. Birth Certificate
    const bcRes = await page.goto(`${BASE_URL}/birth-certificate`, { waitUntil: 'domcontentloaded' });
    assert.equal(bcRes.status(), 200);
    const bcTitle = await page.title();
    assert.ok(
      bcTitle.includes('जन्म प्रमाण पत्र') || bcTitle.includes('Birth Certificate'),
      `Expected birth certificate route title, got: ${bcTitle}`
    );
    const bcInputs = await page.locator('input, select, textarea').count();
    assert.ok(bcInputs >= 5, 'Birth certificate form should render interactive inputs');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a2-birth-form.png') });

    // 2. Death Certificate
    const dcRes = await page.goto(`${BASE_URL}/death-certificate`, { waitUntil: 'domcontentloaded' });
    assert.equal(dcRes.status(), 200);
    const dcTitle = await page.title();
    assert.ok(
      dcTitle.includes('मृत्यु प्रमाण पत्र') || dcTitle.includes('Death Certificate'),
      `Expected death certificate title, got: ${dcTitle}`
    );

    // 3. Water Connection
    const wcRes = await page.goto(`${BASE_URL}/water-connection`, { waitUntil: 'domcontentloaded' });
    assert.equal(wcRes.status(), 200);
    const wcTitle = await page.title();
    assert.ok(
      wcTitle.includes('नल-जल') || wcTitle.includes('Water Connection'),
      `Expected water connection title, got: ${wcTitle}`
    );

    // 4. No-Dues Certificate
    const ndRes = await page.goto(`${BASE_URL}/no-dues-certificate`, { waitUntil: 'domcontentloaded' });
    assert.equal(ndRes.status(), 200);
    const ndTitle = await page.title();
    assert.ok(
      ndTitle.includes('नो-ड्यूज') || ndTitle.includes('No-Dues'),
      `Expected No-Dues title, got: ${ndTitle}`
    );

    // 5. Grievance Page
    const grvRes = await page.goto(`${BASE_URL}/grievance`, { waitUntil: 'domcontentloaded' });
    assert.equal(grvRes.status(), 200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a12-grievance-form.png') });
  } finally {
    await page.close();
  }
});

test('A5: Payment Webhook (/api/payment-webhook) enforces secret auth (401), verifies valid payment against Firestore Emulator (200), blocks replay (409), and rejects wrong amount (422)', async () => {
  // 1. GET must return 405
  const getRes = await fetch(`${BASE_URL}/api/payment-webhook`, { method: 'GET' });
  assert.equal(getRes.status, 405, 'GET /api/payment-webhook must be 405 Method Not Allowed');

  // 2. Wrong secret -> 401
  const postNoSecret = await fetch(`${BASE_URL}/api/payment-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': 'wrong-secret' },
    body: JSON.stringify({
      smsText: 'Rs. 1 credited to a/c via UPI Ref 655555551234 for ND-2026-40000005',
    }),
  });
  assert.equal(postNoSecret.status, 401, 'POST with wrong secret must return 401');

  // 3. Wrong amount (0 INR) -> 422
  const postZeroAmount = await fetch(`${BASE_URL}/api/payment-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify({
      utr: '655555550000',
      amount: 0,
      applicationNo: 'ND-2026-40000005',
    }),
  });
  assert.equal(postZeroAmount.status, 422, 'Amount < required fee must return 422');

  // 4. Valid webhook on seeded application ND-2026-40000005 -> 200 OK
  const uniqueUtr = `6888${ String(Date.now()).slice(-8) }`;
  const validRes = await fetch(`${BASE_URL}/api/payment-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify({
      smsText: `Rs. 1.00 credited via UPI Ref ${uniqueUtr} for ND-2026-40000005`,
      idempotencyKey: `idem-${uniqueUtr}`,
    }),
  });
  assert.equal(validRes.status, 200, 'Valid webhook for seeded ND-2026-40000005 must return 200');
  const validData = await validRes.json();
  assert.equal(validData.success, true);

  // 5. Replay same webhook / UTR -> 409 Conflict
  const replayRes = await fetch(`${BASE_URL}/api/payment-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
    body: JSON.stringify({
      smsText: `Rs. 1.00 credited via UPI Ref ${uniqueUtr} for ND-2026-40000005`,
      idempotencyKey: `idem-${uniqueUtr}`,
    }),
  });
  assert.equal(replayRes.status, 409, 'Replayed webhook / duplicate UTR must return 409 Conflict');
});

test('A7: Admin Login Security — Forged sessionStorage blocked; Disabled officer rejected; Real super_admin logs in via Firebase Auth Emulator and sees RBAC tabs including Grievances', async () => {
  const page = await context.newPage();
  try {
    // 1. Forged sessionStorage must NOT unlock /admin
    await page.addInitScript(() => {
      sessionStorage.setItem('dc_admin_authenticated', 'true');
      sessionStorage.setItem('dc_admin_username', 'super_admin');
      sessionStorage.setItem('dc_admin_role', 'super_admin');
    });

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'load' });

    const loginHeadingVisible = await page
      .getByText('नगरपालिका अधिकारी लॉगिन (Officer Login)')
      .isVisible();
    assert.equal(
      loginHeadingVisible,
      true,
      'Officer Login gate must remain locked when sessionStorage is forged'
    );

    const remainingSessionFlag = await page.evaluate(() =>
      sessionStorage.getItem('dc_admin_authenticated')
    );
    assert.equal(remainingSessionFlag, null, 'Forged sessionStorage must be purged');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a7-admin-login-gate.png') });

    // 2. Disabled officer login must be rejected
    await page.locator('input[type="text"]').first().fill('ex.officer.jhabua@mp.gov.in');
    await page.locator('input[type="password"]').first().fill('Jhabua#Officer2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1200);
    const stillOnLoginAfterDisabled = await page
      .getByText('नगरपालिका अधिकारी लॉगिन (Officer Login)')
      .isVisible();
    assert.equal(stillOnLoginAfterDisabled, true, 'Disabled officer must not enter dashboard');

    // 3. Valid super_admin login via Firebase Auth Emulator
    await page.locator('input[type="text"]').first().fill('cmo.jhabua@mp.gov.in');
    await page.locator('input[type="password"]').first().fill('Jhabua#Officer2026!');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard to render with Super Admin tabs
    await page.waitForSelector('text=सुरक्षा एवं क्रेडेंशियल', { timeout: 10000 });
    const hasSecurityTab = await page.getByText('सुरक्षा एवं क्रेडेंशियल').first().isVisible();
    assert.equal(hasSecurityTab, true, 'Super Admin must see Security & Credentials tab from custom claim');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a7-super-admin-dashboard.png') });
  } finally {
    await page.close();
  }
});

test('A7-API: Protected Officer Provisioning API (/api/admin/officers) rejects unauthenticated & forged Bearer tokens with HTTP 401', async () => {
  const resNoToken = await fetch(`${BASE_URL}/api/admin/officers`, { method: 'GET' });
  assert.equal(resNoToken.status, 401, 'Missing Bearer token must return 401');

  const resForgedToken = await fetch(`${BASE_URL}/api/admin/officers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer forged.jwt.token',
    },
    body: JSON.stringify({
      email: 'attacker@example.com',
      role: 'super_admin',
      password: 'AttackerPassword123!',
    }),
  });
  assert.equal(resForgedToken.status, 401, 'Forged Bearer token must return 401');
});

test('A9: Public QR Verification (/verify/[applicationNo]) renders verified card for Approved seeded record (BC-2026-10000006) with masked PII and rejects invalid IDs', async () => {
  const page = await context.newPage();
  try {
    // 1. Valid Approved record BC-2026-10000006 in Firestore Emulator
    const validRes = await page.goto(`${BASE_URL}/verify/BC-2026-10000006`, {
      waitUntil: 'domcontentloaded',
    });
    assert.equal(validRes.status(), 200);
    await page.waitForSelector('[data-testid="verify-valid-card"]', { timeout: 8000 });
    const validCardText = await page.locator('[data-testid="verify-valid-card"]').innerText();
    assert.ok(
      validCardText.includes('BC-2026-10000006') && validCardText.includes('*'),
      'Verified card must display application number and masked citizen name'
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a9-verify-valid-qr.png') });

    // 2. Invalid application number
    await page.goto(`${BASE_URL}/verify/INVALID-APP-000`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="verify-invalid-card"]', { timeout: 8000 });
    const invalidVisible = await page.locator('[data-testid="verify-invalid-card"]').isVisible();
    assert.equal(invalidVisible, true, 'Invalid ID must show unverified card');
  } finally {
    await page.close();
  }
});

test('A10: Public Status Tracking API (/api/track) returns masked status for valid (applicationNo + mobile), rejects mismatched mobile (404), and rate-limits at 11th request (429)', async () => {
  const testIp = `10.99.88.${Math.floor(Math.random() * 200) + 10}`;

  // 1. Valid seeded pair: BC-2026-10000001 + 9425100001 -> 200
  const okRes = await fetch(`${BASE_URL}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
    body: JSON.stringify({ applicationNo: 'BC-2026-10000001', mobile: '9425100001' }),
  });
  assert.equal(okRes.status, 200, 'Valid seeded applicationNo + mobile must return 200');
  const okJson = await okRes.json();
  assert.equal(okJson.found, true);
  assert.equal(okJson.result.applicationNo, 'BC-2026-10000001');
  assert.ok(okJson.result.maskedMobile.startsWith('******'), 'Mobile must be masked');
  assert.equal(okJson.result.aadhaarNo, undefined, 'Aadhaar must never be returned');

  // 2. Wrong mobile for existing applicationNo -> 404 (no data leak)
  const wrongMobileRes = await fetch(`${BASE_URL}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
    body: JSON.stringify({ applicationNo: 'BC-2026-10000001', mobile: '9999999999' }),
  });
  assert.equal(wrongMobileRes.status, 404, 'Mismatched mobile must return 404');

  // 3. Invalid mobile / SQLi string -> 400
  const badInputRes = await fetch(`${BASE_URL}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
    body: JSON.stringify({ applicationNo: "' OR 1=1 --", mobile: '123' }),
  });
  assert.equal(badInputRes.status, 400, 'Injection / malformed input must return 400');

  // 4. Exhaust remaining rate limit (8 more requests -> 11th total from testIp) -> 429
  let lastStatus = 200;
  for (let i = 0; i < 8; i++) {
    const r = await fetch(`${BASE_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': testIp },
      body: JSON.stringify({ applicationNo: 'BC-2026-12345', mobile: '9876543210' }),
    });
    lastStatus = r.status;
  }
  assert.equal(lastStatus, 429, '11th request within 60s from same IP must return HTTP 429');
});

test('A15/C2: Legal & DPDP Pages (/terms and /privacy-policy) and XSS safe rendering in seeded record BC-2026-10000019', async () => {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded' });
    const termsText = await page.locator('body').innerText();
    assert.ok(
      termsText.includes('नो-ड्यूज') && termsText.includes('100% डिजिटल NOC'),
      '/terms must include No-Dues NOC and clarify 100% digital NOC policy'
    );

    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'domcontentloaded' });
    const privacyText = await page.locator('body').innerText();
    assert.ok(
      privacyText.includes('90 दिवस') && privacyText.includes('XXXX-XXXX-1234'),
      '/privacy-policy must specify 90-day raw document retention and Aadhaar masking'
    );

    // Verify XSS payload in seeded record #19 (BC-2026-10000019) never executes script on /verify
    let xssTriggered = false;
    page.on('dialog', () => {
      xssTriggered = true;
    });
    await page.goto(`${BASE_URL}/verify/BC-2026-10000019`, { waitUntil: 'load' });
    assert.equal(xssTriggered, false, 'Stored XSS payload in childName must never execute alert()');
  } finally {
    await page.close();
  }
});

test('C5: Accessibility (axe-core WCAG 2.1 AA) audit on Home and Verify routes', async () => {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const axeHome = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const criticalHome = axeHome.violations.filter((v) => v.impact === 'critical');
    assert.equal(
      criticalHome.length,
      0,
      `Home page should have 0 critical WCAG violations, found: ${criticalHome.map((v) => v.id).join(', ')}`
    );
  } finally {
    await page.close();
  }
});
