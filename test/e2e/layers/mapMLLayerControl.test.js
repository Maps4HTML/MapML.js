describe("Playwright mapMLLayerControl Tests", () => {
  describe("Control Layer Panel Tests", () => {
    beforeAll(async () => {
      await page.goto(PATH + "mapMLLayerControl.html");
    });

    afterAll(async function () {
      await context.close();
    });

    test("Control panel hidden when no layers/all layers hidden", async () => {
      const controlsHidden = await page.$eval(
        "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
        (elem) => elem.hasAttribute("hidden")
      );
      await expect(controlsHidden).toEqual(true);
    });

    test("Control panel shown when layers are on map", async () => {
      const controlsHidden = await page.$eval(
        "css=body > mapml-viewer:nth-child(2) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
        (elem) => elem.hasAttribute("hidden")
      );
      await expect(controlsHidden).toEqual(false);
    });
  });
});