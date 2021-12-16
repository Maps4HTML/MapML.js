describe("Playwright Query Link Tests", () => {
    beforeAll(async () => {
      await page.goto(PATH + "multipleQueryExtents.html");
    });

    afterAll(async function () {
        await context.close();
      });

      describe("Multiple Query Features Popup Tests", () => {

        test("12 Query links show when two overlapping extents", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(85, 147, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(500);
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("1/12");
          });

          test("7th feature added and popup content updated when overlapping extents", async () => {
            for (let i = 0; i < 6; i++)
                await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(7) > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
                  
            await expect(feature).toEqual("M264 285L268 285L269 287L270 291L271 292L271 293L271 293L272 293L271 294L271 294L271 294L271 295L271 296L272 297L271 297L265 298L265 299L265 299L265 300L266 300L265 300L265 300L264 300L264 299L264 299L264 300L264 300L263 300L262 295L262 289L262 286L262 286L264 285z");
            await expect(popup).toEqual("Alabama");
            await expect(numFeatures).toEqual("7/12");
          });

          test("6th feature added and popup content updated when previous button clicked with overlapping extents", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)");
            const feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(7) > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
                  
            await expect(feature).toEqual("M227 118 L214.5 88 C214.5 68, 239.5 68, 239.5 88 L227 118z");
            await expect(popup).toEqual("No Geometry");
            await expect(numFeatures).toEqual("6/12");
          });

          test("Popup comes up when non overlapping bounds clicked", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(10, 5, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(500);
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            await expect(popupNum).toEqual(1);
          });

          test("Verify only 6 features for non overlapping bounds", async () => {
            var numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("1/6");

            for (let i = 0; i < 6; i++)
                await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(7) > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
                      
                await expect(feature).toEqual("M495 123 L482.5 93 C482.5 73, 507.5 73, 507.5 93 L495 123z");
                await expect(popup).toEqual("No Geometry");
                await expect(numFeatures).toEqual("6/6");
          });

          test("No query links show when clicked out of bounds", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-18, 5, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div", { state: "hidden" });
            const popupNumRight = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-16, -40, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumBottom = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(33, -170, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumLeft = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(30, 98, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumTop = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await expect(popupNumRight).toEqual(0);
            await expect(popupNumBottom).toEqual(0);
            await expect(popupNumLeft).toEqual(0);
            await expect(popupNumTop).toEqual(0);
        });


      });
});