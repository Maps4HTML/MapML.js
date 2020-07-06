const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright mapMLStaticTile Layer Tests in " + browserType,
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
          await page.goto(PATH + "mapMLStaticTileLayer.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Tiles load in on default map zoom level", async () => {
          const tiles = await page.$eval(
            "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-static-tile-layer > div",
            (tileGroup) => tileGroup.getElementsByTagName("tile").length
          );
          expect(tiles).toEqual(3);
        });

        test("[" + browserType + "]" + " isVisible property false when zoomed out of bounds (zooming in)", async () => {
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');

          await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
            (controller) => controller.hasAttribute('disabled'))

          expect(layerController).toEqual(true);
        });
        test("[" + browserType + "]" + " isVisible property false when zoomed out of bounds (zooming out)", async () => {

          for (let i = 0; i < 5; i++)
            await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');

          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
            (controller) => controller.hasAttribute('disabled'))

          expect(layerController).toEqual(true);
        });
      }
    );
  }
})();
