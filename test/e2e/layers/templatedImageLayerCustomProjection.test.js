import { test, expect, chromium } from '@playwright/test';

test.describe("<map-extent> Image Tests - Custom Projection", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("templatedImageLayerCustomProjection.html");
  });

  test.afterAll(async function () {
    await context.close();
  });


  test("Image map-extent, custom projection - access _layer", async () => {
	// access the map-extent._layer property
    const layer = await page.$eval("mapml-viewer", (map) => 
		(typeof map.getElementsByTagName("map-extent")[0]._layer)
	);
    expect(layer).toEqual("object");
  });    
});
