import { test, expect, chromium } from '@playwright/test';

test.describe('Multiple Extent Query Tests', () => {
  let page;
  let context;

  test.beforeAll(async function () {
    // sloMo setting seems to make all the difference here
    context = await chromium.launchPersistentContext('', {
      headless: true,
      slowMo: 250
    });
    page = await context.newPage();
    await page.goto('multipleQueryExtents.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Query on overlapping extents returns features from both extents', async () => {
    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(85, 147, 0)
    );
    await page.click('mapml-viewer');
    await page.waitForSelector('.leaflet-popup-content-wrapper p');
    let numFeatures = await page.$eval(
      '.leaflet-popup-content-wrapper p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('1/12');
  });

  test('Turning layer off then on restores query links', async () => {
    await page.hover('.leaflet-top.leaflet-right');
    // remove the layer by clearing its checkbox
    await page.click("text='Multiple Query Extents'");

    // a query now should return nothing.

    // turn layer back on
    await page.click("text='Multiple Query Extents'");

    await page.click('mapml-viewer');
    await page.waitForSelector('.leaflet-popup-content-wrapper p');
    const numFeatures = await page.$eval(
      '.leaflet-popup-content-wrapper p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('1/12');
  });

  test('Querying overlapping extents, user is able to navigate into second set of query results using popup controls', async () => {
    let feature;
    let nextFeatureButton =
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)';
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);
    await page.click(nextFeatureButton);
    //        await page.waitForTimeout(500);

    const name = await page
      .frameLocator('iframe')
      .locator('h1')
      .evaluate((node) => node.innerText);
    expect(name).toEqual('Alabama');
    const numFeatures = await page.$eval(
      '.leaflet-popup-content-wrapper p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('7/12');
    feature = await page.$eval(
      '.mapml-vector-container > svg > g > g > path',
      (tile) => tile.getAttribute('d')
    );
    expect(feature).toEqual(
      'M264 285L268 285L269 287L270 291L271 292L271 293L271 293L272 293L271 294L271 294L271 294L271 295L271 296L272 297L271 297L265 298L265 299L265 299L265 300L266 300L265 300L265 300L264 300L264 299L264 299L264 300L264 300L263 300L262 295L262 289L262 286L262 286L264 285z'
    );
  });

  test("Navigate back from second query result set to end of first query result set by clicking '< / Previous'", async () => {
    // click the '<' (previous) button in the popup.
    await page.click(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)'
    );
    const feature = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g',
      (g) => (g.firstElementChild ? g.firstElementChild : false)
    );
    expect(feature).toBeFalsy();

    const popup = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
      (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
    );
    expect(popup).toEqual('No Geometry');

    const numFeatures = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('6/12');
  });

  test('Popup comes up when non overlapping bounds clicked', async () => {
    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(10, 5, 0)
    );
    await page.click('div');
    await page.waitForSelector(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
    );
    const popupNum = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );
    expect(popupNum).toEqual(1);
  });

  test('Only features from one extent are returned for queries inside its (non overlapping) bounds', async () => {
    var numFeatures = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('1/6');
    for (let i = 0; i < 6; i++) {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
      );
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe'
      );
    }
    let feature = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g',
      (g) => (g.firstElementChild ? g.firstElementChild : false)
    );
    expect(feature).toBeFalsy();

    const popup = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
      (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
    );
    expect(popup).toEqual('No Geometry');

    numFeatures = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > p',
      (p) => p.innerText
    );
    expect(numFeatures).toEqual('6/6');
  });

  test('No features returned when queried outside of bounds of all extents', async () => {
    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(-18, 5, 0)
    );
    await page.click('div');
    await page.waitForSelector(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div',
      { state: 'hidden' }
    );
    const popupNumRight = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );

    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(-16, -40, 0)
    );
    await page.click('div');
    const popupNumBottom = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );

    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(33, -170, 0)
    );
    await page.click('div');
    const popupNumLeft = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );

    await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer').zoomTo(30, 98, 0)
    );
    await page.click('div');
    const popupNumTop = await page.$eval(
      'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (div) => div.childElementCount
    );

    expect(popupNumRight).toEqual(0);
    expect(popupNumBottom).toEqual(0);
    expect(popupNumLeft).toEqual(0);
    expect(popupNumTop).toEqual(0);
  });
});
