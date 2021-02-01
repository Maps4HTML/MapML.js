const playwright = require("playwright");

jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright Query Link Tests in " + browserType,
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
          await page.goto(PATH + "queryLink.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Query link shows when within bounds", async () => {
          await page.click("div");
          await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
          const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
          expect(popupNum).toEqual(1);
        });

        test("[" + browserType + "]" + " Query link closes previous popup when new query made within bounds", async () => {
          await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(9, -27, 0));
          await page.waitForTimeout(1000);
          await page.click("div");
          await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
          const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
          expect(popupNum).toEqual(1);
        });
      });
  }
})();