const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    describe(
      "Playwright Map Element Tests in " + browserType,
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
          await page.goto(PATH + "debugMode.html");
        });

        afterAll(async function () {
          await browser.close();
        });


        test("[" + browserType + "]" + " Debug elements added to map", async () => {
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.toggleDebug()
          );

          const panel = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel",
            (panelElem) => panelElem.childElementCount
          );

          const banner = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-banner",
            (bannerElem) => bannerElem.innerText
          );

          const grid = await page.$eval(
            "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid",
            (gridElem) => gridElem.childElementCount
          )

          expect(panel).toEqual(6);
          expect(banner).toEqual("DEBUG MODE");
          expect(grid).toEqual(1);

        });

        test("[" + browserType + "]" + " Reasonable debug layer extent created", async () => {
          const feature = await page.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
            (tile) => tile.getAttribute("d")
          );
          expect(feature).toEqual("M82.51724137931035 332.27586206896535L347.34482758620686 332.27586206896535L347.34482758620686 -38.48275862068965L82.51724137931035 -38.48275862068965z");
        });

        test("[" + browserType + "]" + " Large debug layer extent created", async () => {
          const feature = await page.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
            (tile) => tile.getAttribute("d")
          );
          expect(feature).toEqual("M-659 500L365 500L365 -780L-659 -780z");
        });

        test("[" + browserType + "]" + " Debug layer extent beyond ((0,0), (5,5))  created", async () => {
          const feature = await page.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
            (tile) => tile.getAttribute("d")
          );
          expect(feature).toEqual("M-1683 1268L1133 1268L1133 -1292L-1683 -1292z");
        });

        test("[" + browserType + "]" + " Accurate debug coordinates", async () => {
          await page.hover("body > mapml-viewer");
          const tile = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(1)",
            (tileElem) => tileElem.innerText
          );
          const matrix = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(2)",
            (matrixElem) => matrixElem.innerText
          );
          const map = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(3)",
            (mapElem) => mapElem.innerText
          );
          const tcrs = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(4)",
            (tcrsElem) => tcrsElem.innerText
          );
          const pcrs = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(5)",
            (pcrsElem) => pcrsElem.innerText
          );
          const gcrs = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel > div:nth-child(6)",
            (gcrsElem) => gcrsElem.innerText
          );

          expect(tile).toEqual("tile: i: 141, j: 6");
          expect(matrix).toEqual("tilematrix: column:3.55, row:4.02");
          expect(map).toEqual("map: i: 250, j: 250");
          expect(tcrs).toEqual("tcrs: x:909.00, y:1030.00");
          expect(pcrs).toEqual("pcrs: easting:217676.00, northing:-205599.86");
          expect(gcrs).toEqual("gcrs: lon: -92.15, lat: 47.11");
        });

        test("[" + browserType + "]" + " Layer disabled attribute update when controls are toggled off", async () => {
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.toggleDebug()
          );

          await page.$eval(
            "body > mapml-viewer",
            (map) => map.zoomTo(-51, 170, 0)
          );

          await page.waitForTimeout(1000);

          const layer = await page.$eval(
            "body > mapml-viewer > layer-:nth-child(1)",
            (elem) => elem.hasAttribute("disabled")
          );

          expect(layer).toEqual(true);
        });

        test("[" + browserType + "]" + " Debug mode correctly re-enabled after disabling", async () => {
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.back()
          );
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.toggleDebug()
          );

          const panel = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-panel",
            (panelElem) => panelElem.childElementCount
          );

          const banner = await page.$eval(
            "div > div.mapml-debug > div.mapml-debug-banner",
            (bannerElem) => bannerElem.innerText
          );

          const grid = await page.$eval(
            "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid",
            (gridElem) => gridElem.childElementCount
          )

          expect(panel).toEqual(6);
          expect(banner).toEqual("DEBUG MODE");
          expect(grid).toEqual(1);

        });

        test("[" + browserType + "]" + " Layer deselected then reselected", async () => {
          await page.hover(".leaflet-top.leaflet-right");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > details > summary");
          const feature = await page.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g",
            (tile) => tile.childElementCount
          );
          expect(feature).toEqual(3);
        });

        test("[" + browserType + "]" + " Layer deselected then reselected", async () => {
          await page.hover(".leaflet-top.leaflet-right");
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > details > summary");
          const feature = await page.$eval(
            "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
            (tile) => tile.getAttribute("d")
          );
          expect(feature).toEqual("M82.51724137931035 332.27586206896535L347.34482758620686 332.27586206896535L347.34482758620686 -38.48275862068965L82.51724137931035 -38.48275862068965z");
        });
      }
    );
  }
})();