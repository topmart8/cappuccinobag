// Run against a local production build; every inquiry request is intercepted.
// TEST_BASE_URL=http://127.0.0.1:3101 node tests/e2e/padel-mobile-navigation.mjs
// Optional: PLAYWRIGHT_MODULE, CHROMIUM_EXECUTABLE_PATH, QA_OUTPUT_DIR.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.env.TEST_BASE_URL || 'http://127.0.0.1:3101');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Use a local test server only');
const output = process.env.QA_OUTPUT_DIR;
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const results = [];
const scenarios = [
  { width: 360, height: 800, input: 'touch' },
  { width: 390, height: 844, input: 'touch' },
  { width: 768, height: 1024, input: 'touch' },
  { width: 390, height: 844, input: 'keyboard' },
  { width: 390, height: 844, input: 'touch', reducedMotion: 'reduce' },
];
async function openPage(context, route) {
  const page = await context.newPage();
  await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
  const consent = page.getByRole('button', { name: 'Necessary only', exact: true });
  if (await consent.isVisible()) await consent.click();
  assert.equal(await page.locator('nextjs-portal').count(), 0, 'No framework error overlay');
  assert.ok((await page.locator('h1').textContent()).length > 10, 'Meaningful page content');
  return page;
}
try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: scenario, isMobile: scenario.input === 'touch', hasTouch: scenario.input === 'touch', reducedMotion: scenario.reducedMotion || 'no-preference' });
    let requests = 0;
    await context.route('**/api/**', route => { requests++; return route.abort(); });
    const errors = [];
    context.on('weberror', error => errors.push(error.error().message));
    const page = await openPage(context, '/racket-sports/padel-bags');
    const toggle = page.locator('summary[aria-label="Open navigation"]');
    const nav = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    await toggle.click();
    await nav.locator('summary').filter({ hasText: 'Products' }).click();
    assert.equal(await nav.getByRole('link').first().textContent(), 'Padel Bags');
    assert.equal(await toggle.evaluate(el => el.parentElement.open), true, 'Submenu does not dismiss drawer');
    await nav.getByRole('link', { name: 'Padel Bags', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('summary[aria-label="Open navigation"]').parentElement.open);
    await toggle.click();
    const quote = nav.getByRole('link', { name: 'Request Quote', exact: true });
    if (scenario.input === 'keyboard') await quote.press('Enter');
    else await quote.tap();
    await page.waitForFunction(() => location.hash === '#padel-rfq' && !document.querySelector('summary[aria-label="Open navigation"]').parentElement.open);
    await page.waitForFunction(() => { const r = document.querySelector('#padel-rfq').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; });
    assert.equal(await nav.isVisible(), false, 'Quote action exposes RFQ');
    if (output && scenario.width === 390 && scenario.input === 'touch' && !scenario.reducedMotion) await page.screenshot({ path: path.join(output, 'mobile-after.png') });
    await page.getByLabel('Name *', { exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.name), 'name', 'RFQ input is unobstructed');
    await page.getByRole('button', { name: 'Send Padel Bag RFQ', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.name), 'name', 'Native required-field validation');
    assert.equal(requests, 0, 'Invalid form must not issue a request');
    assert.deepEqual(errors, []);
    const data = await page.evaluate(() => ({ url: location.pathname + location.hash, menuOpen: document.querySelector('summary[aria-label="Open navigation"]').parentElement.open, overflow: document.documentElement.scrollWidth > innerWidth, canonical: document.querySelector('link[rel="canonical"]').href }));
    assert.equal(data.overflow, false);
    results.push({ scenario, ...data, requests, errors, pass: true });
    console.log('PASS menu', JSON.stringify(scenario));
    await context.close();
  }
  // General mobile navigation, the desktop CTA, and both existing form contracts.
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const requests = [];
    let responseStatus = 503;
    await context.route('**/api/**', async route => {
      assert.equal(new URL(route.request().url()).pathname, '/api/inquiries');
      requests.push({ method: route.request().method(), contentType: route.request().headers()['content-type'], status: responseStatus });
      await route.fulfill({ status: responseStatus, contentType: 'application/json', body: JSON.stringify(responseStatus === 200 ? { ok: true, inquiryNumber: 'TEST-LOCAL-ONLY' } : { message: 'Simulated unavailable service' }) });
    });
    const page = await openPage(context, '/');
    if (viewport.width < 700) {
      await page.locator('summary[aria-label="Open mobile navigation"]').click();
      const nav = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
      assert.equal(await nav.getByRole('link').first().textContent(), 'Padel Bags');
      await nav.getByRole('link', { name: 'Padel Bags', exact: true }).click();
    } else await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Padel Bags', exact: true }).click();
    await page.waitForURL('**/racket-sports/padel-bags');
    await page.getByRole('main').getByRole('link', { name: 'Request a Quote', exact: true }).click();
    await page.waitForFunction(() => location.hash === '#padel-rfq');
    await page.getByLabel('Name *', { exact: true }).fill('Local QA');
    await page.getByLabel('Work email *', { exact: true }).fill('qa@example.invalid');
    await page.getByRole('button', { name: 'Send Padel Bag RFQ', exact: true }).click();
    await page.getByText('Simulated unavailable service', { exact: false }).waitFor();
    assert.equal(await page.getByLabel('Name *', { exact: true }).inputValue(), 'Local QA');
    responseStatus = 200;
    await page.getByRole('button', { name: 'Send Padel Bag RFQ', exact: true }).click();
    await page.getByText('Thank you. Your RFQ reference is TEST-LOCAL-ONLY.', { exact: false }).waitFor();
    await page.getByRole('navigation', { name: 'Contact footer navigation', exact: true }).getByRole('link', { name: 'Request a Quote', exact: true }).click();
    await page.waitForURL('**/inquiry');
    await page.locator('form[data-inquiry-initialized="true"]').waitFor();
    const count = requests.length;
    await page.getByRole('button', { name: 'Send My Project', exact: true }).click();
    assert.match(await page.locator('.form-status').textContent(), /required fields/);
    assert.equal(requests.length, count);
    await page.getByLabel('Product Needed', { exact: false }).selectOption({ label: 'Padel Bags' });
    await page.locator('.rfq-secondary summary').click();
    assert.equal(await page.locator('.rfq-secondary').evaluate(el => el.open), true);
    await page.locator('.inquiry-form input[name="name"]').fill('Local QA');
    await page.locator('.inquiry-form input[name="email"]').fill('qa@example.invalid');
    responseStatus = 503;
    await page.getByRole('button', { name: 'Send My Project', exact: true }).click();
    await page.locator('.form-status.is-error').waitFor();
    assert.equal(await page.locator('.inquiry-form input[name="name"]').inputValue(), 'Local QA');
    responseStatus = 200;
    await page.getByRole('button', { name: 'Send My Project', exact: true }).click();
    await page.locator('.form-status.is-success').waitFor();
    assert.equal(requests.length, 4);
    const redirect = await page.request.get(new URL('/rfq', base).href, { maxRedirects: 0 });
    assert.ok([301, 307, 308].includes(redirect.status()));
    assert.match(redirect.headers().location, /inquiry/);
    results.push({ viewport, flows: 'home -> Padel -> RFQ -> inquiry; required fields, simulated error/retry/success, /rfq redirect', requests, pass: true });
    console.log('PASS flows', JSON.stringify(viewport));
    await context.close();
  }
  const result = { testedAt: new Date().toISOString(), browser: browser.version(), environment: 'local production build; request interception; no live CRM or mail', results };
  if (output) await writeFile(path.join(output, 'regression.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
