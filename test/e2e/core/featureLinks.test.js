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
            await page.waitForTimeout(500);
            const layers = await page.$eval(
              "body > map",
              (map) => map.childElementCount
            );
            expect(layers).toEqual(4);
          });

          test("[" + browserType + "]" + " Sub-point link adds new layer, parent feature has separate link", async () => {
            await page.hover(".leaflet-top.leaflet-right");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > details > summary > div > a");
            await page.click("body > map");
            for(let i = 0; i < 6; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            const layers = await page.$eval(
              "body > map",
              (map) => map.childElementCount
            );
            await page.waitForTimeout(500);
            const layerName = await page.$eval(
              "//html/body/map/layer-[2]",
              (layer) => layer.label
            )
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
            await page.waitForTimeout(500);
            const layerName = await page.$eval(
              "//html/body/map/layer-[2]",
              (layer) => layer.label
            )
            expect(layers).toEqual(4);
            expect(layerName).toEqual("Canada Base Map - Geometry");
          });
        });
      }
    );
  }
})();