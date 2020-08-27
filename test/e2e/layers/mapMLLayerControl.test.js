const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLLayerControl Tests in " + browserType,
      () => {
        describe("Control Layer Panel Tests", () => {
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
            await page.goto(PATH + "mapMLLayerControl.html");
          });

          afterAll(async function () {
            await browser.close();
          });

          test("[" + browserType + "]" + " Control panel hidden when no layers/all layers hidden", async () => {
            const controlsHidden = await page.$eval(
              "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
              (elem) => elem.hasAttribute("hidden")
            );
            expect(controlsHidden).toEqual(true);
          });

          test("[" + browserType + "]" + " Control panel shown when layers are on map", async () => {
            const controlsHidden = await page.$eval(
              "css=body > mapml-viewer:nth-child(2) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
              (elem) => elem.hasAttribute("hidden")
            );
            expect(controlsHidden).toEqual(false);
          });
        });
      }
    );
  }
})();
