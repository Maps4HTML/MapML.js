const playwright = require("playwright");
const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: -34655800,
      vertical: 39310000,
    },
    bottomRight: {
      horizontal: 14450964.88019643,
      vertical: -9796764.88019643,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -169.78391348558873,
      vertical: -60.79113663130127,
    },
    bottomRight: {
      horizontal: 79.6961805581841,
      vertical: -60.79110984572508,
    },
  };
  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLFeatures (Static Features) Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLFeatures.html", 5, 2, browserType);
        zoomLimit.test("mapMLFeatures.html", 3, 1, browserType);
        extentProperty.test("mapMLFeatures.html", expectedPCRS, expectedGCRS, browserType);
        describe("Retreived Static Features Tests", () => {
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
            await page.goto(PATH + "mapMLFeatures.html");
          });

          afterAll(async function () {
            await browser.close();
          });

          test("[" + browserType + "]" + " Loading in retreived features", async () => {
            const features = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(3) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g",
              (featureGroups) => featureGroups.childNodes.length
            );
            expect(features).toEqual(52);
          });

          test("[" + browserType + "]" + " Loading in tilematrix feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > path:nth-child(1)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M330 83L553 83L553 339L330 339z");
          });

          test("[" + browserType + "]" + " Loading in pcrs feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > path:nth-child(2)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M-53 451L153 508L113 146L-53 191z");
          });

          test("[" + browserType + "]" + " Loading in tcrs feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > path:nth-child(3)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M285 373L460 380L468 477L329 459z");
          });

          test("[" + browserType + "]" + " valid <layer>.extent", async () => {
            const layerExtent = await page.$eval(
              "body > map > layer-:nth-child(3)",
              (layer) => layer.extent
            );
            expect(layerExtent.topLeft.pcrs).toEqual({ horizontal: -34655800, vertical: 39310000 });
            expect(layerExtent.topLeft.gcrs).toEqual({ horizontal: -169.78391348558873, vertical: -60.79113663130127 });
            expect(layerExtent.bottomRight.pcrs).toEqual({ horizontal: 14450964.88019643, vertical: -9796764.88019643 });
            expect(layerExtent.bottomRight.gcrs).toEqual({ horizontal: 79.6961805581841, vertical: -60.79110984572508 });
            expect(layerExtent.zoom).toEqual({ maxNativeZoom: 0, minNativeZoom: 0, maxZoom: 2, minZoom: 2 });
            expect(layerExtent.projection).toEqual("CBMTILE");
          });
        });
      }
    );
  }
})();
