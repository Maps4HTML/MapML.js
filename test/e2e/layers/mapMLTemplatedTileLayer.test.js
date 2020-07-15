const playwright = require("playwright");
const isVisible = require('../layers/isVisible');
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLTemplatedTile Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedTileLayer.html", 1, 3, browserType);
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
            test("[" + browserType + "]" + " <layer->.extent test", async () => {
              const bounds = await page.$eval(
                "body > map > layer-:nth-child(1)",
                (layer) => layer.extent
              );
              let expectedBounds = {
                bounds: { crs: 'WGS84/pcrs', min: { x: -180, y: -270 }, max: { x: 180, y: 90 } },
                minZoom: 1,
                maxZoom: 1,
                minNativeZoom: 1,
                maxNativeZoom: 1
              };
              expect(bounds).toEqual(expectedBounds);
            });
            test("[" + browserType + "]" + " 2nd <layer->.extent test", async () => {
              const bounds = await page.$eval(
                "body > map > layer-:nth-child(2)",
                (layer) => layer.extent
              );
              let expectedBounds = {
                bounds: { crs: 'WGS84/pcrs', min: { x: 360, y: -630 }, max: { x: 540, y: -450 } },
                maxNativeZoom: 0,
                minNativeZoom: 0,
                minZoom: 0,
                maxZoom: 10
              };
              expect(bounds).toEqual(expectedBounds);
            });
          });

      });
  }
})();
