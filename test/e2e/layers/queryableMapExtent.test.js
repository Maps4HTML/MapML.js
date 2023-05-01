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
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    await page.click('div');

    await page.waitForSelector(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
    );
    const popupNum = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );
    expect(errorLogs.length).toBe(0);
    expect(popupNum).toEqual(1);
    await expect(page.locator('.mapml-zoom-link')).toBeVisible();
  });
});
