import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Custom TCRS Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('customTCRS.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Simple Custom TCRS, tiles load, mismatched layer disabled', async () => {
    const misMatchedLayerDisabled = await page.$eval(
      'body > mapml-viewer:nth-child(1) > layer-:nth-child(1)',
      (layer) => layer.hasAttribute('disabled')
    );

    const tilesLoaded = await page.$eval(
      'xpath=//html/body/mapml-viewer[1] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-static-tile-layer > div',
      (tileGroup) => tileGroup.getElementsByTagName('map-tile').length
    );

    expect(tilesLoaded).toEqual(2);
    expect(misMatchedLayerDisabled).toEqual(true);
  });
  test('A projection name containing a colon is invalid', async () => {
    const message = await page.$eval(
      'body > p',
      (message) => message.innerHTML
    );
    expect(message).toEqual('passing');
  });
  test('Complex Custom TCRS, static features loaded, templated features loaded', async () => {
    const staticFeatures = await page.$eval(
      'body > mapml-viewer:nth-child(3) > layer-:nth-child(1)',
      (layer) => layer.hasAttribute('disabled')
    );

    const templatedFeatures = await page.$eval(
      'body > mapml-viewer:nth-child(3) > layer-:nth-child(2)',
      (layer) => layer.hasAttribute('disabled')
    );

    const featureOne = await page.$eval(
      'xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(1) > path.leaflet-interactive',
      (tile) => tile.getAttribute('d')
    );
    const featureTwo = await page.$eval(
      'xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(2) > path.leaflet-interactive',
      (tile) => tile.getAttribute('d')
    );

    const featureThree = await page.$eval(
      'xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(3) > path.leaflet-interactive',
      (tile) => tile.getAttribute('d')
    );
    const featureFour = await page.$eval(
      'xpath=//html/body/mapml-viewer[2] >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(4) > path.leaflet-interactive',
      (tile) => tile.getAttribute('d')
    );

    expect(featureOne).toEqual('M88 681L21 78L-436 201L-346 561z');
    expect(featureTwo).toEqual('M307 456L599 467L612 629L381 599z');

    expect(featureThree).toEqual('M382 -28L809 -28L809 399L382 399z');
    expect(featureFour).toEqual(
      'M55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231L55 231z'
    );

    expect(staticFeatures).toEqual(false);
    expect(templatedFeatures).toEqual(false);
  });
});
