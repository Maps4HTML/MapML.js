const playwright = require("playwright");
const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453,
    },
    bottomRight: {
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -76,
      vertical: 45.999999999999936,
    },
    bottomRight: {
      horizontal: -74,
      vertical: 44.99999999999991,
    },
  };
  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLTemplatedFeatures Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedFeatures.html", 3, 2, browserType);
        zoomLimit.test("mapMLTemplatedFeatures.html", 2, 1, browserType);
        extentProperty.test("mapMLTemplatedFeatures.html", expectedPCRS, expectedGCRS, browserType);

        describe("Retreived Features Loading Tests", () => {
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
            await page.goto(PATH + "mapMLTemplatedFeatures.html");
          });

          afterAll(async function () {
            await browser.close();
          });


          test("[" + browserType + "]" + " Loading in tilematrix feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(7)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M382 -28L553 -28L553 399L382 399z");
          });

          test("[" + browserType + "]" + " Loading in pcrs feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(5)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M-53 553L74 553L21 78L-53 98z");
          });

          test("[" + browserType + "]" + " Loading in tcrs feature", async () => {
            const feature = await page.$eval(
              "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(6)",
              (tile) => tile.getAttribute("d")
            );
            expect(feature).toEqual("M357 553L307 456L553 465L553 553z");
          });
        });
      }
    );
  }
})();
