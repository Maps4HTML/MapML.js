import { test, expect, chromium, devices } from '@playwright/test';
const device = devices['Pixel 5'];

test.describe("Playwright touch device tests", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    // the test must be run in headless mode
    // to successfully emulate a touch device with mouse disabled
    context = await chromium.launch();
    page = await context.newPage({
        ...device,
    });
    await page.goto("layerContextMenu.html");
  });

  test.afterAll(async function () {
      await context.close();
  });
  
  test("Tap/Long press to show layer control", async () => {
    const layerControl = await page.locator("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
    await layerControl.tap();
    let className = await layerControl.evaluate(
        (el) => el.classList.contains('leaflet-control-layers-expanded') && el._isExpanded
    );
    expect(className).toBeTruthy();

    // expect the opacity setting not open after the click
    let opacity = await page.$eval(
      "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button:nth-child(2)",
      (btn) => btn.getAttribute('aria-expanded')
    );
    expect(opacity).toBeTruthy();

    // long press
    await page.tap('body > mapml-viewer');
    await layerControl.dispatchEvent('touchstart');
    await page.waitForTimeout(2000);
    await layerControl.dispatchEvent('touchend');

    className = await layerControl.evaluate(
        (el) => el.classList.contains('leaflet-control-layers-expanded') && el._isExpanded
    );
    expect(className).toBeTruthy();

    // expect the layer context menu not show after the long press
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.querySelector(".mapml-contextmenu.mapml-layer-menu"), nextHandle);
    const menuDisplay = await (await page.evaluateHandle(elem => window.getComputedStyle(elem).getPropertyValue("display"), resultHandle)).jsonValue();
    expect(menuDisplay).toEqual("none");
  });
})