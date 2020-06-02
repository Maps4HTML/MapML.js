const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright Style Parsed and Implemented Test in " + browserType,
      () => {
        beforeAll(async () => {
          browser = await playwright[browserType].launch({
            headless: ISHEADLESS,
          });
          context = await browser.newContext();
          page = await context.newPage();
          if (browserType === "firefox") {
            await page.waitForNavigation();
          }
          await page.goto(PATH + "styleOrder.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        //tests using the 1st map in the page
        test("["+browserType+"]"+" CSS within html page added to inorder to overlay-pane container", async () => {
          const styleContent = await page.$eval(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div",
            (styleE) => styleE.innerHTML
          );
          expect(styleContent.indexOf("first")).toBeLessThan(
            styleContent.indexOf(".second")
          ) &&
            expect(styleContent.indexOf(".third")).toBeLessThan(
              styleContent.indexOf("forth")
            );
        });

        test("["+browserType+"]"+" CSS from a retrieved MapML file added inorder inside templated-layer container", async () => {
          const firstStyle = await page.$eval(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link",
            (styleE) => styleE.outerHTML
          );
          const secondStyle = await page.$eval(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)",
            (styleL) => styleL.outerHTML
          );
          expect(firstStyle).toMatch("canvec_cantopo") &&
            expect(secondStyle).toMatch("canvec_feature");
        });

        test("["+browserType+"]"+" CSS within html page added to overlay-pane container", async () => {
          const foundStyleLink = await page.$("#first");
          const foundStyleTag = await page.$(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style:nth-child(2)"
          );
          expect(foundStyleTag).toBeTruthy() &&
            expect(foundStyleLink).toBeTruthy();
        });

        test("["+browserType+"]"+" CSS from a retrieved MapML File added to templated-layer container", async () => {
          const foundStyleLinkOne = await page.$(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link"
          );
          const foundStyleLinkTwo = await page.$(
            "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)"
          );
          expect(foundStyleLinkOne).toBeTruthy() &&
            expect(foundStyleLinkTwo).toBeTruthy();
        });

        //testing done on 2nd map in the page
        test("["+browserType+"]"+" CSS from a retrieved MapML file added inorder inside svg within templated-tile-container", async () => {
          const firstStyle = await page.$eval(
            "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg:nth-child(1) > style:nth-child(1)",
            (styleE) => styleE.innerHTML
          );
          const secondStyle = await page.$eval(
            "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg:nth-child(1) > style:nth-child(2)",
            (styleE) => styleE.innerHTML
          );
          const foundStyleLink = await page.$(
            "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg:nth-child(1) > link"
          );
          expect(firstStyle).toMatch("refStyleOne") &&
            expect(secondStyle).toMatch("refStyleTwo") &&
            expect(foundStyleLink).toBeTruthy();
        });
        test("["+browserType+"]"+" CSS within html page added inorder to overlay-pane container", async () => {
          const foundStyleLink = await page.$(
            "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > link"
          );
          const foundStyleTag = await page.$(
            "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style"
          );
          expect(foundStyleTag).toBeTruthy() &&
            expect(foundStyleLink).toBeTruthy();
        });
      }
    );
  }
})();
