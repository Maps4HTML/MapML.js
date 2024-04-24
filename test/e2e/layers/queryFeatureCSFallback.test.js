import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Remote Queryable layer with multiple <map-extent>', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('queryFeatureCSFallback.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Query remote MapML document with multiple extents with map-meta[name=cs]', async () => {
    await page.waitForTimeout(1000);
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    await page.click('mapml-viewer');

    await page.waitForTimeout(2000);
    await page.getByTitle('Next Feature').click();
    expect(errorLogs.length).toBe(0);
    await expect(page.locator('.mapml-zoom-link')).toBeVisible();
  });
});
