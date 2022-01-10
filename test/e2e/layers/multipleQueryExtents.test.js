describe("Playwright Query Link Tests", () => {
    beforeAll(async () => {
      await page.goto(PATH + "multipleQueryExtents.html");
    });

    afterAll(async function () {
        await context.close();
      });

      describe("Multiple Extent Query Tests", () => {

        test("Query on overlapping extents returns features from both extents", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(85, 147, 0));
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
            let numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("1/12");

          });
          
        test("Turning layer off then on restores query links", async () => {
            await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
            // remove the layer by clearing its checkbox
            await page.click("text='Multiple Query Extents'");
            
            // a query now should return nothing.
            
            // turn layer back on
            await page.click("text='Multiple Query Extents'");
            
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("1/12");
        });

          test("Querying overlapping extents, user is able to navigate into second set of query results using popup controls", async () => {
            let feature;
            for (let i = 0; i < 6; i++) {
                await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
                feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            }
            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
                  
            await expect(feature).toEqual("M264 285L268 285L269 287L270 291L271 292L271 293L271 293L272 293L271 294L271 294L271 294L271 295L271 296L272 297L271 297L265 298L265 299L265 299L265 300L266 300L265 300L265 300L264 300L264 299L264 299L264 300L264 300L263 300L262 295L262 289L262 286L262 286L264 285z");
            await expect(popup).toEqual("Alabama");
            await expect(numFeatures).toEqual("7/12");
          });

          test("Navigate back from second query result set to end of first query result set by clicking '< / Previous'", async () => {
            // click the '<' (previous) button in the popup. 
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)");
            const feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            await expect(feature).toEqual("M227 118 L214.5 88 C214.5 68, 239.5 68, 239.5 88 L227 118z");
            
            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            await expect(popup).toEqual("No Geometry");

            const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("6/12");
          });

          test("Popup comes up when non overlapping bounds clicked", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(10, 5, 0));
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            await expect(popupNum).toEqual(1);
          });

          test("Only features from one extent are returned for queries inside its (non overlapping) bounds", async () => {
            var numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("1/6");
            let feature;
            for (let i = 0; i < 6; i++) {
              await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
              feature = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g > path",
                (tile) => tile.getAttribute("d"));
            }
            await expect(feature).toEqual("M495 123 L482.5 93 C482.5 73, 507.5 73, 507.5 93 L495 123z");

            const popup = await page.$eval(
                "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
                (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
            await expect(popup).toEqual("No Geometry");

            numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
            await expect(numFeatures).toEqual("6/6");
          });

          test("No features returned when queried outside of bounds of all extents", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-18, 5, 0));
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div", { state: "hidden" });
            const popupNumRight = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-16, -40, 0));
            await page.click("div");
            const popupNumBottom = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(33, -170, 0));
            await page.click("div");
            const popupNumLeft = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(30, 98, 0));
            await page.click("div");
            const popupNumTop = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await expect(popupNumRight).toEqual(0);
            await expect(popupNumBottom).toEqual(0);
            await expect(popupNumLeft).toEqual(0);
            await expect(popupNumTop).toEqual(0);
        });


      });
});