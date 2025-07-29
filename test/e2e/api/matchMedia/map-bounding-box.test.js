import { test, expect, chromium } from '@playwright/test';

test.describe('matchMedia map-bounding-box tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { headless: false });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-bounding-box.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('matchMedia API detects changes in map-extents', async () => {
    await page.waitForTimeout(500);
    const map = page.locator('mapml-viewer');
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');

    const layer = page.locator('map-layer[label="test media query"]');

    // upon creation, the test query layer should not be hidden
    await expect(layer).not.toHaveAttribute('hidden');

    // the test query layer should be hidden as map-zoom is no longer less than 14
    await zoomOut.click();
    await page.waitForTimeout(500);
    await zoomIn.click();
    await expect(layer).toHaveAttribute('hidden');

    // the layer should be shown as we zoom out again
    await zoomOut.click();
    await page.waitForTimeout(500);
    await expect(layer).not.toHaveAttribute('hidden');

    // move the map so that the layer is out of the map's extent
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(0, 0, 13);
    });
    await page.waitForTimeout(500);
    await expect(layer).toHaveAttribute('hidden');

    // move the map back so that the layer is within of the map's extent
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(45.406314, -75.6883335, 13);
    });
    await expect(layer).not.toHaveAttribute('hidden');
  });
});
