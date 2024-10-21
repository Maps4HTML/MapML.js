import { test, expect, chromium } from '@playwright/test';

test.describe('Custom Projection Feature & Extent Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('CustomProjectionLayers.html');
    const map = page.locator('mapml-viewer');
    await map.evaluate((map) => map.whenLayersReady());
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('map-extent access ._extentLayer property', async () => {
    // access the map-extent._layer property
    const layer = await page.$eval(
      'mapml-viewer',
      (map) => typeof map.getElementsByTagName('map-extent')[0]._extentLayer
    );
    expect(layer).toEqual('object');
  });

  test.describe('Feature', () => {
    test('access static map-feature._featureLayer', async () => {
      // access the feature._layer property
      const layer = await page.$eval(
        'mapml-viewer',
        (map) => typeof map.getElementsByTagName('map-feature')[0]._featureLayer
      );
      expect(layer).toEqual('object');
    });

    test('feature method - ZoomTo()', async () => {
      await page.$eval('#LondonPoint', (f) => f.zoomTo());
      const zoom = await page.evaluate(
        `document.querySelector('mapml-viewer').zoom`
      );
      expect(zoom).toEqual(2);
      let endTopLeft = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.topLeft.gcrs`
      );
      let endBottomRight = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.bottomRight.gcrs`
      );
      expect(endTopLeft.horizontal).toBeCloseTo(-0.9410810217335936, 7);
      expect(endTopLeft.vertical).toBeCloseTo(51.98599427568946, 7);
      expect(endBottomRight.horizontal).toBeCloseTo(0.713006572604242, 7);
      expect(endBottomRight.vertical).toBeCloseTo(51.005402746850955, 7);
    });

    test('Popup displays Zoom link', async () => {
      await page.focus('body > mapml-viewer');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      const zoomLink = await page.$eval(
        '.mapml-zoom-link',
        (link) => link.innerHTML
      );
      expect(zoomLink).toEqual('Zoom to here');
    });
  });
});
