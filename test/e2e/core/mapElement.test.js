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
          await page.goto(PATH + "mapElement.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Initial map element extent", async () => {
          const extent = await page.$eval(
            "body > map",
            (map) => map.extent()
          );

          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
        });
        test("[" + browserType + "]" + " Panned and zoomed initial map's extent", async () => {
          const mapMove = await page.$eval(
            "body > map",
            (map) => map.zoomTo(81, -63, 1)
          );
          const extent = await page.$eval(
            "body > map",
            (map) => map.extent()
          );

          expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
          expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
          expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
          expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
        });
      }
    );
  }
})();