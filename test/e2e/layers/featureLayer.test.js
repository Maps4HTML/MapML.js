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
      const features = await page.$eval(
        'layer-#US',
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
      const layerExtent = await page.$eval(
        'body > map > layer-:nth-child(3)',
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
      expect(layerExtent.zoom).toEqual({
        maxNativeZoom: 0,
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
      const feature = await page.$eval('layer-#inline', (layer) =>
        layer._layer._container.querySelector('path').getAttribute('d')
      );
      const classList = await page.$eval('layer-#inline', (layer) =>
        layer._layer._container
          .querySelector('svg')
          .firstChild.firstChild.getAttribute('class')
      );
      expect(feature).toEqual('M74 -173L330 -173L330 83L74 83L74 -173z');
      expect(classList).toBeFalsy();
    });
  });
});
