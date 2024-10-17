import { test, expect, chromium } from '@playwright/test';

test.describe('Multiple Extent Queries with heterogeneous response content types', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    // sloMo setting seems to make all the difference here
    context = await chromium.launchPersistentContext('', {
      headless: true,
      slowMo: 250
    });
    page = await context.newPage();
    await page.goto('multipleHeterogeneousQueryExtents.html');
    await page.waitForTimeout(1000);
  });
  test.afterAll(async function () {
    await context.close();
  });
  test('Query multiple overlapping extents which return heterogeneous document types (text/mapml, text/html)', async () => {
    await page.click('mapml-viewer');
    const popupContainer = page.locator('.mapml-popup-content > iframe');
    const popupFeatureCount = page.locator('.mapml-feature-count');
    await expect(popupFeatureCount).toHaveText('1/7', { useInnerText: true });

    let content = await popupContainer.evaluate(
      (iframe) => iframe.contentWindow.document.querySelector('body').innerText
    );
    expect(content).toBe(
      'This is an HTML document response for a MapML query.'
    );
  });
  test('Re-order queryable extents, verify response order changes accordingly', async () => {
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
    expect(secondExtentInLayerControl).toEqual('html query response');
    let thirdExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(thirdExtentInLayerControl).toEqual('mapml query response');

    // reverse the order of the html and mapml query extents via the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // expand the layer settings
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)'
    );
    // get the bounds of the HTML query extent control in the layer control
    let control = await page.$(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)'
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

    // having been re-ordered, MapML query extent should be second in the layer control
    firstExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(1) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(firstExtentInLayerControl).toEqual('cbmt');
    secondExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(2) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(secondExtentInLayerControl).toEqual('mapml query response');
    thirdExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(thirdExtentInLayerControl).toEqual('html query response');

    await page.click('mapml-viewer');
    const popupContainer = page.locator('.mapml-popup-content > iframe');
    const popupFeatureCount = page.locator('.mapml-feature-count');
    await expect(popupFeatureCount).toHaveText('1/7', { useInnerText: true });

    let content = await popupContainer.evaluate(
      (iframe) => iframe.contentWindow.document.querySelector('body').innerText
    );
    expect(content).toBe('Alabama');
    for (let i = 0; i < 6; i++) {
      await page.getByTitle('Next Feature').click();
      await page.waitForTimeout(250);
    }
    content = content = await popupContainer.evaluate(
      (iframe) => iframe.contentWindow.document.querySelector('body').innerText
    );
    expect(content).toBe(
      'This is an HTML document response for a MapML query.'
    );
  });
  test('Enusre extents that are unchecked or removed are not included in query results', async () => {
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
    expect(secondExtentInLayerControl).toEqual('mapml query response');
    let thirdExtentInLayerControl = await page.$eval(
      'fieldset.mapml-layer-grouped-extents > fieldset:nth-child(3) span',
      (span) => span.innerText.toLowerCase()
    );
    expect(thirdExtentInLayerControl).toEqual('html query response');

    // show the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // turn the Multiple Extents layer off
    await page.click("text='Multiple Heterogeneous Query Extents'");
    let layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(0);

    // query the page, nothing should happen
    await page.click('mapml-viewer');
    let popupContent = await page.$eval(
      '.leaflet-popup-pane',
      (pane) => pane.childElementCount
    );
    expect(popupContent).toEqual(0);

    // show the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // turn the Multiple Extents layer on
    await page.click("text='Multiple Heterogeneous Query Extents'");
    layersCount = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane',
      (div) => div.childElementCount
    );
    expect(layersCount).toEqual(1);

    // query the page, should display popup, create popup content
    await page.click('mapml-viewer');
    popupContent = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (pane) => pane.childElementCount
    );
    expect(popupContent).toEqual(1);
    let popupFeatureCount = page.locator('.mapml-feature-count');
    await expect(popupFeatureCount).toHaveText('1/7', { useInnerText: true });

    // show the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // display layer settings for first layer, exposes extents for clicking
    // await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-properties > div.mapml-layer-item-controls > button.mapml-layer-item-settings-control");
    // turn the second (queryable) extent off by clicking its label
    await page.click("text='HTML query response'");

    // query the page, should create popup content
    await page.click('mapml-viewer');
    popupFeatureCount = page.locator('.mapml-feature-count');
    await expect(popupFeatureCount).toHaveText('1/6', { useInnerText: true });

    // show the layer control
    await page.hover('.leaflet-top.leaflet-right');
    // layer settings for top layer are already displayed
    // turn the second (queryable) extent back on by clicking its label
    await page.click("text='HTML query response'");
    // remove it entirely
    await page.click(
      "fieldset.mapml-layer-extent:nth-child(3) button[title='Remove Sub-layer'].mapml-layer-item-remove-control"
    );

    // query the page, should create popup content
    await page.click('mapml-viewer');
    popupFeatureCount = page.locator('.mapml-feature-count');
    // the mapml response has 6 features, the html response is tallied as 1 feature
    await expect(popupFeatureCount).toHaveText('1/6', { useInnerText: true });
  });
});
