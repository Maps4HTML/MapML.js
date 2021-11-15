exports.test = (path, zoomIn, zoomOut) => {
  describe(`isVisible Property Tests for ${path.split(".")[0]}`, () => {
    beforeAll(async () => {
      await page.goto(PATH + path);
    });

    test("isVisible property false when zoomed out of bounds (zooming in)", async () => {
      for (let i = 0; i < zoomIn; i++) {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in');
        await page.waitForTimeout(300);
      }
      await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
      const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
        (controller) => controller.hasAttribute('disabled'))

      expect(layerController).toEqual(true);
    });
    test("isVisible property false when zoomed out of bounds (zooming out)", async () => {

      for (let i = 0; i < zoomOut + zoomIn; i++) {
        await page.click('div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out');
        await page.waitForTimeout(300);
      }
      const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
        (controller) => controller.hasAttribute('disabled'))

      expect(layerController).toEqual(true);
    });
  });
};