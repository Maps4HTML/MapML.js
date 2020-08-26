const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  //expected topLeft values in the different cs, at the different
  //positions the map goes in
  let expectedPCRS = [
    { horizontal: -5537023.0124460235, vertical: 2671749.64016594 },
    { horizontal: -2810486.309372615, vertical: 5328171.619676568 }];
  let expectedGCRS = [
    { horizontal: -134.50882532096858, vertical: 34.758856143866666 },
    { horizontal: -146.23778791492126, vertical: 54.997129539321016 }];
  let expectedFirstTileMatrix = [
    { horizontal: 2.96484375, vertical: 3.7304687500000004 },
    { horizontal: 3.242456896551724, vertical: 3.4599946120689657 }];
  let expectedFirstTCRS = [
    { horizontal: 759, vertical: 955.0000000000001 },
    { horizontal: 830.0689655172414, vertical: 885.7586206896552 }];

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
      }
    );
  }
})();