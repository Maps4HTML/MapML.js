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
          await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > label > span",
            { button: "right" });

          const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.querySelector(".mapml-contextmenu.mapml-layer-menu"), nextHandle);

          const menuDisplay = await (await page.evaluateHandle(elem => elem.style.display, resultHandle)).jsonValue();

          expect(menuDisplay).toEqual("block");
        });

        test("[" + browserType + "]" + " Layer context menu copy meta element", async () => {
          await page.keyboard.press("c");
          await page.click("body > textarea");
          await page.keyboard.press("Control+v");
          const copyValue = await page.$eval(
            "body > textarea",
            (text) => text.value
          );

          expect(copyValue).toEqual(`<meta name="extent" content="top-left-easting=-6207743.103886206,top-left-northing=10861943.103886206,top-left-easting=3952277.216154434,top-left-northing=-3362085.3441706896"/>`);
        });
      }
    );
  }
})();