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
          await page.goto(PATH + "mapElement.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Initial map element extent", async () => {
          const extent = await page.$eval(
            "body > map",
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
            "body > map",
            (map) => map.zoomTo(81, -63, 1)
          );
          await page.waitForTimeout(1000);
          const extent = await page.$eval(
            "body > map",
            (map) => map.extent
          );

          expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
        });

        test("[" + browserType + "]" + " Reload button takes you back to initial state", async () => {
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > a");
          const extent = await page.$eval(
            "body > map",
            (map) => map.extent
          );

          const history = await page.$eval(
            "body > map",
            (map) => map._history
          );

          expect(history.length).toEqual(1);
          expect(extent.projection).toEqual("CBMTILE");
          expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
        });
      }
    );
  }
})();