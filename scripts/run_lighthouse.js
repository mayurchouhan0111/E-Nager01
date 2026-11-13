import { execSync } from 'child_process';
import fs from 'fs';

const routes = ['/', '/birth-certificate', '/death-certificate', '/water-connection', '/no-dues-certificate', '/grievance'];
const base = 'http://localhost:3000';

let report = {};
routes.forEach(route => {
  const url = `${base}${route}`;
  console.log(`Running Lighthouse for ${url}`);
  try {
    const result = execSync(`npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless=new --ignore-certificate-errors --no-sandbox"`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 25 });
    const json = JSON.parse(result);
    const scores = {
      performance: json.categories.performance.score * 100,
      accessibility: json.categories.accessibility.score * 100,
      'best-practices': json.categories['best-practices'].score * 100,
    };
    report[route] = scores;
  } catch (e) {
    console.error(`Lighthouse failed for ${url}:`, e.message);
    report[route] = { error: e.message };
  }
});

fs.writeFileSync('lighthouse_report.json', JSON.stringify(report, null, 2));
console.log('Lighthouse report written to lighthouse_report.json');
