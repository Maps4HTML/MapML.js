import { test, expect, chromium } from '@playwright/test';

test.describe('matchMedia map-zoom tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {});
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('map-zoom.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('matchMedia API detects changes in zoom', async () => {
    const zoomIn = await page.locator('.leaflet-control-zoom-in');
    const zoomIndicator = await page.waitForSelector('#zoom-indicator');

    for (let n = 1; n < 18; n++) {
      const updatedZoomLevel = await zoomIndicator.getAttribute(
        'data-zoom-level'
      );
      expect(updatedZoomLevel).toBe(String(n));
      await zoomIn.click();
      await page.waitForTimeout(500);
    }
  });
});
