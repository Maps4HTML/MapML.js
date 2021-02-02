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

        test("[" + browserType + "]" + " Query link does not show when out of bounds", async () => {
          await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.078210, -9.010487, 0));
          await page.waitForTimeout(1000);
          await page.click("div");
          await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div", { state: "hidden" });
          const popupNumRight = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

          await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-45.679787, -93.041053, 0));
          await page.waitForTimeout(1000);
          await page.click("div");
          await page.waitForTimeout(1000);
          const popupNumBottom = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

          await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.399782, 177.152220, 0));
          await page.waitForTimeout(1000);
          await page.click("div");
          await page.waitForTimeout(1000);
          const popupNumLeft = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

          await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-32.240953, 94.969783, 0));
          await page.waitForTimeout(1000);
          await page.click("div");
          await page.waitForTimeout(1000);
          const popupNumTop = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

          expect(popupNumRight).toEqual(0);
          expect(popupNumBottom).toEqual(0);
          expect(popupNumLeft).toEqual(0);
          expect(popupNumTop).toEqual(0);
        });

      });
  }
})();
