import { test, expect, chromium } from '@playwright/test';

test.describe('MatchMedia Query Tests', () => {
  let page;
  let context;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      locale: 'en-US'
    });
    page = await context.newPage();
    await page.goto('combined-matchMedia.html');
  });

  test.afterAll(async () => {
    await context.close();
  });

  const mapTypes = ['mapml-viewer', 'map'];

  for (const mapType of mapTypes) {
    test.describe(`Tests for ${mapType}`, () => {
      test(`${mapType} - ${mapType} - All conditions are met`, async () => {
        const map = page.locator(mapType);
        const layer = map.getByTestId(`test-media-query-${mapType}`);
        await expect(layer).not.toHaveAttribute('hidden');
      });

      test(`${mapType} - Prefers-color-scheme does not match`, async () => {
        const map = page.locator(mapType);
        await page.emulateMedia({ colorScheme: 'dark' });
        const layer = map.getByTestId(`test-media-query-${mapType}`);
        await expect(layer).toHaveAttribute('hidden');
        await page.emulateMedia({ colorScheme: 'light' });
      });

      test(`${mapType} - Prefers-lang does not match`, async () => {
        const browser = await chromium.launch();
        const frContext = await browser.newContext({ locale: 'fr-CA' });
        const frPage = await frContext.newPage();

        await frPage.goto('combined-matchMedia.html');
        const map = frPage.locator(mapType);
        const layer = map.getByTestId(`test-media-query-${mapType}`);
        await expect(layer).toHaveAttribute('hidden');

        await frContext.close();
      });

      test(`${mapType} - map-projection does not match`, async () => {
        const map = page.locator(mapType);
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.projection = 'CBMTILE';
        }, mapType);
        const layer = map.getByTestId(`test-media-query-${mapType}`);
        await expect(layer).toHaveAttribute('hidden');
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.projection = 'OSMTILE';
        }, mapType);
      });

      test(`${mapType} - map-zoom does not match`, async () => {
        const map = page.locator(mapType);
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.zoomTo(45.406314, -75.6883335, 15);
        }, mapType);
        const layer = map.getByTestId(`test-media-query-${mapType}`);
        await expect(layer).toHaveAttribute('hidden');
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.zoomTo(45.406314, -75.6883335, 13);
        }, mapType);
      });

      test(`${mapType} - Map does not overlap with the bounding box`, async () => {
        const map = page.locator(mapType);
        const layer = map.getByTestId(`test-media-query-${mapType}`);

        // move the map so that the layer is out of the map's extent
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.zoomTo(0, 0, 13);
        }, mapType);
        await expect(layer).toHaveAttribute('hidden');

        // move the map back so that the layer is within the map's extent
        await page.evaluate((mapType) => {
          const map = document.querySelector(mapType);
          map.zoomTo(45.406314, -75.6883335, 13);
        }, mapType);
        await expect(layer).not.toHaveAttribute('hidden');
      });
    });
  }
});
