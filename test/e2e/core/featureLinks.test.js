const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright Feature Links Tests " + browserType,
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
          await page.goto(PATH + "featureLinks.html");
        });

        afterAll(async function () {
          await browser.close();
        });
        describe("Sub Part Link Tests in " + browserType, () => {
          test("[" + browserType + "]" + " Sub-point link adds new layer", async () => {
            for(let i = 0; i < 4; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1000);
            const layers = await page.$eval(
              "body > map",
              (map) => map.childElementCount
            );
            expect(layers).toEqual(4);
          });

          test("[" + browserType + "]" + " Sub-point inplace link adds new layer, parent feature has separate link", async () => {
            await page.hover(".leaflet-top.leaflet-right");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > details > summary > div > a");
            await page.click("body > map");
            for(let i = 0; i < 6; i++)
              await page.keyboard.press("Tab");
            const extentBeforeLink = await page.$eval(
              "body > map",
              (map) => map.extent
            );
            await page.keyboard.press("Enter");
            const layers = await page.$eval(
              "body > map",
              (map) => map.childElementCount
            );
            await page.waitForTimeout(1000);
            const layerName = await page.$eval(
              "//html/body/map/layer-[2]",
              (layer) => layer.label
            )
            const extentAfterLink = await page.$eval(
              "body > map",
              (map) => map.extent
            );

            expect(extentAfterLink.topLeft.gcrs).toEqual(extentBeforeLink.topLeft.gcrs);
            expect(extentAfterLink.bottomRight.gcrs).toEqual(extentBeforeLink.bottomRight.gcrs);
            expect(layers).toEqual(4);
            expect(layerName).toEqual("Fire Danger (forecast)");
          });
        });
        describe("Main Part Link Tests in " + browserType, () => {
          test("[" + browserType + "]" + " Main part adds new layer", async () => {
            await page.hover(".leaflet-top.leaflet-right");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > details > summary > div > a");
            await page.click("body > map");
            for(let i = 0; i < 5; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            const layers = await page.$eval(
              "body > map",
              (map) => map.childElementCount
            );
            await page.waitForTimeout(1000);
            const layerName = await page.$eval(
              "//html/body/map/layer-[2]",
              (layer) => layer.label
            )
            const extent = await page.$eval(
              "body > map",
              (map) => map.extent
            );

            expect(extent.topLeft.gcrs).toEqual({horizontal:-129.071567338887, vertical:36.4112695268206});
            expect(extent.bottomRight.gcrs).toEqual({horizontal:26.18468754289824, vertical:2.850936151427951});
            expect(layers).toEqual(4);
            expect(layerName).toEqual("Canada Base Map - Geometry");
          });
        });
        describe("HTML Link Type Tests in " + browserType, () => {
          test("[" + browserType + "]" + " HTML _self target navigates to new page", async () => {
            await page.click("body > map");
            for(let i = 0; i < 7; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1000);
            const url = await page.url();
            expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/");
          });
          test("[" + browserType + "]" + " HTML _top target point navigates to new page", async () => {
            await page.goBack();
            await page.waitForTimeout(1000);
            await page.click("body > map");
            for(let i = 0; i < 8; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1000);
            const url = await page.url();
            expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/fdi/");
          });
          test("[" + browserType + "]" + " HTML _parent target point navigates to new page", async () => {
            await page.goBack();
            await page.waitForTimeout(1000);
            await page.click("body > map");
            for(let i = 0; i < 9; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1000);
            const url = await page.url();
            expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/");
          });
          test("[" + browserType + "]" + " HTML _blank target projection negotiation with hash", async () => {
            await page.goBack();
            await page.waitForTimeout(1000);
            await page.click("body > map");
            for(let i = 0; i < 11; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1000);
            const extent = await page.$eval(
              "body > map",
              (map) => map.extent
            );
            expect(extent.topLeft.gcrs).toEqual({horizontal:-118.38250407225894, vertical:54.364895138267244});
            expect(extent.bottomRight.gcrs).toEqual({horizontal:-41.67362559864071, vertical:7.463862967414659});
          });
        });
      }
    );
  }
})();