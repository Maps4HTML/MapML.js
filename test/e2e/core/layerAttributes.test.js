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

        test("[" + browserType + "]" + " Check attribute removed", async () => {
          await page.$eval("body > mapml-viewer > layer-",
            (layer) => layer.removeAttribute("checked"));
          await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > input",
            (controller) => controller.checked);

          expect(layerController).toEqual(false);
        });
        test("[" + browserType + "]" + " Check attribute added", async () => {
          await page.$eval("body > mapml-viewer > layer-",
            (layer) => layer.setAttribute("checked", ""));
          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > input",
            (controller) => controller.checked);

          expect(layerController).toEqual(true);
        });

        describe(
          "Hidden attribute tests in " + browserType,
          () => {
            test("[" + browserType + "]" + " Control panel hidden when no layers/all layers hidden", async () => {
              await page.$eval("body > mapml-viewer > layer-",
                (layer) => layer.setAttribute("hidden", ""));
              const controlsHidden = await page.$eval(
                "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
                (elem) => elem.hasAttribute("hidden")
              );
              expect(controlsHidden).toEqual(true);
            });
            test("[" + browserType + "]" + " Control panel unhidden when at least one layer with no hidden attribute", async () => {
              await page.$eval("body > mapml-viewer > layer-",
                (layer) => layer.setAttribute("hidden", ""));
              // there's a single layer in the mapml-viewer.html page, so the layer control
              // should disappear (is hidden) when the last layer in it is hidden
              let controlsHidden = await page.$eval(
                "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
                (elem) => elem.hasAttribute("hidden")
              );
              expect(controlsHidden).toEqual(true);
              // so far so good
              await page.$eval("body > mapml-viewer > layer-",
                (layer) => layer.removeAttribute("hidden"));
              controlsHidden = await page.$eval(
                "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control",
                (elem) => elem.hasAttribute("hidden")
              );
              expect(controlsHidden).toEqual(false);
            });
            //        test("[" + browserType + "]" + " Initial map element extent", async () => {
            //          await page.$eval("body > mapml-viewer > layer-",
            //            (layer) => layer.setAttribute("checked", ""));
            //          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > input",
            //            (controller) => controller.checked);
            //
            //          expect(layerController).toEqual(true);
            //        });
          }
        );


        describe(
          "Disabled attributes test in " + browserType,
          () => {
            test("[" + browserType + "]" + " Setting disabled, attribute reset on update/move", async () => {
              await page.$eval("body > mapml-viewer > layer-",
                (layer) => layer.setAttribute("disabled", ""));

              await page.$eval("body > mapml-viewer",
                (map) => map.zoomTo(47, -92, 0));

              let disabled = await page.$eval("body > mapml-viewer > layer-",
                (layer) => layer.hasAttribute("disabled", ""));
              expect(disabled).toEqual(false);
            });
          }
        );
      }
    );
  }
})();