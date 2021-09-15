const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright Layer Context Menu Tests in " + browserType,
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
          await page.goto(PATH + "layerContextMenu.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Layer context menu shows when layer is clicked", async () => {
          await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > details > summary > div > label > span",
            { button: "right" });

          const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.querySelector(".mapml-contextmenu.mapml-layer-menu"), nextHandle);

          const menuDisplay = await (await page.evaluateHandle(elem => elem.style.display, resultHandle)).jsonValue();

          expect(menuDisplay).toEqual("block");
        });

        test("[" + browserType + "]" + " Layer context menu copy layer extent", async () => {
          await page.keyboard.press("c");
          await page.click("body > textarea");
          await page.keyboard.press("Control+v");
          const copyValue = await page.$eval(
            "body > textarea",
            (text) => text.value
          );

          expect(copyValue).toEqual("<map-meta name=\"extent\" content=\"top-left-easting=-6207743.103886206, top-left-northing=10861943.103886206, bottom-right-easting=3952277.216154434, bottom-right-northing=-3362085.3441706896\"/>");
        });

        test("[" + browserType + "]" + " Map zooms in to layer 2", async () => {
          await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > details > summary > div > label > span",
            { button: "right" });
          await page.keyboard.press("z");
          await page.waitForTimeout(1000);
          const mapLocation = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getPixelBounds()
          );

          const mapZoom = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getZoom()
          );

          expect(mapZoom).toEqual(11);
          expect(mapLocation).toEqual({ max: { x: 43130, y: 43130 }, min: { x: 42630, y: 42630 } });
        });

        test("[" + browserType + "]" + " Map zooms out to layer 3", async () => {
          for (let i = 0; i < 5; i++)
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in");

          await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(3) > details > summary > div > label > span",
            { button: "right" });
          await page.keyboard.press("z");
          await page.waitForTimeout(1000);
          const mapLocation = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getPixelBounds()
          );

          const mapZoom = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getZoom()
          );

          expect(mapZoom).toEqual(11);
          expect(mapLocation).toEqual({ max: { x: 43130, y: 43557 }, min: { x: 42630, y: 43057 } });
        });

        test("[" + browserType + "]" + " Map zooms out to layer 4", async () => {
          for (let i = 0; i < 5; i++)
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in");

          await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(4) > details > summary > div > label > span",
            { button: "right" });
          await page.keyboard.press("z");
          await page.waitForTimeout(1000);
          const mapLocation = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getPixelBounds()
          );

          const mapZoom = await page.$eval(
            "body > mapml-viewer",
            (text) => text._map.getZoom()
          );

          expect(mapZoom).toEqual(5);
          expect(mapLocation).toEqual({ max: { x: 8084, y: 8084 }, min: { x: 7584, y: 7584 } });
        });
      }
    );
  }
})();