const playwright = require("playwright");
const isVisible = require('../layers/isVisible');
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLTemplatedImage Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedImageLayer.html", 1, 2, browserType);
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
              await page.goto(PATH + "mapMLTemplatedImageLayer.html");
            });

            afterAll(async function () {
              await browser.close();
            });
            test("[" + browserType + "]" + " <layer->.bounds test", async () => {
              const bounds = await page.$eval(
                "body > map > layer-:nth-child(1)",
                (layer) => layer.bounds
              );
              let expectedBounds = {
                bounds: {
                  crs: 'CBMTILE/pcrs',
                  min: { x: 28448056, y: 28448056 },
                  max: { x: 38608077, y: 42672085 }
                },
                minZoom: 4,
                maxZoom: 4,
                minNativeZoom: 0,
                maxNativeZoom: 26
              };
              expect(bounds).toEqual(expectedBounds);
            });
            test("[" + browserType + "]" + " 2nd <layer->.bounds test", async () => {
              const bounds = await page.$eval(
                "body > map > layer-:nth-child(2)",
                (layer) => layer.bounds
              );
              let expectedBounds = {
                bounds: {
                  crs: 'CBMTILE/pcrs',
                  min: { x: 29464058.92811786, y: 29464058.92811786 },
                  max: { x: 39285411.90415715, y: 39285411.90415715 }
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
