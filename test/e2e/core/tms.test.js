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
          await page.goto(PATH + "tms.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Painting tiles are in proper order", async () => {
          let tileOrder = ["1/0/1", "1/0/0", "1/1/1", "1/1/0"]
          for (let i = 0; i < 4; i++) {
            const feature = await page.$eval(
              `xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > img:nth-child(${i + 1})`,
              (tile) => tile.getAttribute("src")
            );
            expect(feature).toEqual(`https://maps4html.org/TiledArt-Rousseau/TheBanksOfTheBièvreNearBicêtre/${tileOrder[i]}.png`);
          }
        });
      }
    );
  }
})();