import { test, expect, chromium } from '@playwright/test';

const isVisible = require('./general/isVisible');
const zoomLimit = require('./general/zoomLimit');
const extentProperty = require('./general/extentProperty');

let expectedPCRS = {
    topLeft: {
      horizontal: -6207743.103886206,
      vertical: 3952277.216154434
    },
    bottomRight: {
      horizontal: 3952277.216154434,
      vertical: -3362085.3441706896
    }
  },
  expectedGCRS = {
    topLeft: {
      horizontal: -136.9120743861578,
      vertical: 54.8100849543377
    },
    bottomRight: {
      horizontal: -6.267177352336376,
      vertical: 6.5831982143623975
    }
  };

test.describe('Playwright templatedImage Layer Tests', () => {
  isVisible.test('templatedImageLayer.html', 2, 2);
  zoomLimit.test('templatedImageLayer.html', 1, 0);
  extentProperty.test('templatedImageLayer.html', expectedPCRS, expectedGCRS);

  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page = await context.newPage();
    await page.goto('templatedImageLayer.html');
  });

  test('Templated image layer position when turn it off then on', async () => {
    await page.click('body > map');
    for (let i = 0; i < 5; ++i) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
    }
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > input'
    );
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > input'
    );
    await page.waitForTimeout(500);
    const imagePos = await page.$eval('body > map', (map) => {
      let layers = map._map._layers;
      let keys = Object.keys(layers);
      return layers[keys[keys.length - 1]]._location;
    });
    const expectedPos = {
      x: 0,
      y: -400
    };
    expect(imagePos).toEqual(expectedPos);
  });
  test('Templated image layer - remove previous image on moveend', async () => {
    await page.click('body > map');
    // generate a few map moves
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.waitForLoadState('networkidle');
    const images = await page.locator(
      '.mapml-extentlayer-container > .mapml-image-container > .leaflet-image-loaded'
    );
    await expect(images).toHaveCount(1);
  });
});
