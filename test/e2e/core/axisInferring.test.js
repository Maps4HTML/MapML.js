const playwright = require("playwright");
jest.setTimeout(30000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("UI Drag&Drop Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + "axisInferring.html");
      });

      afterEach(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " TileMatrix inferring", async () => {
        const layerExtent = await page.$eval(
          "body > map > layer-:nth-child(1)",
          (layer) => layer.extent
        );

        expect(layerExtent.topLeft.tilematrix[0]).toEqual({ horizontal: 0, vertical: 1 });
        expect(layerExtent.bottomRight.tilematrix[0]).toEqual({ horizontal: 4, vertical: 5 });
      });

      test("[" + browserType + "]" + " TCRS inferring", async () => {
        const layerExtent = await page.$eval(
          "body > map > layer-:nth-child(2)",
          (layer) => layer.extent
        );

        expect(layerExtent.topLeft.tcrs[0]).toEqual({ horizontal: 0, vertical: 256 });
        expect(layerExtent.bottomRight.tcrs[0]).toEqual({ horizontal: 256, vertical: 512 });
      });

      test("[" + browserType + "]" + " PCRS inferring", async () => {
        const layerExtent = await page.$eval(
          "body > map > layer-:nth-child(3)",
          (layer) => layer.extent
        );
        expect(layerExtent.topLeft.pcrs).toEqual({ horizontal: 100, vertical: 600 });
        expect(layerExtent.bottomRight.pcrs).toEqual({ horizontal: 500, vertical: 150 });
      });

      test("[" + browserType + "]" + " GCRS inferring", async () => {
        const layerExtent = await page.$eval(
          "body > map > layer-:nth-child(4)",
          (layer) => layer.extent
        );
        expect(layerExtent.topLeft.gcrs).toEqual({ horizontal: -92, vertical: 52.999999999993484 });
        expect(layerExtent.bottomRight.gcrs).toEqual({ horizontal: -62, vertical: 33.99999999999964 });
      });
    });
  }
})();
