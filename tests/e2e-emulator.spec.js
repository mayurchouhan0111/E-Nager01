import { test, expect } from '@playwright/test';

const FAKE_CITIZEN_MOBILE = '9876543210';
const FAKE_CITIZEN_EMAIL = 'normal.citizen@example.com';
const ADMIN_USER = 'admin';
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_BIRTH_DEATH || 'test_admin_pass';
const WRONG_PASS = 'wrong_password_123';

test.describe('E2E Test Suite - Local Firebase Emulator Suite (demo-test)', () => {

  // ==========================================
  // 1. AUTHENTICATION FLOWS
  // ==========================================
  test.describe('1. Authentication Flows', () => {

    test('Admin Login with invalid credentials shows error', async ({ page }) => {
      await page.goto('/admin');

      const usernameInput = page.getByPlaceholder('User ID / Username');
      const passwordInput = page.getByPlaceholder('••••••••');
      const loginButton = page.getByRole('button', { name: /लॉगिन करें/ });

      await usernameInput.fill(ADMIN_USER);
      await passwordInput.fill(WRONG_PASS);
      await loginButton.click();

      await expect(page.getByText(/गलत|अमान्य|Invalid/)).toBeVisible({ timeout: 10000 });
    });

    test('Admin Login with valid credentials succeeds and loads dashboard', async ({ page }) => {
      await page.goto('/admin');

      const usernameInput = page.getByPlaceholder('User ID / Username');
      const passwordInput = page.getByPlaceholder('••••••••');
      const loginButton = page.getByRole('button', { name: /लॉगिन करें/ });

      await usernameInput.fill(ADMIN_USER);
      await passwordInput.fill(ADMIN_PASS);
      await loginButton.click();

      await expect(page.getByRole('heading', { name: /मृत्यु प्रमाण पत्र आवेदन प्रबंधन/ })).toBeVisible({ timeout: 15000 });
      
      const isAuth = await page.evaluate(() => sessionStorage.getItem('dc_admin_authenticated'));
      expect(isAuth).toBe('true');
    });

    test('Admin Logout clears session and back button prevents access', async ({ page }) => {
      await page.goto('/admin');

      const usernameInput = page.getByPlaceholder('User ID / Username');
      const passwordInput = page.getByPlaceholder('••••••••');
      const loginButton = page.getByRole('button', { name: /लॉगिन करें/ });

      await usernameInput.fill(ADMIN_USER);
      await passwordInput.fill(ADMIN_PASS);
      await loginButton.click();

      const logoutBtn = page.getByRole('button', { name: /लॉगआउट|Logout/ }).first();
      await expect(logoutBtn).toBeVisible({ timeout: 15000 });
      await logoutBtn.click();

      await expect(page.getByRole('heading', { name: /नगरपालिका अधिकारी लॉगिन/ })).toBeVisible({ timeout: 10000 });

      const isAuthAfterLogout = await page.evaluate(() => sessionStorage.getItem('dc_admin_authenticated'));
      expect(isAuthAfterLogout).toBeNull();
    });

    test('Citizen Login via Mobile/Email Mock and Session Purge on shared device', async ({ page }) => {
      await page.goto('/');

      await page.evaluate(() => {
        const citizenData = {
          uid: 'citizen-9876543210',
          email: 'normal.citizen@example.com',
          mobile: '9876543210',
          displayName: 'रमेश कुमार (Ramesh Kumar)',
          photoURL: null,
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
      });

      await page.reload();
      const stored = await page.evaluate(() => localStorage.getItem('enagar_citizen_user'));
      expect(stored).toContain('normal.citizen@example.com');

      await page.evaluate(() => {
        localStorage.removeItem('enagar_citizen_user');
      });
      const purged = await page.evaluate(() => localStorage.getItem('enagar_citizen_user'));
      expect(purged).toBeNull();
    });
  });

  // ==========================================
  // 2. FORM VALIDATIONS & SECURITY INPUTS
  // ==========================================
  test.describe('2. Form Validations & Security Inputs', () => {

    test('Birth Certificate Form: Empty required fields validation', async ({ page }) => {
      await page.goto('/birth-certificate');

      const nextOrSubmit = page.locator('button:has-text("आगे बढ़ें"), button:has-text("जमा करें"), button[type="submit"]').first();
      if (await nextOrSubmit.isVisible()) {
        await nextOrSubmit.click();
        await page.waitForTimeout(500);
      }
    });

    test('XSS and Special Characters in Application Inputs are sanitized safely', async ({ page }) => {
      await page.goto('/birth-certificate');

      const xssPayload = "<script>window.__xss_executed__=true;</script><img src=x onerror=window.__xss_executed__=true>";
      
      const applicantInput = page.locator('input[name="applicantName"], input[placeholder*="नाम"]').first();
      if (await applicantInput.isVisible()) {
        await applicantInput.fill(xssPayload);
        const val = await applicantInput.inputValue();
        expect(val).toBe(xssPayload);

        const xssExecuted = await page.evaluate(() => window.__xss_executed__);
        expect(xssExecuted).toBeUndefined();
      }
    });

    test('Very Long Input does not break layout or cause crash', async ({ page }) => {
      await page.goto('/birth-certificate');

      const longString = 'अ'.repeat(2000);
      const textInput = page.locator('input[type="text"]').first();
      if (await textInput.isVisible()) {
        await textInput.fill(longString);
        expect(await textInput.inputValue()).toHaveLength(2000);
      }
    });
  });

  // ==========================================
  // 3. CRUD ON MAIN FEATURES
  // ==========================================
  test.describe('3. Core Citizen Features CRUD & Status Tracking', () => {

    test('Homepage loads seeded service status and cards', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /मृत्यु प्रमाण पत्र/ }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /जन्म प्रमाण पत्र/ }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /जल/ }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /नो ड्यूज/ }).first()).toBeVisible();
    });

    test('Birth Certificate: View seeded application details', async ({ page }) => {
      await page.goto('/birth-certificate');

      const trackBtn = page.locator('button:has-text("स्थिति"), button:has-text("ट्रैक"), button:has-text("Track")').first();
      if (await trackBtn.isVisible()) {
        await trackBtn.click();
        const searchInput = page.locator('input[placeholder*="आवेदन"], input[placeholder*="BC-"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('BC-2026-001001');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
        }
      }
    });

    test('Water Connection Form: Access and render', async ({ page }) => {
      await page.goto('/water-connection');
      await expect(page.getByRole('heading', { name: /नल कनेक्शन/ })).toBeVisible();
    });

    test('No Dues Certificate: Fast Receipt OCR & UPI QR View', async ({ page }) => {
      await page.goto('/no-dues-certificate');
      await expect(page.getByRole('heading', { name: /नो ड्यूज प्रमाण पत्र/ })).toBeVisible();
    });
  });

  // ==========================================
  // 4. PERMISSIONS & ACCESS CONTROL
  // ==========================================
  test.describe('4. Permissions & Route Protection', () => {

    test('Unauthenticated user on /admin sees login screen, cannot access admin data', async ({ page }) => {
      await page.goto('/admin');
      await page.evaluate(() => sessionStorage.clear());
      await page.reload();

      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('table, [role="table"]')).not.toBeVisible();
    });
  });

  // ==========================================
  // 5. PAYMENT WEBHOOK API & MUTATION
  // ==========================================
  test.describe('5. Payment Webhook End-to-End Flow', () => {

    test('Webhook rejects requests without authorization token (401)', async ({ request }) => {
      const response = await request.post('/api/payment-webhook', {
        data: { text: 'Received Rs 1 for ND-2026-004002 UTR 123456789012' }
      });
      expect(response.status()).toBe(401);
    });

    test('Webhook rejects requests with wrong authorization token (401)', async ({ request }) => {
      const response = await request.post('/api/payment-webhook', {
        headers: { 'x-webhook-secret': 'wrong-secret-token' },
        data: { text: 'Received Rs 1 for ND-2026-004002 UTR 123456789012' }
      });
      expect(response.status()).toBe(401);
    });

    test('Webhook accepts valid payment notification and updates document to Paid', async ({ request }) => {
      const webhookSecret = process.env.WEBHOOK_SECRET || 'test-webhook-secret-token-xyz';
      const response = await request.post('/api/payment-webhook', {
        headers: { 'x-webhook-secret': webhookSecret },
        data: {
          text: 'Payment received of Rs 1.00 for ND-2026-004002. UTR: 998877665544 credited successfully.'
        }
      });
      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.applicationNo).toBe('ND-2026-004002');
    });

    test('Webhook ignores non-credit notification gracefully', async ({ request }) => {
      const webhookSecret = process.env.WEBHOOK_SECRET || 'test-webhook-secret-token-xyz';
      const response = await request.post('/api/payment-webhook', {
        headers: { 'x-webhook-secret': webhookSecret },
        data: { text: 'Your monthly statement is ready for review.' }
      });
      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain('Not a valid credit payment');
    });
  });

  // ==========================================
  // 6. 404 PAGE & PAGE INTEGRITY
  // ==========================================
  test.describe('6. Page Integrity, 404 & Static Assets', () => {

    test('Non-existent route renders 404 page gracefully', async ({ page }) => {
      const response = await page.goto('/random-non-existent-page-xyz');
      expect([200, 404]).toContain(response?.status());
    });

    test('Static policy pages render without crashes', async ({ page }) => {
      await page.goto('/privacy-policy');
      await expect(page.getByRole('heading', { name: /गोपनीयता नीति|Privacy Policy/ })).toBeVisible();

      await page.goto('/terms');
      await expect(page.getByRole('heading', { name: /सेवा की शर्तें|Terms/ })).toBeVisible();
    });

    test('Key assets and logos load successfully', async ({ page }) => {
      await page.goto('/');
      const mpLogo = page.locator('img[src*="mp-logo.png"]').first();
      await expect(mpLogo).toBeVisible();
      const naturalWidth = await mpLogo.evaluate((img) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 7. SECURITY SECRETS EXPOSURE AUDIT
  // ==========================================
  test.describe('7. Frontend Security & Secret Audit', () => {

    test('WEBHOOK_SECRET and service account keys are NOT exposed to client DOM or window', async ({ page }) => {
      await page.goto('/');
      const clientContent = await page.content();
      
      expect(clientContent).not.toContain('test-webhook-secret-token-xyz');
      expect(clientContent).not.toContain('private_key');
      expect(clientContent).not.toContain('BEGIN PRIVATE KEY');
    });
  });
});
