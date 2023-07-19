import { test, expect, chromium } from '@playwright/test';

let expectedPCRSFirstLayer = {
    topLeft: {
      horizontal: -3263369.215138428,
      vertical: 4046262.80585894
    },
    bottomRight: {
      horizontal: 3823752.959105924,
      vertical: -1554448.395563461
    }
  },
  expectedGCRSFirstLayer = {
    topLeft: {
      horizontal: -125.78104358919225,
      vertical: 56.11474703973131
    },
    bottomRight: {
      horizontal: -5.116088318047697,
      vertical: 28.87016583287855
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
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('metaDefault.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Inline layer extent test', async () => {
    const extent = await page.$eval(
      'body > mapml-viewer > layer-:nth-child(1)',
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
  test('Fetched layer extent test', async () => {
    const extent = await page.$eval(
      'body > mapml-viewer > layer-:nth-child(2)',
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
    const viewer = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const layerSVG = await (
      await page.evaluateHandle(
        (map) =>
          map.shadowRoot
            .querySelectorAll('.mapml-layer')[2]
            .querySelector('path')
            .getAttribute('d'),
        viewer
      )
    ).jsonValue();
    expect(layerSVG).toEqual(
      'M190 311 L177.5 281 C177.5 261, 202.5 261, 202.5 281 L190 311z'
    );
  });
  test("Fetched layer with no map-meta's is rendered on map", async () => {
    const viewer = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const layerSVG = await (
      await page.evaluateHandle(
        (map) =>
          map.shadowRoot
            .querySelectorAll('.mapml-layer')[3]
            .querySelector('path')
            .getAttribute('d'),
        viewer
      )
    ).jsonValue();
    expect(layerSVG).toEqual(
      'M243 255 L230.5 225 C230.5 205, 255.5 205, 255.5 225 L243 255z'
    );
  });
});
