describe("Playwright Query Link Tests", () => {

    afterAll(async function () {
        await context.close();
      });

    describe("Multiple Extent Query Tests", () => {
      beforeAll(async () => {
        await page.goto(PATH + "multipleQueryExtents.html");
      });

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
        // navigate into second set of query results (7th feature)
        for (let i = 0; i < 6; i++) {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe");
        }
        const popup = await page.$eval(
            "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
            (iframe) => iframe.contentWindow.document.querySelector("h1").innerText);
        await expect(popup).toEqual("Alabama");
        const numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        await expect(numFeatures).toEqual("7/12");
        feature = await page.$eval(
            "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g > path",
            (tile) => tile.getAttribute("d"));      
        await expect(feature).toEqual("M264 285L268 285L269 287L270 291L271 292L271 293L271 293L272 293L271 294L271 294L271 294L271 295L271 296L272 297L271 297L265 298L265 299L265 299L265 300L266 300L265 300L265 300L264 300L264 299L264 299L264 300L264 300L263 300L262 295L262 289L262 286L262 286L264 285z");
      });

      test("Navigate back from second query result set to end of first query result set by clicking '< / Previous'", async () => {
        // click the '<' (previous) button in the popup. 
        await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)");
        const feature = await page.$eval(
            "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g",
            (g) => g.firstElementChild ? g.firstElementChild : false);
        await expect(feature).toBeFalsy();

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
        for (let i = 0; i < 6; i++) {
          await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
          await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe");
        }
        let feature = await page.$eval(
          "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g",
          (g) => g.firstElementChild ? g.firstElementChild : false);
        await expect(feature).toBeFalsy();

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
    
    describe("Multiple Extent Queries with heterogeneous response content types", () => {
      beforeEach(async () => {
        await page.goto(PATH + "multipleHeterogeneousQueryExtents.html");
      });
      test("Query multiple overlapping extents which return heterogeneous document types (text/mapml, text/html)", async () =>{
        await page.click("div");
        await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
        let numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        await expect(numFeatures).toEqual("1/7");
        
        let content = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
            (iframe) => iframe.contentWindow.document.querySelector("body").innerText);
        await expect(content).toBe("This is an HTML document response for a MapML query.");
      });
      test("Re-order queryable extents, verify response order changes accordingly", async () => {
        // starting conditions
        let firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
        await expect(firstExtentInLayerControl).toEqual("cbmt");
        let secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
        await expect(secondExtentInLayerControl).toEqual("html query response");
        let thirdExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span", (span) => span.innerText.toLowerCase());
        await expect(thirdExtentInLayerControl).toEqual("mapml query response");

        // reverse the order of the html and mapml query extents via the layer control
        await page.hover(".leaflet-top.leaflet-right");
        // expand the layer settings
        await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
        // get the bounds of the HTML query extent control in the layer control
        let control = await page.$("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)");
        let controlBBox = await control.boundingBox();
        // drag it down the page one notch / up in the ZIndex order by one
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) + 48);
        // drop it
        await page.mouse.up();

        // having been re-ordered, MapML query extent should be second in the layer control
        firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
        await expect(firstExtentInLayerControl).toEqual("cbmt");
        secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
        await expect(secondExtentInLayerControl).toEqual("mapml query response");
        thirdExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span", (span) => span.innerText.toLowerCase());
        await expect(thirdExtentInLayerControl).toEqual("html query response");
        
        await page.click("div");
        await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
        let numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        await expect(numFeatures).toEqual("1/7");
        
        let content = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
            (iframe) => iframe.contentWindow.document.querySelector("body").innerText);
        await expect(content).toBe("Alabama");
        for (let i = 0; i < 6; i++) {
          await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
          await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe");
        }
        content = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
            (iframe) => iframe.contentWindow.document.querySelector("body").innerText);
        await expect(content).toBe("This is an HTML document response for a MapML query.");
      });
      test("Enusre extents that are unchecked or removed are not included in query results", async () => {
        // starting conditions
        let firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
        await expect(firstExtentInLayerControl).toEqual("cbmt");
        let secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
        await expect(secondExtentInLayerControl).toEqual("html query response");
        let thirdExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span", (span) => span.innerText.toLowerCase());
        await expect(thirdExtentInLayerControl).toEqual("mapml query response");
        
        // show the layer control
        await page.hover(".leaflet-top.leaflet-right");
        // turn the Multiple Extents layer off
        await page.click("text='Multiple Heterogeneous Query Extents'");
        let layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
        await expect(layersCount).toEqual(0);

        // query the page, nothing should happen
        await page.click("div");
        let popupContent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (pane) => pane.childElementCount);
        await expect(popupContent).toEqual(0);

        // show the layer control
        await page.hover(".leaflet-top.leaflet-right");
        // turn the Multiple Extents layer on
        await page.click("text='Multiple Heterogeneous Query Extents'");
        layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
        await expect(layersCount).toEqual(1);

        // query the page, should display popup, create popup content
        await page.click("div");
        popupContent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (pane) => pane.childElementCount);
        await expect(popupContent).toEqual(1);
        let numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        // the mapml response has 6 features, the html response is tallied as 1 feature
        await expect(numFeatures).toEqual("1/7");
        
        // show the layer control
        await page.hover(".leaflet-top.leaflet-right");
        // display layer settings for first layer, exposes extents for clicking
        await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-properties > div.mapml-layer-item-controls > button.mapml-layer-item-settings-control");
        // turn the second (queryable) extent off by clicking its label
        await page.click("text='HTML query response'");

        // query the page, should create popup content
        await page.click("div");
        await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
        numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        await expect(numFeatures).toEqual("1/6");
        // show the layer control
        await page.hover(".leaflet-top.leaflet-right");
        // layer settings for top layer are already displayed
        // turn the second (queryable) extent back on by clicking its label
        await page.click("text='HTML query response'");
        // remove it entirely
        await page.click("fieldset.mapml-layer-extent:nth-child(2) button[title='Remove Sub Layer'].mapml-layer-item-remove-control");
        
        // query the page, should create popup content
        await page.click("div");
        await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p");
        numFeatures = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p", (p) => p.innerText);
        // the mapml response has 6 features, the html response is tallied as 1 feature
        await expect(numFeatures).toEqual("1/6");
      });
    });
});