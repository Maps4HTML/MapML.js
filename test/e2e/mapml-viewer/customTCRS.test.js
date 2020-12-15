const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    describe(
      "Playwright Custom TCRS Tests in " + browserType,
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
          await page.goto(PATH + "customTCRS.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Simple Custom TCRS, tiles load, mismatched layer disabled", async () => {
          const misMatchedLayerDisabled = await page.$eval(
            "body > mapml-viewer:nth-child(1) > layer-:nth-child(1)",
            (layer) => layer.hasAttribute('disabled'));

          const tilesLoaded = await page.$eval(
            "xpath=//html/body/mapml-viewer[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-static-tile-layer > div",
            (tileGroup) => tileGroup.getElementsByTagName("tile").length
          );

          expect(tilesLoaded).toEqual(2);
          expect(misMatchedLayerDisabled).toEqual(true);
        });
        test("[" + browserType + "]" + " Complex Custom TCRS, static features loaded, templated features loaded", async () => {
          const staticFeatures = await page.$eval(
            "body > mapml-viewer:nth-child(2) > layer-:nth-child(1)",
            (layer) => layer.hasAttribute('disabled'));

          const templatedFeatures = await page.$eval(
            "body > mapml-viewer:nth-child(2) > layer-:nth-child(2)",
            (layer) => layer.hasAttribute('disabled'));


          const featureOne = await page.$eval(
            "xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(1)",
            (tile) => tile.getAttribute("d")
          );
          const featureTwo = await page.$eval(
            "xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(2)",
            (tile) => tile.getAttribute("d")
          );

          const featureThree = await page.$eval(
            "xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(3)",
            (tile) => tile.getAttribute("d")
          );
          const featureFour = await page.$eval(
            "xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > path:nth-child(4)",
            (tile) => tile.getAttribute("d")
          );


          expect(featureOne).toEqual("M-53 553L74 553L21 78L-53 98z");
          expect(featureTwo).toEqual("M357 553L307 456L553 465L553 553z");

          expect(featureThree).toEqual("M382 -28L553 -28L553 399L382 399z");
          expect(featureFour).toEqual("M150 429L171 426L181 457L185 465L187 465L184 472L188 485L154 490L158 498L156 501L151 499L150 495L148 501L144 501L141 477L141 431L139 430z");

          expect(staticFeatures).toEqual(false);
          expect(templatedFeatures).toEqual(false);

        });
      }
    );
  }
})();