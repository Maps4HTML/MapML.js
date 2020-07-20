const playwright = require("playwright");

exports.test = (path, expectedPCRS, expectedGCRS, browserType) => {
  let page, browser, context;
  describe(
    `<Layer>.extent Property Tests for ${path.split(".")[0]} in ` + browserType,
    () => {
      beforeAll(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + path);
      });

      afterAll(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " <layer->.extent test", async () => {
        const extent = await page.$eval(
          "body > map > layer-:nth-child(1)",
          (layer) => layer.extent
        );
        expect(extent.hasOwnProperty("zoom")).toBeTruthy();
        expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
        expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
        expect(extent.hasOwnProperty("projection")).toBeTruthy();
        expect(extent.topLeft.pcrs).toEqual(expectedPCRS.topLeft);
        expect(extent.bottomRight.pcrs).toEqual(expectedPCRS.bottomRight);
        expect(extent.topLeft.gcrs).toEqual(expectedGCRS.topLeft);
        expect(extent.bottomRight.gcrs).toEqual(expectedGCRS.bottomRight);
      });
      test("[" + browserType + "]" + " 2nd <layer->.extent test", async () => {
        const extent = await page.$eval(
          "body > map > layer-:nth-child(2)",
          (layer) => layer.extent
        );
        expect(extent.hasOwnProperty("zoom")).toBeTruthy();
        expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
        expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
        expect(extent.hasOwnProperty("projection")).toBeTruthy();
      });
    }
  );

};