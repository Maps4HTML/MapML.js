import { test, expect, chromium } from '@playwright/test';

const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");

let expectedPCRS = {
  topLeft: {
    horizontal: -4175739.0398780815,
    vertical: 5443265.599864535
  },
  bottomRight: {
    horizontal: 5984281.280162558,
    vertical: -1330081.280162558
  }
}, expectedGCRS = {
  topLeft: {
    horizontal: -133.75137103791573,
    vertical: 36.915777752306546
  },
  bottomRight: {
    horizontal: 13.251318374931316,
    vertical: 26.63127363018255
  }
};

test.describe("Playwright mapMLStaticTile Layer Tests", () => {
  isVisible.test("mapMLStaticTileLayer.html", 3, 3);
  zoomLimit.test("mapMLStaticTileLayer.html", 2, 2);
  extentProperty.test("mapMLStaticTileLayer.html", expectedPCRS, expectedGCRS);
  test.describe("General Tests ", () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      await page.goto("mapMLStaticTileLayer.html");
    });

    test.afterAll(async function () {
      await context.close();
    });
  
    test("Tiles load in on default map zoom level", async () => {
      const tiles = await page.$eval(
        ".mapml-static-tile-layer > div",
        (tileGroup) => tileGroup.getElementsByTagName("map-tile").length
      );
      expect(tiles).toEqual(3);
    });
  });
});
