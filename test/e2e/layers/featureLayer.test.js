import { test, expect, chromium } from '@playwright/test';

const isVisible = require('./general/isVisible');
const zoomLimit = require('./general/zoomLimit');
const extentProperty = require('./general/extentProperty');

let expectedPCRS = {
    topLeft: {
      horizontal: -34655800,
      vertical: 39310000
    },
    bottomRight: {
      horizontal: 14450964.88019643,
      vertical: -9796764.88019643
    }
  },
  expectedGCRS = {
    topLeft: {
      horizontal: -169.78391348558873,
      vertical: -60.79113663130127
    },
    bottomRight: {
      horizontal: 79.6961805581841,
      vertical: -60.79110984572508
    }
  };

test.describe('Playwright featureLayer (Static Features) Layer Tests', () => {
  isVisible.test('featureLayer.html', 5, 2);
  zoomLimit.test('featureLayer.html', 3, 1);
  extentProperty.test('featureLayer.html', expectedPCRS, expectedGCRS);
  test.describe('Retrieved Static Features Tests', () => {
    let page;
    let context;
    test.beforeAll(async function () {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto('featureLayer.html');
    });
    test.afterAll(async function () {
      await context.close();
    });

    test('Loading in retrieved features', async () => {
      await page.waitForTimeout(350);
      // Wait for the layer to be ready and SVG to be created
      await page.waitForFunction(
        () => {
          const layer = document.querySelector('map-layer#US');
          return (
            layer &&
            layer._layer &&
            layer._layer._container &&
            layer._layer._container.querySelector('svg') &&
            layer._layer._container.querySelector('svg').firstChild
          );
        },
        { timeout: 5000 }
      );

      const features = await page.$eval(
        'map-layer#US',
        (layer) =>
          layer._layer._container.querySelector('svg').firstChild
            .childElementCount
      );
      expect(features).toEqual(52);
    });

    test('Loading in tilematrix feature', async () => {
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > g:nth-child(1) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M330 83L586 83L586 339L330 339L330 83z');
    });

    test('Loading in pcrs feature', async () => {
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > g:nth-child(2) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M153 508L113 146L-161 220L-107 436z');
    });

    test('Loading in tcrs feature', async () => {
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.leaflet-pane.mapml-vector-container > svg > g > g:nth-child(3) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M285 373L460 380L468 477L329 459z');
    });

    test('valid <layer>.extent', async () => {
      // this is the us_pop_density.mapml layer
      const layerExtent = await page.$eval(
        'body > map > map-layer:nth-child(3)',
        (layer) => layer.extent
      );
      expect(layerExtent.topLeft.pcrs).toEqual({
        horizontal: -34655800,
        vertical: 39310000
      });
      expect(layerExtent.topLeft.gcrs).toEqual({
        horizontal: -169.78391348558873,
        vertical: -60.79113663130127
      });
      expect(layerExtent.bottomRight.pcrs).toEqual({
        horizontal: 14450964.88019643,
        vertical: -9796764.88019643
      });
      expect(layerExtent.bottomRight.gcrs).toEqual({
        horizontal: 79.6961805581841,
        vertical: -60.79110984572508
      });
      // corrected logic for MapLayer._calculateBounds min/maxNativeZoom
      // there are a bunch of features loaded at map zoom=2. Two have default
      // (no) zoom attribute, all the others have zoom=0. So, the minNativeZoom
      // should be 0, while the maxNativeZoom should be 2.
      // there is a <map-meta name="zoom" content="min=2,max=2,value=0"></map-meta>
      // so the min/maxZoom should be 2.
      expect(layerExtent.zoom).toEqual({
        maxNativeZoom: 2,
        minNativeZoom: 0,
        maxZoom: 2,
        minZoom: 2
      });
      expect(layerExtent.projection).toEqual('CBMTILE');
    });
  });
  test.describe('Inline Static Features Tests', () => {
    let page;
    let context;
    test.beforeAll(async function () {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto('featureLayer.html');
    });

    test.afterAll(async function () {
      await context.close();
    });
    test('Feature without properties renders & is not interactable', async () => {
      await page.waitForTimeout(2000);
      const featureRendering = await page
        .locator('map-layer#inline > map-feature')
        .evaluate((f) => f._groupEl.firstChild.getAttribute('d'));
      await expect(featureRendering).toEqual(
        'M74 -173L330 -173L330 83L74 83L74 -173z'
      );

      const classList = await page
        .locator('map-layer#inline > map-feature')
        .evaluate((f) => f._groupEl.firstChild.getAttribute('class'));
      await expect(classList).toBeFalsy();
    });
  });
});
