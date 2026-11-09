// Prints resume/resume.html to public/resume/Joel_Jigo_Resume.pdf (one A4 page, real text).
// Run: npm run resume   (needs a Playwright Chromium: npx playwright install chromium)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const src = fileURLToPath(new URL('../resume/resume.html', import.meta.url));
const out = fileURLToPath(new URL('../public/resume/Joel_Jigo_Resume.pdf', import.meta.url));
mkdirSync(fileURLToPath(new URL('../public/resume/', import.meta.url)), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // A4 at 96dpi is 1123px tall: anything taller would spill onto a second page
  const h = await page.evaluate(() => document.querySelector('.page').scrollHeight);
  if (h > 1123) throw new Error(`resume is ${h}px tall; it must fit one A4 page (1123px)`);
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  console.log(`wrote ${out} (${h}px of 1123px)`);
} finally {
  await browser.close();
}
