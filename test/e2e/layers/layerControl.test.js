import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright layerControl Tests', () => {
  test.describe('Control Layer Panel Tests', () => {
    let page;
    let context;
    test.beforeAll(async function () {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto('layerControl.html');
    });

    test.afterAll(async function () {
      await context.close();
    });

    test('Control panel hidden when no layers/all layers hidden', async () => {
      const controlsHidden = await page.$eval(
        'body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(true);
    });

    test('Control panel shown when layers are on map', async () => {
      const map = await page.locator('body > mapml-viewer');
      await map.evaluate((map) =>
        map.querySelector('map-layer').removeAttribute('hidden')
      );
      await page.waitForTimeout(1000);
      const controlsHidden = await page.$eval(
        'body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(false);
    });
  });
});
