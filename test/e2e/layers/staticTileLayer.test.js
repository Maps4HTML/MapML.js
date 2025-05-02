import { test, expect, chromium } from '@playwright/test';

const isVisible = require('./general/isVisible');
const zoomLimit = require('./general/zoomLimit');
const extentProperty = require('./general/extentProperty');

let expectedPCRS = {
    topLeft: {
      horizontal: -4175739.0398780815,
      vertical: 5443265.599864535
    },
    bottomRight: {
      horizontal: 5984281.280162558,
      vertical: -1330081.280162558
    }
  },
  expectedGCRS = {
    topLeft: {
      horizontal: -133.75137103791573,
      vertical: 36.915777752306546
    },
    bottomRight: {
      horizontal: 13.251318374931316,
      vertical: 26.63127363018255
    }
  };

test.describe('Playwright StaticTile Layer Tests', () => {
  isVisible.test('staticTileLayer.html', 3, 3);
  zoomLimit.test('staticTileLayer.html', 2, 2);
  extentProperty.test('staticTileLayer.html', expectedPCRS, expectedGCRS);
  test.describe('General Tests ', () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto('staticTileLayer.html');
    });

    test.afterAll(async function () {
      await context.close();
    });

    test('Correct tiles render on initial map zoom level', async () => {
      await expect(async () => {
        const renderedTiles = await page.locator('map-tile[zoom="2"]');
        await expect(renderedTiles).toHaveCount(3);

        const tiles = await page.locator('map-tile[zoom="2"]').all();
        for (const tile of tiles) {
          const isRendered = await tile.evaluate(
            (t) => t._tileDiv !== undefined
          );
          expect(isRendered).toBe(true);
        }
      }).toPass({ timeout: 15000 });

      const nonRenderedTiles = await page.locator('map-tile[zoom="3"]');
      await expect(nonRenderedTiles).toHaveCount(1);

      for (const tile of await page.locator('map-tile[zoom="3"]').all()) {
        const isRendered = await tile.evaluate((t) => t._tileDiv !== undefined);
        expect(isRendered).toBe(false);
      }
    });
  });
});
