const playwright = require("playwright");
const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: -4175739.0398780815,
      vertical: 5443265.599864535,
    },
    bottomRight: {
      horizontal: 5984281.280162558,
      vertical: -1330081.280162558,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -133.75137103791573,
      vertical: 36.915777752306546,
    },
    bottomRight: {
      horizontal: 13.251318374931316,
      vertical: 26.63127363018255,
    },
  };
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLStaticTile Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLStaticTileLayer.html", 3, 3, browserType);
        zoomLimit.test("mapMLStaticTileLayer.html", 2, 2, browserType);
        extentProperty.test("mapMLStaticTileLayer.html", expectedPCRS, expectedGCRS, browserType);
        describe("General Tests ", () => {
          beforeAll(async () => {
            browser = await playwright[browserType].launch({
              headless: ISHEADLESS,
              slowMo: 50,
            });
            context = await browser.newContext();
            page = await context.newPage();
            if (browserType === "firefox") {
              await page.waitForNavigation();
            }
            await page.goto(PATH + "mapMLStaticTileLayer.html");
          });

          afterAll(async function () {
            await browser.close();
          });

          test("[" + browserType + "]" + " Tiles load in on default map zoom level", async () => {
            const tiles = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-static-tile-layer > div",
              (tileGroup) => tileGroup.getElementsByTagName("map-tile").length
            );
            expect(tiles).toEqual(1);
          });
        });
      }
    );
  }
})();
