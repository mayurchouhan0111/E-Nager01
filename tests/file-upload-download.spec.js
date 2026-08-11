import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('File Upload & Download', () => {
  // Create a small test PDF (<1MB) for upload testing
  const testDir = path.join(__dirname, 'test-fixtures');
  const pdfPath = path.join(testDir, 'test-upload.pdf');
  const bigPdfPath = path.join(testDir, 'big-file.pdf');

  test.beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

    // Minimal valid PDF (<1MB)
    if (!fs.existsSync(pdfPath)) {
      const minimalPdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
160
%%EOF`;
      fs.writeFileSync(pdfPath, minimalPdf);
    }

    // Big file >5MB (to test rejection)
    if (!fs.existsSync(bigPdfPath)) {
      const bigPdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
160
%%EOF`;
      const padding = Buffer.alloc(6 * 1024 * 1024, 0x25);
      fs.writeFileSync(bigPdfPath, Buffer.concat([Buffer.from(bigPdf), padding]));
    }
  });

  test.afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('DocumentUploader accepts small PDF (<1MB)', async ({ page }) => {
    await page.goto('/birth-certificate');

    // Find the first document uploader
    const uploader = page.locator('label', { hasText: /फ़ाइल \/ फोटो चुनें/ }).first();
    await expect(uploader).toBeVisible();

    // Set the file on the hidden input
    await uploader.locator('input[type="file"]').setInputFiles(pdfPath);

    // Should show "अपलोड किया गया" success indicator
    await expect(page.getByText('अपलोड किया गया').first()).toBeVisible({ timeout: 10000 });
    // File name should be shown
    await expect(page.getByText('test-upload.pdf').first()).toBeVisible();
  });

  test('DocumentUploader rejects >1MB file', async ({ page }) => {
    await page.goto('/birth-certificate');

    const uploader = page.locator('label', { hasText: /फ़ाइल \/ फोटो चुनें/ }).first();
    await uploader.locator('input[type="file"]').setInputFiles(bigPdfPath);

    await expect(page.getByText(/1 MB \(1024 KB\) से कम होना अनिवार्य है|1 MB से कम साइज/).first()).toBeVisible({ timeout: 10000 });
  });

  test('DocumentUploader rejects invalid file type', async ({ page }) => {
    await page.goto('/birth-certificate');

    const invalidFile = path.join(testDir, 'invalid.txt');
    fs.writeFileSync(invalidFile, 'hello world');

    const uploader = page.locator('label', { hasText: /फ़ाइल \/ फोटो चुनें/ }).first();
    await uploader.locator('input[type="file"]').setInputFiles(invalidFile);

    await expect(page.getByText(/केवल JPG, PNG या PDF/)).toBeVisible({ timeout: 10000 });
  });

  test('print preview modal works for applications', async ({ page }) => {
    await page.goto('/birth-certificate');
    // Navigate to track tab to see applications
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();

    // If there are applications, test the letter modal
    const letterBtn = page.getByRole('button', { name: /आवेदन पत्र \(Hard Copy Letter\)/ }).first();
    if (await letterBtn.count()) {
      await letterBtn.click();
      await expect(page.getByText(/आवेदन पत्र/).last()).toBeVisible();
    }
  });

  test('download works for generated certificates', async ({ page }) => {
    // This test verifies the download function works when an approved app exists
    await page.goto('/birth-certificate');
    await page.getByRole('button', { name: /मेरे आवेदन एवं स्थिति/ }).click();

    const downloadBtn = page.getByRole('button', { name: /प्रमाण पत्र डाउनलोड करें/ }).first();
    if (await downloadBtn.count()) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        downloadBtn.click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/\.(pdf|html)$/i);
    }
  });
});
