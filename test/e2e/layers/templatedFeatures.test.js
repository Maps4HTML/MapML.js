import { test, expect, chromium } from '@playwright/test';

const isVisible = require('./general/isVisible');
const zoomLimit = require('./general/zoomLimit');
const extentProperty = require('./general/extentProperty');

let expectedPCRS = {
    topLeft: {
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453
    },
    bottomRight: {
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282
    }
  },
  expectedGCRS = {
    topLeft: {
      horizontal: -76,
      vertical: 45.999999999999936
    },
    bottomRight: {
      horizontal: -74,
      vertical: 44.99999999999991
    }
  };

test.describe('Playwright templatedFeatures Layer Tests', () => {
  isVisible.test('templatedFeatures.html', 3, 2);
  zoomLimit.test('templatedFeatures.html', 2, 1);
  extentProperty.test('templatedFeatures.html', expectedPCRS, expectedGCRS);

  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('templatedFeatures.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Templated Features in shadowRoot', () => {
    test("Templated features attaches to MapExtent's shadow root", async () => {
      const shadow = await page.evaluate(
        `document.querySelector('#map2 > layer- > map-extent').shadowRoot`
      );
      const features = await page.evaluate(
        `document.querySelector('#map2 > layer- > map-extent').shadowRoot.querySelectorAll('map-feature').length`
      );
      expect(shadow).toBeTruthy();
      expect(features).toBe(8);
    });
  });

  test.describe('Templated Features Zoom To Extent Tests', () => {
    test('Zoom to layer applies meta extent', async () => {
      const startTopLeft = await page.evaluate(
        `document.querySelector('#map2').extent.topLeft.pcrs`
      );
      const startBottomRight = await page.evaluate(
        `document.querySelector('#map2').extent.bottomRight.pcrs`
      );
      expect(startTopLeft.horizontal).toBe(1509616.5079163536);
      expect(startTopLeft.vertical).toBe(-170323.5596054569);
      expect(startBottomRight.horizontal).toBe(1511931.6167132407);
      expect(startBottomRight.vertical).toBe(-172638.668402344);
      await page.evaluate(`document.querySelector('#map2 > layer-').zoomTo()`);
      const endTopLeft = await page.evaluate(
        `document.querySelector('#map2').extent.topLeft.pcrs`
      );
      const endBottomRight = await page.evaluate(
        `document.querySelector('#map2').extent.bottomRight.pcrs`
      );
      expect(endTopLeft.horizontal).toBe(1508601.8288036585);
      expect(endTopLeft.vertical).toBe(-169068.77063754946);
      expect(endBottomRight.horizontal).toBe(1512570.5867411792);
      expect(endBottomRight.vertical).toBe(-173037.52857506275);
    });

    test('Templated features zoomTo method test', async () => {
      const startTopLeft = await page.evaluate(
        `document.querySelector('#map2').extent.topLeft.pcrs`
      );
      const startBottomRight = await page.evaluate(
        `document.querySelector('#map2').extent.bottomRight.pcrs`
      );
      const startZoomLevel = await page.evaluate(
        `document.querySelector('#map2').zoom`
      );
      expect(startTopLeft.horizontal).toBe(1508601.8288036585);
      expect(startTopLeft.vertical).toBe(-169068.77063754946);
      expect(startBottomRight.horizontal).toBe(1512570.5867411792);
      expect(startBottomRight.vertical).toBe(-173037.52857506275);
      expect(startZoomLevel).toBe(16);
      await page.evaluate(
        `document.querySelector('#map2 > layer- > map-extent').shadowRoot.querySelector('map-feature').zoomTo()`
      );
      const endTopLeft = await page.evaluate(
        `document.querySelector('#map2').extent.topLeft.pcrs`
      );
      const endBottomRight = await page.evaluate(
        `document.querySelector('#map2').extent.bottomRight.pcrs`
      );
      const endZoomLevel = await page.evaluate(
        `document.querySelector('#map2').zoom`
      );
      expect(endTopLeft.horizontal).toBe(1509663.4715519473);
      expect(endTopLeft.vertical).toBe(-171660.43571670353);
      expect(endBottomRight.horizontal).toBe(1509696.5445347577);
      expect(endBottomRight.vertical).toBe(-171693.50869952142);
      expect(endZoomLevel).toBe(25);
    });
  });

  test.describe('Retreived Features Loading Tests', () => {
    test('Loading in tilematrix feature', async () => {
      await page.waitForTimeout(200);
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(3) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M382 -28L809 -28L809 399L382 399z');
    });

    test('Loading in pcrs feature', async () => {
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(1) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M88 681L21 78L-436 201L-346 561z');
    });

    test('Loading in tcrs feature', async () => {
      const feature = await page.$eval(
        'xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(2) > path.leaflet-interactive',
        (tile) => tile.getAttribute('d')
      );
      expect(feature).toEqual('M307 456L599 467L612 629L381 599z');
    });

    test('templated features disabled when panned out of bounds', async () => {
      await page.reload();
      await page.getByTestId('map2').evaluate((map) => {
        map.zoomTo(45.428, -75.346, 14);
      });

      await page.waitForTimeout(500);

      let layerAndLayerCheckboxDisabled = await page
        .getByTestId('restaurants')
        .evaluate((layer) => {
          return (
            layer.disabled === true &&
            layer._layerControlCheckbox.disabled === true
          );
        });

      expect(layerAndLayerCheckboxDisabled).toBe(true);
    });
  });
});
