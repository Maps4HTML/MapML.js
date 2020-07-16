const playwright = require("playwright");

exports.test = (path, zoomIn, zoomOut, browserType) => {
  let page, browser, context;
  describe(
    `isVisible Property Tests for ${path.split(".")[0]} in ` + browserType,
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
        await page.goto(PATH + path);
      });

      afterAll(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " isVisible property false when zoomed out of bounds (zooming in)", async () => {
        for (let i = 0; i < zoomIn; i++)
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');

        await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
        const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
          (controller) => controller.hasAttribute('disabled'))

        expect(layerController).toEqual(true);
      });
      test("[" + browserType + "]" + " isVisible property false when zoomed out of bounds (zooming out)", async () => {

        for (let i = 0; i < zoomOut + zoomIn; i++)
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');

        const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
          (controller) => controller.hasAttribute('disabled'))

        expect(layerController).toEqual(true);
      });
    }
  );

};