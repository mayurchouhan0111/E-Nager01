import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'birth-certificate', path: '/birth-certificate' },
  { name: 'death-certificate', path: '/death-certificate' },
  { name: 'water-connection', path: '/water-connection' },
  { name: 'no-dues-certificate', path: '/no-dues-certificate' },
  { name: 'grievance', path: '/grievance' }
];

const viewports = [
  { name: '390px', width: 390, height: 844 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1440px', width: 1440, height: 900 }
];

async function isServerRunning(url) {
  try {
    const res = await fetch(url);
    return res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  const baseUrl = 'http://localhost:3000';
  let serverProcess = null;

  const running = await isServerRunning(baseUrl);
  if (!running) {
    console.log('Starting next start on port 3000...');
    serverProcess = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', '3000'], {
      stdio: 'pipe',
      detached: false
    });
    serverProcess.stdout.on('data', d => process.stdout.write(d));
    serverProcess.stderr.on('data', d => process.stderr.write(d));

    const ready = await waitForServer(baseUrl, 30000);
    if (!ready) {
      console.error('Server failed to start on port 3000');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  console.log('Server is ready. Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  const generatedFiles = [];

  for (const vp of viewports) {
    console.log(`\nCapturing screenshots at viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    for (const route of routes) {
      const targetUrl = `${baseUrl}${route.path}`;
      console.log(`  -> Navigating to ${targetUrl}`);
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);

        const filename = `${route.name}-${vp.name}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);

        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`     Saved: ${filename}`);
        generatedFiles.push(filepath);
      } catch (err) {
        console.error(`     Error capturing ${route.name} at ${vp.name}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();

  if (serverProcess) {
    console.log('Stopping next server...');
    serverProcess.kill();
  }

  console.log(`\nCapture complete! Total ${generatedFiles.length} screenshots saved to ${SCREENSHOT_DIR}`);
}

main().catch(err => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});
