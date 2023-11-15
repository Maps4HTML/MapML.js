import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Remote MapML with <map-extent> Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('queryableMapExtent.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Query remote MapML document', async () => {
    await page.waitForTimeout(1000);
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    await page.click('mapml-viewer');

    await page.waitForTimeout(2000);
    const popups = await page
      .locator('.leaflet-popup-pane')
      .evaluate((popup) => popup.childElementCount);
    expect(popups).toEqual(1);
    expect(errorLogs.length).toBe(0);
    await expect(page.locator('.mapml-zoom-link')).toBeVisible();
  });
});
