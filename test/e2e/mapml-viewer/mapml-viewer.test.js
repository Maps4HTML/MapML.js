const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  //expected topLeft values in the different cs, at the different
  //positions the map goes in
  let expectedPCRS = [
    { horizontal: -9373489.01871137, vertical: 11303798.154262971 },
    { horizontal: -5059449.140631609, vertical: 10388337.990009308 }];
  let expectedGCRS = [
    { horizontal: -128.07848522325827, vertical: -3.3883427348651636 },
    { horizontal: -131.75138842058425, vertical: 18.07246131233218 }];
  let expectedFirstTileMatrix = [
    { horizontal: 2.57421875, vertical: 2.8515625 },
    { horizontal: 3.0134698275862073, vertical: 2.944773706896552 }];
  let expectedFirstTCRS = [
    { horizontal: 659, vertical: 730 },
    { horizontal: 771.4482758620691, vertical: 753.8620689655173 }];

  let controls = ["leaflet-control-zoom leaflet-bar leaflet-control",
    "mapml-reload-button leaflet-bar leaflet-control",
    "leaflet-control-fullscreen leaflet-bar leaflet-control"];
  let options = ["nozoom", "noreload", "nofullscreen"];

  for (const browserType of BROWSER) {
    describe(
      "Playwright mapml-viewer Element Tests in " + browserType,
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
          const extent = await page.$eval(
            "body > mapml-viewer",
            (map) => map.extent
          );

          expect(extent.projection).toEqual("CBMTILE");
          expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
        });
        test("[" + browserType + "]" + " Panned and zoomed initial map's extent", async () => {
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.zoomTo(81, -63, 1)
          );
          await page.waitForTimeout(1000);
          const extent = await page.$eval(
            "body > mapml-viewer",
            (map) => map.extent
          );

          expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
        });

        describe("Attributes Tests in" + browserType, () => {
          for (let i in controls) {
            describe("Controls List " + options[i] + " Attribute Tests", () => {
              test("[" + browserType + "] " + options[i] + " removes controls", async () => {
                await page.$eval("body > mapml-viewer",
                  (layer, context) => layer.setAttribute("controlslist", context.options[context.i]), { options: options, i: i });

                let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left", (div) => div.children),
                  found = false;
                for (let [key, value] of Object.entries(children)) {
                  if (value.className === controls[i]) found = true;
                }
                expect(found).toEqual(false);
              });
              test("[" + browserType + "]" + " toggle controls, controls aren't re-enabled", async () => {
                await page.click("body > mapml-viewer", { button: "right" });
                await page.click("div > div.mapml-contextmenu > a:nth-child(5)");
                await page.click("body > mapml-viewer", { button: "right" });
                await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

                let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left", (div) => div.children),
                  found = false;
                for (let [key, value] of Object.entries(children)) {
                  if (value.className === controls[i]) found = true;
                }
                expect(found).toEqual(false);
              });

            });
          }
          describe("Controls List nolayer Attribute Tests", () => {
            test("[" + browserType + "] nolayer removes controls", async () => {
              await page.$eval("body > mapml-viewer",
                (layer) => layer.setAttribute("controlslist", "nolayer"));

              let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right", (div) => div.childElementCount);
              expect(children).toEqual(0);
            });
            test("[" + browserType + "]" + " toggle controls, controls aren't re-enabled", async () => {
              await page.click("body > mapml-viewer", { button: "right" });
              await page.click("div > div.mapml-contextmenu > a:nth-child(5)");
              await page.click("body > mapml-viewer", { button: "right" });
              await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

              let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right", (div) => div.childElementCount);
              expect(children).toEqual(0);
            });
          });
        });
      }
    );
  }
})();