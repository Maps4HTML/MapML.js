import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent checked order tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-extent-checked.html');
  });
  test('map-extent layer control order correct when cycling checked state', async () => {
    // Fixed #935 https://github.com/Maps4HTML/MapML.js/issues/935
    /* 
Go to this map map-extent-checked.html

Open the layer control for the layer settings.

Un-check the imagery layer <map-extent>
Check the imagery layer <map-extent>

What should happen:
The imagery layer <map-extent> should draw underneath the states layer.

What actually happens:
The imagery layer <map-extent> draws on top of the states layer.
     * */
    const layerControl = page.locator('.leaflet-top.leaflet-right');
    await layerControl.hover();
    const layerSettings = layerControl.getByTitle('Layer Settings', {
      exact: true
    });
    await layerSettings.click();
    const imageryExtentCheckbox = layerControl.getByRole('checkbox', {
      name: 'Extent One'
    });
    await imageryExtentCheckbox.click(); // turn it off
    await imageryExtentCheckbox.click(); // turn it on
    const ext1 = page.getByTestId('ext1');
    let imageryZIndex = await ext1.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    const ext2 = page.getByTestId('ext2');
    let statesZIndex = await ext2.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    expect(statesZIndex).toBeGreaterThan(imageryZIndex);
    // re-order them via the layer control
    const imageryFieldset = layerControl.getByRole('group', {
      name: 'Extent One'
    });
    let controlBBox = await imageryFieldset.boundingBox();
    let from = {
        x: controlBBox.x + controlBBox.width / 2,
        y: controlBBox.y + controlBBox.height / 2
      },
      to = { x: from.x, y: from.y + controlBBox.height * 1.1 };

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y);
    await page.mouse.up();
    imageryZIndex = await ext1.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    statesZIndex = await ext2.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    expect(statesZIndex).toBeLessThan(imageryZIndex);

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y);
    await page.mouse.up();
    await imageryExtentCheckbox.click(); // turn it off
    await imageryExtentCheckbox.click(); // turn it on
    imageryZIndex = await ext1.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    statesZIndex = await ext2.evaluate((e) => {
      return +e._extentLayer._container.style.zIndex;
    });
    expect(statesZIndex).toBeGreaterThan(imageryZIndex);
    // TO DO re-order them via the DOM (insertAdjacentHTML),
    // ensure that
    // a) render order/z-index is correct
    // b) render order is reflected in layer control order as well
    // see https://github.com/Maps4HTML/MapML.js/issues/956
  });
});
