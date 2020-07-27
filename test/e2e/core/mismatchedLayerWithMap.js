const playwright = require("playwright");
jest.setTimeout(30000);

(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("Playwright Mismatched Layers Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: false,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH);
      });

      afterEach(async function () {
        //await browser.close();
      });

      test("[" + browserType + "] " + "CBMTILE Map with OSMTILE layer", async () => {
        await page.setContent(`
        <!doctype html>
            <html>
            <head>
                <title>index-map.html</title>
                <meta charset="UTF-8">
                <script type="module" src="../dist/web-map.js"></script>
                <style>
                html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                </style>
            </head>
            <body>
                <map is="web-map" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                    <layer- id="checkMe" label="OpenStreetMap" src="http://geogratis.gc.ca/mapml/en/osmtile/osm/" checked></layer->
                </map>     
            </body>
            </html>
        `);
        await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
        const cbmtileLayer = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
          (controller) => controller.hasAttribute('disabled'));
        const osmtileLayer = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2)",
          (controller) => controller.hasAttribute('disabled'))

        expect(cbmtileLayer).toEqual(false);
        expect(osmtileLayer).toEqual(true);

      });

      test("[" + browserType + "] " + "OSMTILE Map with CBMTILE layer", async () => {
        await page.setContent(`
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
                <map is="web-map" projection="OSMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- id="checkMe" label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                    <layer- label="OpenStreetMap" src="http://geogratis.gc.ca/mapml/en/osmtile/osm/" checked></layer->
                </map>     
            </body>
            </html>
        `);
        await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > a');
        const cbmtileLayer = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)",
          (controller) => controller.hasAttribute('disabled'));
        const osmtileLayer = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2)",
          (controller) => controller.hasAttribute('disabled'))

        expect(cbmtileLayer).toEqual(true);
        expect(osmtileLayer).toEqual(false);
      });
    });
  }
})();
