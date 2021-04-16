const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright zoomin zoomout Projection Change Tests in " + browserType,
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
          await page.goto(PATH + "zoomChangeProjection.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " zoomin link changes projections", async () => {
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in");
          await page.waitForTimeout(1000);
          const newProjection = await page.$eval(
            'body > map',
            (map) => map.projection
          );
          const layerValid = await page.$eval(
            'body > map > layer-',
            (layer) => !layer.hasAttribute('disabled')
          )
          expect(newProjection).toEqual("OSMTILE");
          expect(layerValid).toEqual(true);
        });

        test("[" + browserType + "]" + " zoomout link changes projections", async () => {
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out");
          await page.waitForTimeout(1000);
          const newProjection = await page.$eval(
            'body > map',
            (map) => map.projection
          );
          const layerValid = await page.$eval(
            'body > map > layer-',
            (layer) => !layer.hasAttribute('disabled')
          )
          expect(newProjection).toEqual("CBMTILE");
          expect(layerValid).toEqual(true);
        });
      }
    );
  }
})();