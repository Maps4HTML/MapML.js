import { test, expect, chromium } from '@playwright/test';

test.describe('UI Drag&Drop Test', () => {
  let page;
  let context;
  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('drag.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Drag and drop of invalid HTML page', async () => {
    await page.waitForTimeout(500);
    const dataTransfer = await page.evaluateHandle(() =>
      new DataTransfer().setData('text/uri-list', 'http://example.com')
    );
    await page.dispatchEvent('.leaflet-control-zoom-in', 'dragstart', {
      dataTransfer
    });

    await page.dispatchEvent('map', 'drop', {
      dataTransfer
    });
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(3);
  });

  test('Drag and drop of layers', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let control = await page.$(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1)'
    );
    let controlBBox = await control.boundingBox();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(50, 50);
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(3);
  });

  test('Moving layer down one in control overlay', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let control = await page.$(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1)'
    );
    let controlBBox = await control.boundingBox();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2 + 48
    );
    await page.mouse.up();
    await page.hover('.leaflet-top.leaflet-right');
    await page.waitForTimeout(500);

    const controlText = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(2) > div:nth-child(1) > label > span',
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      '.leaflet-pane.leaflet-overlay-pane .mapml-templated-tile-container',
      (div) => div.parentElement.parentElement.style.zIndex
    );
    const domLayer = await page.$eval(
      'body > map > map-layer:nth-child(4)',
      (div) => div.label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual('2');
    expect(controlText).toBe('Canada Base Map - Transportation (CBMT)');
  });

  test('Moving layer up one in control overlay', async () => {
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let control = await page.$(
      '.leaflet-control-layers-overlays > fieldset:nth-child(2)'
    );
    let controlBBox = await control.boundingBox();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2 - 48
    );
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');

    const controlText = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span',
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      '.leaflet-overlay-pane .mapml-static-tile-container',
      (div) => div.parentElement.style.zIndex
    );
    const domLayer = await page.$eval(
      'map > map-layer:nth-child(3)',
      (div) => div.label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual('1');
    expect(controlText).toBe('Static MapML with tiles');
  });
  test('Re-order checked bug (#955) test', async () => {
    await page.waitForTimeout(500);
    const layerControl = page.locator('.leaflet-top.leaflet-right');
    await layerControl.hover();
    const overlaysList = page.locator('.leaflet-control-layers-overlays');
    const startingLowestLayer = overlaysList
      .getByRole('group', { name: 'Canada Base Map - Transportation (CBMT)' })
      .first();

    // assert that CBMT is first of three layers
    const cbmtIsFirstInLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.firstElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    expect(cbmtIsFirstInLayerControl).toBe(true);

    const fromBox = await startingLowestLayer.boundingBox();
    const fromPos = {
      x: fromBox.x + fromBox.width / 2,
      y: fromBox.y + fromBox.height / 3
    };
    let toPos = { x: fromPos.x, y: fromPos.y + fromBox.height * 1.1 };

    // move (drag/drop) CBMT to the top of the layer stack
    await page.mouse.move(fromPos.x, fromPos.y);
    await page.mouse.down();
    await page.mouse.move(toPos.x, toPos.y);
    await page.mouse.up();
    await page.mouse.move(toPos.x, toPos.y);
    toPos = { x: toPos.x, y: toPos.y + fromBox.height * 1.1 };
    await page.mouse.down();
    await page.mouse.move(toPos.x, toPos.y);
    await page.mouse.up();

    let cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);

    const cbmtCheckbox = overlaysList
      .getByRole('checkbox', {
        name: 'Canada Base Map - Transportation (CBMT)'
      })
      .first();
    let cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(true);
    await cbmtCheckbox.click();
    cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(false);
    // cbmt layer should still be on top of layer control despite that it's unchecked
    cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is still third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);
    await cbmtCheckbox.click();
    cbmtIsChecked = await cbmtCheckbox.isChecked();
    expect(cbmtIsChecked).toBe(true);
    cbmtIsTopOfLayerControl = await overlaysList.evaluate((l) => {
      return (
        l.querySelectorAll(':scope > fieldset').length === 3 &&
        l.lastElementChild.querySelector('.mapml-layer-item-name')
          .textContent === 'Canada Base Map - Transportation (CBMT)'
      );
    });
    // assert that CBMT is still third of three layers
    expect(cbmtIsTopOfLayerControl).toBe(true);
  });
});
