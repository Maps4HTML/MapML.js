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

  test.describe('Focus stays on checkboxes when using keyboard navigation', () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('', {
        slowMo: 250
      });
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      page = await context.newPage();
      await page.goto('layerControl.html');
    });

    test.afterAll(async function () {
      await context.close();
    });

    test('Focus stays on checkbox after checking and unchecking layers in the layer menu', async () => {
      const map = await page.locator('body > mapml-viewer');
      await map.evaluate((map) =>
        map.querySelector('map-layer').removeAttribute('hidden')
      );
      const layer = await page.locator('map-layer');
      let layerChecked = await layer.getAttribute('checked');
      expect(layerChecked).not.toBeNull();

      // use keyboard to uncheck layer
      await page.locator('mapml-viewer').click();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');

      // layer should be unchecked
      layerChecked = await layer.getAttribute('checked');
      expect(layerChecked).toBeNull();

      // pressing space again should check the layer
      await page.keyboard.press('Space');
      layerChecked = await layer.getAttribute('checked');
      expect(layerChecked).not.toBeNull();
    });

    test('Focus stays on checkbox after checking and unchecking extents in the layer menu', async () => {
      const extent = await page.locator('map-extent');
      let extentChecked = await extent.getAttribute('checked');
      expect(extentChecked).not.toBeNull();

      // use keyboard to uncheck map-extent
      await page.locator('mapml-viewer').click();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');

      // extent should be unchecked
      extentChecked = await extent.getAttribute('checked');
      expect(extentChecked).toBeNull();

      // pressing space again should check the extent
      await page.keyboard.press('Space');
      extentChecked = await extent.getAttribute('checked');
      expect(extentChecked).not.toBeNull();
    });
  });
});
