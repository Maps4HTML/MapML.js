const playwright = require("playwright");

exports.test = (path, zoomIn, zoomOut, browserType) => {
  let page, browser, context;
  describe(
    `Map Zoom Limit Tests for ${path.split(".")[0]} in ` + browserType,
    () => {
      beforeAll(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
          slowMo: 70,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + path);
        await page.$eval("xpath=/html/body/map",
          (controller) => controller.removeChild(controller.children[1]));
      });

      afterAll(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " Limit map zooming (zooming in)", async () => {
        for (let i = 0; i < zoomIn; i++)
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');

        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
          (controller) => controller.className);

        expect(zoomButton).toMatch("disabled");
      });

      test("[" + browserType + "]" + " Allow zooming before reaching limit (zooming in)", async () => {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');

        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
          (controller) => controller.className);

        expect(zoomButton).not.toMatch("disabled");
      });

      test("[" + browserType + "]" + " Limit map zooming (zooming out)", async () => {
        for (let i = 0; i < zoomOut + zoomIn - 1; i++)
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');

        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
          (controller) => controller.className);

        expect(zoomButton).toMatch("disabled");
      });

      test("[" + browserType + "]" + " Allow zooming before reaching limit (zooming out)", async () => {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');

        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
          (controller) => controller.className);

        expect(zoomButton).not.toMatch("disabled");
      });
    }
  );

};