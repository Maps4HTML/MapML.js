const playwright = require("playwright");
jest.setTimeout(30000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("Playwright UI Drag&Drop Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + "drag.html");
      });

      afterEach(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " Drag and drop of invalid HTML page", async () => {
        const dataTransfer = await page.evaluateHandle(() =>
          new DataTransfer().setData("text/uri-list", "http://example.com")
        );
        await page.dispatchEvent(".leaflet-control-zoom-in", "dragstart", {
          dataTransfer,
        });

        await page.dispatchEvent("xpath=//html/body/map", "drop", {
          dataTransfer,
        });
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(1);
      });

      test("[" + browserType + "]" + " Drag and drop of layers", async () => {
        const dataTransfer = await page.evaluateHandle(
          () => new DataTransfer()
        );
        await page.hover(".leaflet-top.leaflet-right");
        await page.dispatchEvent("[draggable='true']", "dragstart", {
          dataTransfer,
        });
        await page.dispatchEvent(".leaflet-top.leaflet-right", "drop", {
          dataTransfer,
        });
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(2);
      });

      /* Comment in later on
    test("drag and drop of null object", async () => {
      const dataTransfer = await page.evaluateHandle(
        () => new DataTransfer()
      );
      await page.hover(".leaflet-top.leaflet-right");
      await page.dispatchEvent(".leaflet-control-zoom-in", "dragstart", {
        dataTransfer,
      });
      await page.dispatchEvent(".leaflet-top.leaflet-right", "drop", {
        dataTransfer,
      });
      await page.hover(".leaflet-top.leaflet-right");
      let vars = await page.$$("[draggable='true']");
      expect(vars.length).toBe(1);
    });
    */

      //adding layer in html can add any type of layer the user wants,
      //but how should that layer get treated by the map element,
      //should it be ignored or shown as undefined
      /*
    test("HTML - add additional MapML Layer", async () => {
      const { document } = new JSDOM(`
          <!doctype html>
              <html>
              <head>
                  <title>index-map.html</title>
                  <meta charset="UTF-8">
                  <script type="module" src="dist/web-map.js"></script>
                  <style>
                  html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                  </style>
              </head>
              <body>
                  <map is="web-map" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                      <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                      <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                  </map>     
              </body>
              </html>
          `).window;
      const { select, update } = await domToPlaywright(page, document);

      await update(document);
      await page.hover(".leaflet-top.leaflet-right");
      let vars = await page.$$("[draggable='true']");
      expect(vars.length).toBe(2);
    });
    test("HTML - add additional non-MapML Layer", async () => {
      const { document } = new JSDOM(`
          <!doctype html>
              <html>
              <head>
                  <title>index-map.html</title>
                  <meta charset="UTF-8">
                  <script type="module" src="dist/web-map.js"></script>
                  <style>
                  html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                  </style>
              </head>
              <body>
                  <map is="web-map" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                      <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                      <layer- label='CBMT' src='https://example.com/' checked></layer->
                  </map>     
              </body>
              </html>
          `).window;
      const { select, update } = await domToPlaywright(page, document);

      await update(document);
      await page.hover(".leaflet-top.leaflet-right");
      let vars = await page.$$("[draggable='true']");
      expect(vars.length).toBe(1);
    });
    */
    });
  }
})();
