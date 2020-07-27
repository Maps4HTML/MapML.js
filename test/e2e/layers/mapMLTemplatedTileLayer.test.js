const playwright = require("playwright");
const isVisible = require('./general/isVisible');
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: -180,
      vertical: 90,
    },
    bottomRight: {
      horizontal: 180,
      vertical: -270,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -180,
      vertical: 90,
    },
    bottomRight: {
      horizontal: 180,
      vertical: -270,
    },
  };
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLTemplatedTile Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedTileLayer.html", 2, 2, browserType);
        zoomLimit.test("mapMLTemplatedTileLayer.html", 1, 0, browserType);
        extentProperty.test("mapMLTemplatedTileLayer.html", expectedPCRS, expectedGCRS, browserType);
        describe(
          "General Tests " + browserType,
          () => {
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
              await page.goto(PATH + "mapMLTemplatedTileLayer.html");
            });

            afterAll(async function () {
              await browser.close();
            });

            test("[" + browserType + "]" + " SVG tiles load in on default map zoom level", async () => {
              const tiles = await page.$eval(
                "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div",
                (tileGroup) => tileGroup.getElementsByTagName("svg").length
              );
              expect(tiles).toEqual(2);
            });
          });

      });
  }
})();
