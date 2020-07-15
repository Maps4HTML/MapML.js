const playwright = require("playwright");
//Could use more tests
jest.setTimeout(30000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("Playwright Missing Parameters Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + "missingParameters.html");
      });

      afterEach(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " Static features with missing <meta name='zoom'> & <meta name='bounds'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(1)",
          (controller) => controller.extent);


        expect(layerController).toEqual({
          bounds: {
            crs: 'CBMTILE/pcrs',
            min: { x: -20037508.342789244, y: -180337575.0851032 },
            max: { x: 180337575.0851032, y: 20037508.342789244 }
          },
          minZoom: 0,
          maxZoom: 26,
          minNativeZoom: 2,
          maxNativeZoom: 4
        });
      });

      test("[" + browserType + "]" + " Static tiles with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(3)",
          (controller) => controller.extent);


        expect(layerController).toEqual({
          bounds: {
            crs: 'CBMTILE/pcrs',
            min: { x: -4175739.0398780815, y: -1330081.280162558 },
            max: { x: 5984281.280162558, y: 5443265.599864535 }
          },
          minZoom: 0,
          maxZoom: 26,
          minNativeZoom: 2,
          maxNativeZoom: 3
        });
      });

      test("[" + browserType + "]" + " Templated features with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(2)",
          (controller) => controller.extent);

        expect(layerController).toEqual({
          bounds: {
            crs: 'CBMTILE/pcrs',
            min: { x: 1501645.2210838948, y: -222452.18449031282 },
            max: { x: 1617642.4028044068, y: -66110.70639331453 }
          },
          minZoom: 0,
          maxZoom: 26,
          minNativeZoom: 2,
          maxNativeZoom: 18
        });
      });

      test("[" + browserType + "]" + " Templated tiles with missing <meta name='zoom'> & bounds", async () => {
        const layerController = await page.$eval("body > map:nth-child(2) > layer-",
          (controller) => controller.extent);

        expect(layerController).toEqual({
          bounds: {
            crs: 'WGS84/pcrs',
            min: { x: -180, y: -810 },
            max: { x: 720, y: 90 }
          },
          minZoom: 0,
          maxZoom: 22,
          minNativeZoom: 0,
          maxNativeZoom: 2
        });
      });

      test("[" + browserType + "]" + " Templated image with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(4)",
          (controller) => controller.extent);

        expect(layerController).toEqual({
          bounds: {
            crs: 'CBMTILE/pcrs',
            min: { x: 28448056, y: 28448056 },
            max: { x: 38608077, y: 42672085 }
          },
          minZoom: 0,
          maxZoom: 26,
          minNativeZoom: 0,
          maxNativeZoom: 19
        });
      });
    });
  }
})();
