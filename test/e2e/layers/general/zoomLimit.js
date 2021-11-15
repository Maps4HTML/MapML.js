exports.test = (path, zoomIn, zoomOut) => {
  describe(`Map Zoom Limit Tests for ${path.split(".")[0]}`, () => {
      beforeAll(async () => {
        await page.goto(PATH + path);
        await page.$eval("xpath=/html/body/map",
          (controller) => controller.removeChild(controller.children[1]));
      });

      test("Limit map zooming (zooming in)", async () => {
        for (let i = 0; i < zoomIn; i++) {
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');
          await page.waitForTimeout(500);
        }
        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
          (controller) => controller.className);

        expect(zoomButton).toMatch("disabled");
      });

      test("Allow zooming before reaching limit (zooming in)", async () => {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');
        await page.waitForTimeout(300);
        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in",
          (controller) => controller.className);

        expect(zoomButton).not.toMatch("disabled");
      });

      test("Limit map zooming (zooming out)", async () => {
        for (let i = 0; i < zoomOut + zoomIn - 1; i++) {
          await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');
          await page.waitForTimeout(500);
        }
        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
          (controller) => controller.className);

        expect(zoomButton).toMatch("disabled");
      });

      test("Allow zooming before reaching limit (zooming out)", async () => {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');
        await page.waitForTimeout(300);
        const zoomButton = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out",
          (controller) => controller.className);

        expect(zoomButton).not.toMatch("disabled");
      });
    });
};