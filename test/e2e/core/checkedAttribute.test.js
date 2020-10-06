const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright Checked Attribute Tests in " + browserType,
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
          await page.goto(PATH + "mapml-viewer.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Initial map element extent", async () => {
          await page.$eval("body > mapml-viewer > layer-",
            (layer) => layer.removeAttribute("checked"));
          await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > input",
            (controller) => controller.checked);

          expect(layerController).toEqual(false);
        });
        test("[" + browserType + "]" + " Initial map element extent", async () => {
          await page.$eval("body > mapml-viewer > layer-",
            (layer) => layer.setAttribute("checked", ""));
          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > input",
            (controller) => controller.checked);

          expect(layerController).toEqual(true);
        });
      }
    );
  }
})();