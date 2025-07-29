import { test, expect, chromium } from '@playwright/test';

test.describe('Adding and Removing Multiple Extents', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('multipleExtents.html');
  });

  test("Layer's multiple extents display on map and in layer control", async () => {
    const cbmtExtent = await page.getByTestId('cbmt-extent');
    const cbmtExtentIsRendered = await cbmtExtent.evaluate(
      (e) =>
        e._extentLayer._container.querySelectorAll('.mapml-tile-group').length
    );
    const alabamaExtent = await page.getByTestId('alabama-extent');
    const alabamaExtentIsRendered = await alabamaExtent.evaluate(
      (e) =>
        e._extentLayer._container.querySelectorAll(
          '.mapml-features-tiles-container > *'
        ).length
    );

    const cbmtLabel = await page.$eval('text=cbmt', (label) => label.innerText);
    const alabamaLabel = await page.$eval(
      'text=alabama_feature',
      (label) => label.innerText
    );
    expect(cbmtExtentIsRendered).toEqual(9); // tile container divs
    expect(alabamaExtentIsRendered).toEqual(4); // 2 links, 1 style, 1 svg
    expect(cbmtLabel).toEqual('cbmt');
    expect(alabamaLabel).toEqual('alabama_feature');
  });

  test('Changing extent opacity, removing and adding extent effects expected changes to map container layer content', async () => {
    // change opacity on cbmt templated extent, then remove it
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button'
    );
    await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details',
      (div) => (div.open = true)
    );
    // change cbmt opacity to 50%
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]'
    );

    // remove the cbmt extent by clearing its checkbox, leaving two  layers,
    // each with a single extent (alabama_feature, single-extent/toporama image)
    await page.click('text=cbmt');
    const startExtentCount = await page.$$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-extentlayer-container',
      (extents) => extents.length
    );
    let alabama = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-extentlayer-container',
      (div) => div.className
    );
    expect(startExtentCount).toEqual(2);
    expect(alabama).toEqual('leaflet-layer mapml-extentlayer-container');

    // restore the cbmt extent
    await page.click('text=cbmt');
    const endExtentCount = await page.$$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-extentlayer-container',
      (extents) => extents.length
    );
    expect(endExtentCount).toEqual(3);

    //expect alabama to still be rendered on top of cbmt
    const alabamaZIndex = await page
      .getByTestId('alabama-extent')
      .evaluate((e) => Number(e._extentLayer._container.style.zIndex));
    const cbmtZIndex = await page
      .getByTestId('cbmt-extent')
      .evaluate((e) => Number(e._extentLayer._container.style.zIndex));
    expect(alabamaZIndex).toBeGreaterThan(cbmtZIndex);

    const layerOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    expect(layerOpacity).toEqual('1');
    const cbmtOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    expect(cbmtOpacity).toEqual('0.5');
    // the mapml-templated-tile-container is a child of mapml-extentlayer-container
    // the parent is the extent container, and controls the opacity
    // the child should always have an opacity of 1 (never set, default value from Leaflet)
    // the opacity of the extent content should be restored through cycling it off/on
    const cbmtExtentLayerContainerOpacity = await page
      .getByTestId('cbmt-extent')
      .evaluate((e) => e._extentLayer._container.style.opacity);
    expect(cbmtExtentLayerContainerOpacity).toEqual('0.5');
    const cbmtTemplatedTileContainerOpacity = await page
      .getByTestId('cbmt-template')
      .evaluate((t) => t._templatedLayer._container.style.opacity);
    expect(cbmtTemplatedTileContainerOpacity).toEqual('1');
    const alabamaOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    expect(alabamaOpacity).toEqual('1');
  });

  test('Changing extent opacity, removing and adding extent effects expected changes to only that specific content', async () => {
    // change opacity on alabama templated extent, then remove it
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button'
    );
    await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details',
      (div) => (div.open = true)
    );
    // change alabama opacity to 50%
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]'
    );

    await page.click('text=alabama_feature');
    const startExtentCount = await page.$$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-extentlayer-container',
      (extents) => extents.length
    );
    let cbmt = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container > div',
      (div) => div.className
    );
    expect(startExtentCount).toEqual(2);
    expect(cbmt).toEqual('leaflet-layer mapml-templated-tile-container');

    // restore alabama to map
    await page.click('text=alabama_feature');
    const endExtentCount = await page.$$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-extentlayer-container',
      (extents) => extents.length
    );
    cbmt = await page.$eval(
      "div.mapml-extentlayer-container[style='opacity: 0.5; z-index: 1;'] > div",
      (div) => div.className
    );
    const alabama = await page.$eval(
      "div.mapml-extentlayer-container[style='opacity: 0.5; z-index: 2;'] > div",
      (div) => div.className
    );
    const layerOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    const cbmtOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    const alabamaOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    expect(endExtentCount).toEqual(3);
    // alabama is a templated feature extent
    // the opacity of the alabama features is tested by the selector
    expect(alabama).toEqual(
      'leaflet-layer mapml-features-tiles-container leaflet-pane mapml-vector-container'
    );
    // cbmt is a templated tile extent
    // the opacity of the cbmt tiles is tested by the selector
    expect(cbmt).toEqual('leaflet-layer mapml-templated-tile-container');
    expect(layerOpacity).toEqual('1');
    expect(cbmtOpacity).toEqual('0.5');
    expect(alabamaOpacity).toEqual('0.5');
  });

  test('Extents retain their state when turning layer off and on', async () => {
    await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details',
      (div) => (div.open = true)
    );
    // sets the Multiple Extents layer opacity to 0.5
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]'
    );

    // turn the Multiple Extents layer off
    await page.click("text='Multiple Extents'");
    let layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(1);

    // turn the Multiple Extents layer on
    await page.click("text='Multiple Extents'");
    const cbmtClass = await page.$eval(
      "div.mapml-extentlayer-container[style='opacity: 0.5; z-index: 1;'] > div",
      (div) => div.className
    );
    const alabamaClass = await page.$eval(
      "div.mapml-extentlayer-container[style='opacity: 0.5; z-index: 2;'] > div",
      (div) => div.className
    );
    const layer = page.getByTestId('multiple-extents');

    const layerOpacity = await layer.evaluate((layer) => {
      return layer._layerControl._container.querySelector(
        '.mapml-layer-item-opacity.mapml-control-layers input'
      ).value;
    });
    const cbmtOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    const alabamaOpacity = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]',
      (opacity) => opacity.value
    );
    // alabama opacity is tested by the selector
    expect(alabamaClass).toEqual(
      'leaflet-layer mapml-features-tiles-container leaflet-pane mapml-vector-container'
    );
    // cbmt opacity is tested by the selector
    expect(cbmtClass).toEqual('leaflet-layer mapml-templated-tile-container');
    expect(layerOpacity).toEqual('0.5');
    expect(cbmtOpacity).toEqual('0.5');
    expect(alabamaOpacity).toEqual('0.5');
  });
});

test.describe('Multiple Extents Bounds Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('multipleExtents.html');
  });

  test('Only Extent Bounds show in debug mode', async () => {
    // this test used to be titled "Both Extent Bounds and Layer Bounds show in debug mode"
    // but since introduction of map-extent element, it was decided to only show
    // the bounds rectangles for the map-link elements
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());

    // we don't expect the _map.totalBounds to show unless the announceMovement
    // option is enabled on page load, by default it is false.
    // the bounds expected to show include the "projection center", 4 features,
    // and 3 map-extents =8
    await expect(page.locator('.mapml-debug-vectors')).toHaveCount(8);
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    // templated features formerly did not keep track of their layer- element,
    // which prevented them from being added to the debug layer. That is fixed.
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(6);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);
  });

  test('When unchecked, extent bounds removed from debug layer', async () => {
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)'
    );
    // uncheck the templated features (alabama) extent / remove from map
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    );
    // reload the debug layer; this should not require cycling
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());

    await expect(page.locator('.mapml-debug-vectors')).toHaveCount(3);
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(1);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);
  });

  test('Checking an extent adds its bounds, unchecking an extent removes its bounds', async () => {
    // restore "alabama" features that was removed in previous test
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    );
    //    // remove previously remaining extent
    //    await page.click(
    //      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    //    );
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());

    await expect(page.locator('.mapml-debug-vectors')).toHaveCount(8);
    await expect(
      page.locator('.mapml-debug-vectors.projection-centre ')
    ).toHaveCount(1);
    // templated features formerly did not keep track of their layer- element,
    // which prevented them from being added to the debug layer. That is fixed.
    await expect(
      page.locator('.mapml-debug-vectors.multiple-extents')
    ).toHaveCount(6);
    await expect(
      page.locator('.mapml-debug-vectors.single-extent')
    ).toHaveCount(1);

    //    // restore the differentExtent onto the map
    //    await page.click(
    //      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]'
    //    );
  });

  test('Layer is disabled in layer control when all extents are out of bounds', async () => {
    // if debug mode is enabled, can't focus on map @ leaflet 1.9.3 see issue #720
    // so turn it off here
    await page.$eval('body > mapml-viewer', (map) => map.toggleDebug());
    await page.click('mapml-viewer');
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('ArrowDown');
    }

    // layer is still enabled, map-extents that are out of bounds are disabled
    // those that overlap the viewport are enabled
    await expect(page.getByText('Multiple Extents')).toBeEnabled();
    // currently, we don't italicize extents except when ALL extents in the layer
    // are disabled due to the layer being disabled.
    // await expect(page.getByText('cbmt')).toBeDisabled();
    await expect(page.getByText('alabama_feature')).toBeEnabled();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByText('Multiple Extents')).toBeDisabled();
    await expect(page.getByText('cbmt')).toHaveCSS('font-style', 'italic');
    await expect(page.getByText('alabama_feature')).toHaveCSS(
      'font-style',
      'italic'
    );
  });

  test('Extent is individually disabled in layer control when out of bounds', async () => {
    const map = await page.locator('mapml-viewer');
    await map.evaluate((map) => map.zoomTo(1.6, -90, 2));

    // 'alabama' bounds still overlap viewport
    const alabamaExtentItem = page.getByText('alabama_feature');
    await expect(alabamaExtentItem).toHaveCount(1);
    await expect(alabamaExtentItem).toHaveCSS('font-style', 'normal');

    const alabamaMapExtent = page.locator('map-extent[label=alabama_feature]');
    await expect(alabamaMapExtent).toHaveCount(1);
    await expect(alabamaMapExtent).not.toHaveAttribute('disabled');

    // cbmt bounds slightly outside viewport, map-extent should be disabled
    const cbmtMapExtent = page.locator('map-extent[label=cbmt]');
    await expect(cbmtMapExtent).toHaveCount(1);
    await expect(cbmtMapExtent).toHaveAttribute('disabled');

    // the text can't be disabled, but it should simulated disabled by being
    // rendered in gray italic font
    const cbmtExtentItem = page.getByText('cbmt');
    await expect(cbmtExtentItem).toHaveCount(1);
    await expect(cbmtExtentItem).toHaveCSS('font-style', 'italic');

    // multiple extents layer's extents should all be slightly offscreen,
    // layer and everything in it should be disabled or in italics

    await map.evaluate((map) => map.zoomTo(-11, -120, 1));
    await expect(alabamaMapExtent).toHaveAttribute('disabled');
    await expect(alabamaExtentItem).toHaveCSS('font-style', 'italic');
    await expect(cbmtMapExtent).toHaveAttribute('disabled');
    await expect(cbmtExtentItem).toHaveCSS('font-style', 'italic');

    const layerOpacitySliderText = page.locator(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > details.mapml-layer-item-opacity'
    );
    await expect(layerOpacitySliderText).toHaveCount(1);
    await expect(layerOpacitySliderText).toHaveCSS('font-style', 'italic');

    // expect the remove layer button to be enabled

    // expect the remove extent buttons to be enabled
    const cbmtRemoveExtentButton = page.locator(
      'fieldset.mapml-layer-extent:nth-child(1) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)'
    );
    await expect(cbmtRemoveExtentButton).toBeEnabled();
    const alabamaRemoveExtentButton = page.locator(
      'fieldset.mapml-layer-extent:nth-child(1) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)'
    );
    await expect(alabamaRemoveExtentButton).toBeEnabled();
  });
});

test.describe('Multiple Extents Reordering and ZIndices Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('multipleExtents.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Move extent down in the layer control / up in the zIndex', async () => {
    // starting conditions
    let firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('cbmt');
    let secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('alabama_feature');
    // alabama (a templated features layer) should have a higher zIndex than cbmt
    let alabamaIndex = await page.$eval(
      'div.mapml-features-tiles-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    let cbmtIndex = await page.$eval(
      'div.mapml-templated-tile-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    expect(cbmtIndex).toBeLessThan(alabamaIndex);

    // reverse the order of the extent via the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // get the bounds of the CBMT extent
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)'
    );
    let control = await page.$(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)'
    );
    let controlBBox = await control.boundingBox();
    // drag it down the page one notch / up in the ZIndex order by one
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      controlBBox.x + controlBBox.width / 2,
      controlBBox.y + controlBBox.height / 2 + 48
    );
    // drop it
    await page.mouse.up();
    await page.waitForTimeout(500);

    // having been re-ordered, alabama should be first in the layer control
    firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('alabama_feature');
    secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('cbmt');
    // alabama (a templated features layer) should have a lower zIndex than cbmt
    alabamaIndex = await page.$eval(
      'div.mapml-features-tiles-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    cbmtIndex = await page.$eval(
      'div.mapml-templated-tile-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    expect(alabamaIndex).toBeLessThan(cbmtIndex);
  });

  test('Ensure Same Order When Extent and Layer Checked Off/On', async () => {
    // turn the Multiple Extents layer off
    await page.click("text='Multiple Extents'");
    let layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(1);
    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(2);

    // having not been re-ordered, alabama should remain first in the layer control
    let firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('alabama_feature');
    let secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('cbmt');

    let alabama = await page.$$eval(
      'div.mapml-features-tiles-container',
      (divs) => divs.length
    );
    expect(alabama).toEqual(1);
    let cbmt = await page.$$eval(
      'div.mapml-templated-tile-container',
      (divs) => divs.length
    );
    expect(cbmt).toEqual(1);

    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(1);
    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(2);

    // having not been re-ordered, alabama should remain first in the layer control
    firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('alabama_feature');
    secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('cbmt');

    alabama = await page.$$eval(
      'div.mapml-features-tiles-container',
      (divs) => divs.length
    );
    expect(alabama).toEqual(1);
    cbmt = await page.$$eval(
      'div.mapml-templated-tile-container',
      (divs) => divs.length
    );
    expect(cbmt).toEqual(1);
  });

  test('Move Extent Back Up in the Layer Control', async () => {
    await page.hover('.leaflet-top.leaflet-right');
    let control = await page.$(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)'
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
    await page.waitForTimeout(200);

    // having been re-ordered, cbmt should be first in the layer control
    let firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('cbmt');
    let secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('alabama_feature');

    // alabama (a templated features layer) should now have a higher zIndex than cbmt
    let alabamaIndex = await page.$eval(
      'div.mapml-features-tiles-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    let cbmtIndex = await page.$eval(
      'div.mapml-templated-tile-container',
      (div) => +div.closest('.mapml-extentlayer-container').style.zIndex
    );
    expect(cbmtIndex).toBeLessThan(alabamaIndex);
  });
});
