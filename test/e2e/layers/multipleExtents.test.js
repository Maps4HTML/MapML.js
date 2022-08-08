import { test, expect, chromium } from '@playwright/test';

test.describe("Adding and Removing Multiple Extents", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("multipleExtents.html");
  });

  test("Layer's multiple extents display on map and in layer control", async () => {
    const cbmtExtent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div > div", (div) => div.childElementCount);
    const alabamaExtent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.childElementCount);
    const cbmtLabel = await page.$eval("text=cbmt", (label) => label.innerText);
    const alabamaLabel = await page.$eval("text=alabama_feature", (label) => label.innerText);
    expect(cbmtExtent).toEqual(9);
    expect(alabamaExtent).toEqual(1);
    expect(cbmtLabel).toEqual("cbmt");
    expect(alabamaLabel).toEqual("alabama_feature");
  });

  test("Changing extent opacity, removing and adding extent effects expected changes to map container layer content", async () => {
    // change opacity on cbmt templated extent, then remove it
    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button");
    await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details", (div) => div.open = true);
    // change cbmt opacity to 50%
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]");

    // remove the cbmt extent by clearing its checkbox
    await page.click("text=cbmt");
    const startExtentCount = await page.$$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-templatedlayer-container", (extents) => extents.length);
    let alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-templatedlayer-container", (div) => div.className);
    expect(startExtentCount).toEqual(1);
    expect(alabama).toEqual("leaflet-layer mapml-templatedlayer-container");

    // restore the cbmt extent
    await page.click("text=cbmt");
    const endExtentCount = await page.$$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-templatedlayer-container", (extents) => extents.length);
    expect(endExtentCount).toEqual(2);
    alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div", (div) => div.className);
    expect(alabama).toEqual("leaflet-layer mapml-features-container");
    const cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.className);
    expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");
    const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    expect(layerOpacity).toEqual("1");
    const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    expect(cbmtOpacity).toEqual("0.5");
    // the mapml-templated-tile-container is a child of mapml-templatedlayer-container
    // the parent is the extent container, and controls the opacity
    // the child should always have an opacity of 1 (never set, default value from Leaflet)
    // the opacity of the extent content should be restored through cycling it off/on
    const cbmtTemplatedLayerContainerOpacity = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5)", (div) => div.style.opacity);
    expect(cbmtTemplatedLayerContainerOpacity).toEqual("0.5");
    const cbmtTemplatedTileContainerOpacity = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.style.opacity);
    expect(cbmtTemplatedTileContainerOpacity).toEqual("1");
    const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    expect(alabamaOpacity).toEqual("1");
  });

  test("Changing extent opacity, removing and adding extent effects expected changes to only that specific content", async () => {
    // change opacity on alabama templated extent, then remove it
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button");
    await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details", (div) => div.open = true);
    // change alabama opacity to 50%
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]");

    await page.click("text=alabama_feature");
    const startExtentCount = await page.$$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-templatedlayer-container", (extents) => extents.length);
    let cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div", (div) => div.className);
    expect(startExtentCount).toEqual(1);
    expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");

    // restore alabama to map
    await page.click("text=alabama_feature");
    const endExtentCount = await page.$$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-templatedlayer-container", (extents) => extents.length);
    cbmt = await page.$eval("div.mapml-templatedlayer-container[style='opacity: 0.5; z-index: 0;'] > div", (div) => div.className);
    const alabama = await page.$eval("div.mapml-templatedlayer-container[style='opacity: 0.5; z-index: 1;'] > div", (div) => div.className);
    const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    expect(endExtentCount).toEqual(2);
    // alabama is a templated feature extent
    // the opacity of the alabama features is tested by the selector
    expect(alabama).toEqual("leaflet-layer mapml-features-container");
    // cbmt is a templated tile extent
    // the opacity of the cbmt tiles is tested by the selector
    expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");
    expect(layerOpacity).toEqual("1");
    expect(cbmtOpacity).toEqual("0.5");
    expect(alabamaOpacity).toEqual("0.5");
  });

  test("Extents retain their state when turning layer off and on", async () => {
    await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details",
                    (div) => div.open = true);
    // sets the Multiple Extents layer opacity to 0.5
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]");

    // turn the Multiple Extents layer off
    await page.click("text='Multiple Extents'");
    let layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
    expect(layersCount).toEqual(0);

    // turn the Multiple Extents layer on
    await page.click("text='Multiple Extents'");
    const cbmtClass = await page.$eval("div.mapml-templatedlayer-container[style='opacity: 0.5; z-index: 0;'] > div", (div) => div.className);
    const alabamaClass = await page.$eval("div.mapml-templatedlayer-container[style='opacity: 0.5; z-index: 1;'] > div", (div) => div.className);
    const layerClass = await page.$eval("div.mapml-layer[style='z-index: 1; opacity: 0.5;']", (div) => div.className);
    const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
    // layer opacity is tested by the selector
    expect(layerClass).toEqual("leaflet-layer mapml-layer");
    // alabama opacity is tested by the selector
    expect(alabamaClass).toEqual("leaflet-layer mapml-features-container");
    // cbmt opacity is tested by the selector
    expect(cbmtClass).toEqual("leaflet-layer mapml-templated-tile-container");
    expect(layerOpacity).toEqual("0.5");
    expect(cbmtOpacity).toEqual("0.5");
    expect(alabamaOpacity).toEqual("0.5");
  });
});


test.describe("Multiple Extents Bounds Tests", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("multipleExtents.html");
  });

  test("Both Extent Bounds and Layer Bounds show in debug mode", async () => {
    await page.$eval(
        "body > mapml-viewer",
        (map) => map.toggleDebug());

    const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
    const layerBound1 = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
        (tile) => tile.getAttribute("d"));
    const cbmtBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
        (tile) => tile.getAttribute("d"));
    const layerBound2 = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
        (tile) => tile.getAttribute("d"));
    const alabamaBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(5)",
        (tile) => tile.getAttribute("d"));

    expect(numBounds).toEqual(5);
    // why is the layer bounds in here twice?
    expect(layerBound1).toEqual("M-236.5999999999999 613.3302389297928L531.4000000000001 613.3302389297928L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
    expect(layerBound2).toEqual("M-236.5999999999999 613.3302389297928L531.4000000000001 613.3302389297928L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
    expect(cbmtBound).toEqual("M-236.5999999999999 334.00000000000045L531.4000000000001 334.00000000000045L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
    expect(alabamaBound).toEqual("M346.1557472398199 613.3302389297928L483.3934682431727 613.3302389297928L483.3934682431727 250.27387360649664L346.1557472398199 250.27387360649664z");
});

test("Layer bounds are recalculated, should equal remaining extent bounds when one of two extents removed from map", async () => {
    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
    // uncheck the extent / remove from map
    // map-extent doesn't have an onRemove handler (yet)
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > label > input[type=checkbox]");
    // reload the debug layer; this should not require cycling
    await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
    await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());

    const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
    const layerBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
        (tile) => tile.getAttribute("d"));
    const remainingExtentBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
        (tile) => tile.getAttribute("d"));

    // seems incorrect that there should be 3 bounds when there are only two
    // extents and one of them is turned off
    expect(numBounds).toEqual(3);
    expect(layerBounds).toEqual(remainingExtentBounds);
  });

  test("Layer bounds are recalculated when a different child extent is removed", async () => {
    // restore extent that was removed in previous test
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > label > input[type=checkbox]");
    // remove previously remaining extent
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
    await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
    await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());

    const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
    const layerBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
        (tile) => tile.getAttribute("d"));
    const differentExtentBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
        (tile) => tile.getAttribute("d"));

    expect(numBounds).toEqual(3);
    expect(layerBounds).toEqual(differentExtentBounds);
    // restore the differentExtent onto the map
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
  });

  test("Layer is disabled in layer control when all extents are out of bounds", async () => {
    await page.pause();
    await page.click("mapml-viewer");
    for (let i = 0; i < 5; i++){
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(500);
    }
    const cbmtDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));
    const alabamaEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => !extent.hasAttribute("disabled"));
    const layerEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset", (extent) => !extent.hasAttribute("disabled"));
    expect(layerEnabled).toEqual(true);
    expect(cbmtDisabled).toEqual(true);
    expect(alabamaEnabled).toEqual(true);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(500);
    const cbmtEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => !extent.hasAttribute("disabled"));

    expect(cbmtEnabled).toEqual(true);
  });

  test("Extent is individually disabled in layer control when out of bounds", async () => {
    for (let i = 0; i < 2; i++){
        await page.keyboard.press("ArrowLeft");
        await page.waitForTimeout(500);
    }
    const alabamaDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));
    const cbmtEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => !extent.hasAttribute("disabled"));
    const layerEnabled = await page.$eval("text=Multiple Extents", (extent) => !extent.closest("fieldset").hasAttribute("disabled"));
    expect(cbmtEnabled).toEqual(true);
    expect(layerEnabled).toEqual(true);
    expect(alabamaDisabled).toEqual(true);
    // move Alabama back into bounds
    for (let i = 0; i < 2; i++){
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(500);
    }
    const alabamaEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => !extent.hasAttribute("disabled"));
    expect(alabamaEnabled).toEqual(true);
  });
});

test.describe("Multiple Extents Reordering and ZIndices Tests", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("multipleExtents.html");
  });
  test.afterAll(async function () {
      await context.close();
  });

  test("Move extent down in the layer control / up in the zIndex", async () => {
    // starting conditions
    let firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
    expect(firstExtentInLayerControl).toEqual("cbmt");
    let secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
    expect(secondExtentInLayerControl).toEqual("alabama_feature");
    // alabama (a templated features layer) should have a higher zIndex than cbmt
    let alabamaIndex = await page.$eval("div.mapml-features-container", 
        (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    let cbmtIndex = await page.$eval("div.mapml-templated-tile-container", 
        (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    expect(cbmtIndex).toBeLessThan(alabamaIndex);

    // reverse the order of the extent via the layer control
    await page.hover(".leaflet-top.leaflet-right");
    // get the bounds of the CBMT extent
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
    let control = await page.$("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)");
    let controlBBox = await control.boundingBox();
    // drag it down the page one notch / up in the ZIndex order by one
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) + 48);
    // drop it
    await page.mouse.up();
    await page.waitForTimeout(500);

    // having been re-ordered, alabama should be first in the layer control
    firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
    expect(firstExtentInLayerControl).toEqual("alabama_feature");
    secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
    expect(secondExtentInLayerControl).toEqual("cbmt");
    // alabama (a templated features layer) should have a lower zIndex than cbmt
    alabamaIndex = await page.$eval("div.mapml-features-container", (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    cbmtIndex = await page.$eval("div.mapml-templated-tile-container", (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    expect(alabamaIndex).toBeLessThan(cbmtIndex);
  });

  test("Ensure Same Order When Extent and Layer Checked Off/On", async () => {
    // turn the Multiple Extents layer off
    await page.click("text='Multiple Extents'");
    let layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
    expect(layersCount).toEqual(0);
    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
    expect(layersCount).toEqual(1);

    // having not been re-ordered, alabama should remain first in the layer control
    let firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
    expect(firstExtentInLayerControl).toEqual("alabama_feature");
    let secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
    expect(secondExtentInLayerControl).toEqual("cbmt");

    let alabama = await page.$$eval("div.mapml-features-container", (divs) => divs.length);
    expect(alabama).toEqual(1);
    let cbmt = await page.$$eval("div.mapml-templated-tile-container", (divs) => divs.length);
    expect(cbmt).toEqual(1);

    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
    expect(layersCount).toEqual(0);
    await page.click("text='Multiple Extents'");
    layersCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
    expect(layersCount).toEqual(1);

    // having not been re-ordered, alabama should remain first in the layer control
    firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
    expect(firstExtentInLayerControl).toEqual("alabama_feature");
    secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
    expect(secondExtentInLayerControl).toEqual("cbmt");

    alabama = await page.$$eval("div.mapml-features-container", (divs) => divs.length);
    expect(alabama).toEqual(1);
    cbmt = await page.$$eval("div.mapml-templated-tile-container", (divs) => divs.length);
    expect(cbmt).toEqual(1);
  });

  test("Move Extent Back Up in the Layer Control", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    let control = await page.$("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)");
    let controlBBox = await control.boundingBox();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) - 48);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // having been re-ordered, cbmt should be first in the layer control
    let firstExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span", (span) => span.innerText.toLowerCase());
    expect(firstExtentInLayerControl).toEqual("cbmt");
    let secondExtentInLayerControl = await page.$eval("fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span", (span) => span.innerText.toLowerCase());
    expect(secondExtentInLayerControl).toEqual("alabama_feature");

    // alabama (a templated features layer) should now have a higher zIndex than cbmt
    let alabamaIndex = await page.$eval("div.mapml-features-container", (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    let cbmtIndex = await page.$eval("div.mapml-templated-tile-container", (div) => +div.closest(".mapml-templatedlayer-container").style.zIndex);
    expect(cbmtIndex).toBeLessThan(alabamaIndex);
  });
});
      