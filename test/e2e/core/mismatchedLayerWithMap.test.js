import { test, expect, chromium } from '@playwright/test';

test.describe("Playwright Mismatched Layers Test", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
  });
  test.beforeEach(async () => {
    page = await context.newPage();
    await page.goto("empty.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("CBMTILE Map with OSMTILE layer", async () => {
    await page.setContent(`
        <!doctype html>
            <html>
            <head>
                <title>index-map.html</title>
                <meta charset="UTF-8">
                <script type="module" src="web-map.js"></script>
                <style>
                html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                </style>
            </head>
            <body>
                <map is="web-map" style="width:500px;height:500px" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- label='CBMT' src='cbmtile-cbmt.mapml' checked></layer->
                    <layer- id="checkMe" label="OpenStreetMap" src="osm.mapml" checked></layer->
                </map>     
            </body>
            </html>
        `);
    await page.waitForLoadState('networkidle');
    await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right');
    const cbmtileLayer = await page.$eval("body > map > layer-:nth-child(1)",
      (controller) => controller.hasAttribute('disabled'));
    const osmtileLayer = await page.$eval("#checkMe",
      (controller) => controller.hasAttribute('disabled'));

    expect(cbmtileLayer).toEqual(false);
    expect(osmtileLayer).toEqual(true);
  });

  test("OSMTILE Map with CBMTILE layer", async () => {
    await page.setContent(`
        <!doctype html>
            <html>
            <head>
                <title>index-map.html</title>
                <meta charset="UTF-8">
                <script type="module" src="mapml-viewer.js"></script>
                <style>
                html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                </style>
            </head>
            <body>
                <mapml-viewer style="width:500px;height:500px" projection="OSMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- id="checkMe" label='CBMT' src='cbmtile-cbmt.mapml' checked></layer->
                    <layer- label="OpenStreetMap" src="osm.mapml" checked></layer->
                </mapml-viewer>     
            </body>
            </html>
        `);
    await page.waitForLoadState('networkidle');
    await page.hover('div > div.leaflet-control-container > div.leaflet-top.leaflet-right');
    const cbmtileLayer = await page.$eval("#checkMe",
      (controller) => controller.hasAttribute('disabled'));
    const osmtileLayer = await page.$eval("body > mapml-viewer > layer-:nth-child(2)",
      (controller) => controller.hasAttribute('disabled'));

    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span",
      { button: "right", force: true });

    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.querySelector(".mapml-contextmenu.mapml-layer-menu"), nextHandle);

    const menuDisplay = await (await page.evaluateHandle(elem => elem.style.display, resultHandle)).jsonValue();

    expect(menuDisplay).toEqual("");

    expect(cbmtileLayer).toEqual(true);
    expect(osmtileLayer).toEqual(false);
  });
});