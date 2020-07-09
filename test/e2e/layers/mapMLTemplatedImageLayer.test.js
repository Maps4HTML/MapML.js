const playwright = require("playwright");
const isVisible = require('../layers/isVisible');
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLStaticTile Layer Tests in " + browserType,
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
        isVisible.test("mapMLTemplatedImageLayer.html", 1, 2, browserType);

      }
    );
  }
})();
