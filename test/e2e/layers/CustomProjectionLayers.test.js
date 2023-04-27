import { test, expect, chromium } from '@playwright/test';

test.describe("Custom Projection Feature & Extent Tests", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("CustomProjectionLayers.html");
  });

  test.afterAll(async function () {
    await context.close();
  });


  test("map-extent Image access ._layer", async () => {
	// access the map-extent._layer property
    const layer = await page.$eval("mapml-viewer", (map) => 
		(typeof map.getElementsByTagName("map-extent")[0]._layer)
	);
    expect(layer).toEqual("object");
  });

  test.describe("Feature", () => {

    test("access ._layer", async () => {
    // access the feature._layer property
      const layer = await page.$eval("mapml-viewer", (map) => 
      (typeof map.getElementsByTagName("map-feature")[0]._layer)
    );
      expect(layer).toEqual("object");
    });

    test("feature method - ZoomTo()", async () => {
      await page.$eval("#LondonPoint", (f) => (f.zoomTo()));
      const zoom = await page.evaluate(`document.querySelector('mapml-viewer').zoom`);
      expect(zoom).toEqual("2");
      //const endTopLeft = await page.evaluate(`document.querySelector('mapml-viewer').extent.topLeft.pcrs`);
      //const endBottomRight = await page.evaluate(`document.querySelector('mapml-viewer').extent.bottomRight.pcrs`);
      //expect(endTopLeft.horizontal).toBe(1508601.8288036585);
      //expect(endTopLeft.vertical).toBe(-169068.77063754946);
      //expect(endBottomRight.horizontal).toBe(1512570.5867411792);
      //expect(endBottomRight.vertical).toBe(-173037.52857506275);
    });

    // TODO: Add test to ensure popup pagination are visible

  });

});
