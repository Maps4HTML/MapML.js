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


        expect(layerController).toEqual({
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
            minZoom: 0,
            maxZoom: 25
          }
        });
      });

      test("[" + browserType + "]" + " Static tiles with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(3)",
          (controller) => controller.extent);


        expect(layerController).toEqual({
          extent: {
            crs: "CBMTILE/pcrs",
            bottomRight: {
              horizontal: 5984281.280162558,
              vertical: -1330081.280162558,
            },
            topLeft: {
              horizontal: -4175739.0398780815,
              vertical: 5443265.599864535,
            },
          },
          zoom: {
            maxNativeZoom: 3,
            minNativeZoom: 2,
            minZoom: 0,
            maxZoom: 25
          }
        });
      });

      test("[" + browserType + "]" + " Templated features with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(2)",
          (controller) => controller.extent);

        expect(layerController).toEqual({
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
            minZoom: 0,
            maxZoom: 25
          }
        });
      });

      test("[" + browserType + "]" + " Templated tiles with missing <meta name='zoom'> & extent", async () => {
        const layerController = await page.$eval("body > map:nth-child(2) > layer-",
          (controller) => controller.extent);

        expect(layerController).toEqual({
          extent: {
            crs: "WGS84/pcrs",
            bottomRight: {
              horizontal: 720,
              vertical: -810,
            },
            topLeft: {
              horizontal: -180,
              vertical: 90,
            },
          },
          zoom: {
            maxNativeZoom: 2,
            minNativeZoom: 0,
            minZoom: 0,
            maxZoom: 21
          }
        });
      });

      test("[" + browserType + "]" + " Templated image with missing <meta name='zoom'>", async () => {
        const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(4)",
          (controller) => controller.extent);

        expect(layerController).toEqual({
          extent: {
            crs: "CBMTILE/pcrs",
            bottomRight: {
              horizontal: 38608077,
              vertical: 28448056,
            },
            topLeft: {
              horizontal: 28448056,
              vertical: 42672085,
            },
          },
          zoom: {
            maxNativeZoom: 19,
            minNativeZoom: 0,
            minZoom: 0,
            maxZoom: 25
          }
        });
      });
    });
  }
})();
