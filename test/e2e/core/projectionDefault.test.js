import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Viewer Default Projection', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('projectionDefault.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Viewer with no projection attribute', () => {
    test('Viewer defaults to OSMTILE', async () => {
      const mapProjection = await page.$eval(
        'body > mapml-viewer',
        (map) => map.projection
      );
      const leafletProjection = await page.$eval(
        'body > mapml-viewer',
        (map) => map._map.options.projection
      );
      const leafletProjection1 = await page.$eval(
        'body > mapml-viewer',
        (map) => map._map.options.crs.code
      );
      const projectionAttribute = await page.$eval(
        'body > mapml-viewer',
        (map) => map.getAttribute('projection')
      );
      expect(mapProjection).toEqual('OSMTILE');
      expect(leafletProjection).toEqual('OSMTILE');
      expect(leafletProjection1).toEqual('EPSG:3857');
      expect(projectionAttribute).toEqual(null);
    });

    test('layer renders', async () => {
      await page.waitForTimeout(500);
      const featureSVG = await page.$eval(
        'body > mapml-viewer > map-layer > map-feature',
        (feature) => feature._groupEl.firstChild.getAttribute('d')
      );
      expect(featureSVG).toEqual('M62 27L62 75L206 75L206 27L62 27z');
    });
  });
});
