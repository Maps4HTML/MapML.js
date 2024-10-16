import { test, expect, chromium } from '@playwright/test';

let expectedPCRSFirstLayer = {
    topLeft: {
      horizontal: -11940075.314370813,
      vertical: 10941501.97685327
    },
    bottomRight: {
      horizontal: 3823752.959105924,
      vertical: -1554448.395563461
    }
  },
  expectedGCRSFirstLayer = {
    topLeft: {
      horizontal: -164.41282251334343,
      vertical: 26.149380076712948
    },
    bottomRight: {
      horizontal: 70.06993143106092,
      vertical: -11.45750001286738
    }
  };

let expectedPCRSSecondLayer = {
    topLeft: {
      horizontal: -7786477,
      vertical: 7928344
    },
    bottomRight: {
      horizontal: 7148753,
      vertical: -927808
    }
  },
  expectedGCRSSecondLayer = {
    topLeft: {
      horizontal: -155.3514099767017,
      vertical: 22.2852694215843
    },
    bottomRight: {
      horizontal: 32.23057852696884,
      vertical: 10.170068283825733
    }
  };

test.describe('Playwright Missing Min Max Attribute, Meta Default Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('metaDefault.html');
    await page.waitForTimeout(500);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Fetched layer extent test', async () => {
    const extent = await page.$eval(
      'body > mapml-viewer > map-layer:nth-child(1)',
      (layer) => layer.extent
    );
    expect(extent.hasOwnProperty('zoom')).toBeTruthy();
    expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
    expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
    expect(extent.hasOwnProperty('projection')).toBeTruthy();
    expect(extent.topLeft.pcrs).toEqual(expectedPCRSFirstLayer.topLeft);
    expect(extent.bottomRight.pcrs).toEqual(expectedPCRSFirstLayer.bottomRight);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRSFirstLayer.topLeft);
    expect(extent.bottomRight.gcrs).toEqual(expectedGCRSFirstLayer.bottomRight);
  });
  test('Inline layer extent test', async () => {
    const extent = await page.$eval(
      'body > mapml-viewer > map-layer:nth-child(2)',
      (layer) => layer.extent
    );

    expect(extent.hasOwnProperty('zoom')).toBeTruthy();
    expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
    expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
    expect(extent.hasOwnProperty('projection')).toBeTruthy();
    expect(extent.topLeft.pcrs).toEqual(expectedPCRSSecondLayer.topLeft);
    expect(extent.bottomRight.pcrs).toEqual(
      expectedPCRSSecondLayer.bottomRight
    );
    expect(extent.topLeft.gcrs).toEqual(expectedGCRSSecondLayer.topLeft);
    expect(extent.bottomRight.gcrs).toEqual(
      expectedGCRSSecondLayer.bottomRight
    );
  });
  test("Layer with no map-meta's is rendered on map", async () => {
    await page.waitForTimeout(200);
    const layer = await page.evaluateHandle(() =>
      document.querySelector('map-layer[id=defaultMeta]')
    );
    const layerSVG = await page.evaluate(
      (layer) =>
        layer._layer._container.querySelector('path').hasAttribute('d'),
      layer
    );
    expect(layerSVG).toBe(true);
  });
  test("Fetched layer with no map-meta's is rendered on map", async () => {
    const layer = await page.evaluateHandle(() =>
      document.querySelector('map-layer[id=defaultMetaFetched]')
    );
    const layerSVG = await page.evaluate(
      (layer) =>
        layer._layer._container.querySelector('path').hasAttribute('d'),
      layer
    );
    expect(layerSVG).toBe(true);
  });
});
