const playwright = require("playwright");
//Could use more tests
jest.setTimeout(30000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("Missing Parameters Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + "missingMetaParameters.html");
      });

      afterEach(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " Static features with missing <meta name='zoom'> & <meta name='extent'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(1)",
          (controller) => controller.extent);

        expect(layerController.topLeft.pcrs).toEqual({
          horizontal: -34655800,
          vertical: 39310000,
        });
        expect(layerController.bottomRight.pcrs).toEqual({
          horizontal: 14450964.88019643,
          vertical: -39260823.80831429,
        });
        expect(layerController.zoom).toEqual({
          maxNativeZoom: 4,
          minNativeZoom: 2,
          minZoom: 0,
          maxZoom: 25
        });
      });

      test("[" + browserType + "]" + " Static tiles with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(3)",
          (controller) => controller.extent);

        expect(layerController.topLeft.pcrs).toEqual({
          horizontal: -4175739.0398780815,
          vertical: 5443265.599864535,
        });
        expect(layerController.bottomRight.pcrs).toEqual({
          horizontal: 5984281.280162558,
          vertical: -1330081.280162558,
        });
        expect(layerController.zoom).toEqual({
          maxNativeZoom: 3,
          minNativeZoom: 2,
          minZoom: 1,
          maxZoom: 4,
          nativeZoom: 2,
        });
      });

      test("[" + browserType + "]" + " Templated features with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(2)",
          (controller) => controller.extent);

        expect(layerController.topLeft.pcrs).toEqual({
          horizontal: 1501645.2210838948,
          vertical: -66110.70639331453,
        });
        expect(layerController.bottomRight.pcrs).toEqual({
          horizontal: 1617642.4028044068,
          vertical: -222452.18449031282,
        });
        expect(layerController.zoom).toEqual({
          maxNativeZoom: 18,
          minNativeZoom: 2,
          minZoom: 0,
          maxZoom: 25
        });
      });

      test("[" + browserType + "]" + " Templated tiles with missing <meta name='zoom'> & extent", async () => {
        const layerController = await page.$eval("body > map:nth-child(2) > layer-",
          (controller) => controller.extent);

        expect(layerController.topLeft.pcrs).toEqual({
          horizontal: -180,
          vertical: 90,
        });
        expect(layerController.bottomRight.pcrs).toEqual({
          horizontal: 180,
          vertical: -90,
        });
        expect(layerController.zoom).toEqual({
          maxNativeZoom: 2,
          minNativeZoom: 0,
          minZoom: 0,
          maxZoom: 21
        });
      });

      test("[" + browserType + "]" + " Templated image with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(4)",
          (controller) => controller.extent);

        expect(layerController.topLeft.pcrs).toEqual({
          horizontal: 28448056,
          vertical: 42672085,
        });
        expect(layerController.bottomRight.pcrs).toEqual({
          horizontal: 38608077,
          vertical: 28448056,
        });
        expect(layerController.zoom).toEqual({
          maxNativeZoom: 19,
          minNativeZoom: 0,
          minZoom: 0,
          maxZoom: 25
        });
      });
    });
  }
})();
