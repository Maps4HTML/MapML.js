const playwright = require("playwright");
const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLFeatures (Static Features) Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLFeatures.html", 5, 2, browserType);
        zoomLimit.test("mapMLFeatures.html", 3, 1, browserType);
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
            await page.goto(PATH + "mapMLFeatures.html");
          });

          afterAll(async function () {
            await browser.close();
          });
          test("[" + browserType + "]" + " <layer->.extent test", async () => {
            const extent = await page.$eval(
              "body > map > layer-:nth-child(1)",
              (layer) => layer.extent
            );
            let expectedExtent = {
              extent: {
                crs: "CBMTILE/pcrs",
                bottomRight: {
                  horizontal: 180337575.0851032,
                  vertical: -180337575.0851032,
                },
                topLeft: {
                  horizontal: -20037508.342789244,
                  vertical: 20037508.342789244,
                },
              },
              zoom: {
                maxNativeZoom: 4,
                minNativeZoom: 2,
                minZoom: 1,
                maxZoom: 5
              }
            };
            expect(extent).toEqual(expectedExtent);
          });
          test("[" + browserType + "]" + " 2nd <layer->.extent test", async () => {
            const extent = await page.$eval(
              "body > map > layer-:nth-child(2)",
              (layer) => layer.extent
            );
            let expectedExtent = {
              extent: {
                crs: "CBMTILE/pcrs",
                bottomRight: {
                  horizontal: 4629611.904157147,
                  vertical: 24588.09584285319,
                },
                topLeft: {
                  horizontal: -5191741.07188214,
                  vertical: 9845941.07188214,
                },
              },
              zoom: {
                maxNativeZoom: 0,
                minNativeZoom: 0,
                minZoom: 0,
                maxZoom: 10
              }
            };
            expect(extent).toEqual(expectedExtent);
          });
        });
      }
    );
  }
})();
