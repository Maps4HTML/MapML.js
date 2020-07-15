const playwright = require("playwright");
const isVisible = require("../layers/isVisible");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLStaticTile Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLStaticTileLayer.html", 3, 6, browserType);
        describe("General Tests " + browserType, () => {
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
              (tileGroup) => tileGroup.getElementsByTagName("tile").length
            );
            expect(tiles).toEqual(1);
          });
          test("[" + browserType + "]" + " <layer->.extent test", async () => {
            const bounds = await page.$eval(
              "body > map > layer-:nth-child(1)",
              (layer) => layer.extent
            );
            let expectedBounds = {
              bounds: {
                crs: 'CBMTILE/pcrs',
                min: { x: -4175739.0398780815, y: -1330081.280162558 },
                max: { x: 5984281.280162558, y: 5443265.599864535 }
              },
              maxNativeZoom: 3,
              minNativeZoom: 2,
              minZoom: 1,
              maxZoom: 4
            };
            expect(bounds).toEqual(expectedBounds);
          });
          test("[" + browserType + "]" + " 2nd <layer->.extent test", async () => {
            const bounds = await page.$eval(
              "body > map > layer-:nth-child(2)",
              (layer) => layer.extent
            );
            let expectedBounds = {
              bounds: {
                crs: 'CBMTILE/pcrs',
                min: { x: -5191741.07188214, y: 24588.09584285319 },
                max: { x: 4629611.904157147, y: 9845941.07188214 }
              },
              maxNativeZoom: 0,
              minNativeZoom: 0,
              minZoom: 0,
              maxZoom: 10
            };
            expect(bounds).toEqual(expectedBounds);
          });
        });
      }
    );
  }
})();
