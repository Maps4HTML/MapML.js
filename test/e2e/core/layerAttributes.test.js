describe("Playwright Checked Attribute Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "mapml-viewer.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Check attribute removed", async () => {
    await page.$eval("body > mapml-viewer > layer-",
      (layer) => layer.removeAttribute("checked"));
    await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
    const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input",
      (controller) => controller.checked);

    await expect(layerController).toEqual(false);
  });
  test("Check attribute added", async () => {
    await page.$eval("body > mapml-viewer > layer-",
      (layer) => layer.setAttribute("checked", ""));
    const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input",
      (controller) => controller.checked);

    await expect(layerController).toEqual(true);
  });

  describe(
    "Hidden attribute tests", () => {
      test("Control panel hidden when no layers/all layers hidden", async () => {
        await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.setAttribute("hidden", ""));
        const controlsHidden = await page.$eval(
          "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
          (elem) => elem.hasAttribute("hidden")
        );
        await expect(controlsHidden).toEqual(true);
      });
      test("Control panel unhidden when at least one layer with no hidden attribute", async () => {
        await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.setAttribute("hidden", ""));
        // there's a single layer in the mapml-viewer.html page, so the layer control
        // should disappear (is hidden) when the last layer in it is hidden
        let controlsHidden = await page.$eval(
          "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
          (elem) => elem.hasAttribute("hidden")
        );
        await expect(controlsHidden).toEqual(true);
        // so far so good
        await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.removeAttribute("hidden"));
        controlsHidden = await page.$eval(
          "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
          (elem) => elem.hasAttribute("hidden")
        );
        await expect(controlsHidden).toEqual(false);
      });
      //        test("[" + browserType + "]" + " Initial map element extent", async () => {
      //          await page.$eval("body > mapml-viewer > layer-",
      //            (layer) => layer.setAttribute("checked", ""));
      //          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > div > label > input",
      //            (controller) => controller.checked);
      //
      //          expect(layerController).toEqual(true);
      //        });
    }
  );

  describe("Disabled attributes test", () => {
      test("Setting disabled, attribute reset on update/move", async () => {
        await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.setAttribute("disabled", ""));

        await page.$eval("body > mapml-viewer",
          (map) => map.zoomTo(47, -92, 0));

        let disabled = await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.hasAttribute("disabled", ""));
        await expect(disabled).toEqual(false);
      });
    }
  );

  describe("Opacity setters & getters test", () => {
      test("Setting opacity", async () => {
        await page.reload();
        await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.opacity = 0.4);
        let value = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input[type=range]",
          (input) => input.value);
        await expect(value).toEqual("0.4");
      });

      test("Getting appropriate opacity", async () => {
        let value = await page.$eval("body > mapml-viewer > layer-",
          (layer) => layer.opacity);
        await expect(value).toEqual("0.4");
      });
    }
  );
});