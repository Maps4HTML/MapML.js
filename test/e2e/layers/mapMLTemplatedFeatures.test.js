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
        isVisible.test("mapMLTemplatedFeatures.html", 3, 2, browserType);
        zoomLimit.test("mapMLTemplatedFeatures.html", 2, 1, browserType);
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
            await page.goto(PATH + "mapMLTemplatedFeatures.html");
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
                  horizontal: 1617642.4028044068,
                  vertical: -222452.18449031282,
                },
                topLeft: {
                  horizontal: 1501645.2210838948,
                  vertical: -66110.70639331453,
                },
              },
              zoom: {
                maxNativeZoom: 18,
                minNativeZoom: 2,
                minZoom: 2,
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
