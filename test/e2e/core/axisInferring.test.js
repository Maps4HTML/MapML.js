import { test, expect, chromium } from '@playwright/test';

test.describe('UI Drag&Drop Test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('axisInferring.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  /**
   *
   * The point of "axisInferring.test.js" is to validate that the extent's cs
   * is correctly inferred from the axis names in the <map-meta name="extent"
   * content="..."> content attribute.
   *
   * Semantics: the extent of the layers should include the extent of the map-meta
   * -specified extent PLUS the contents of the layer (a map-feature in all cases).
   *
   * The test expectations were actually measured from the loaded html.
   */
  test('TileMatrix inferring', async () => {
    await page.waitForTimeout(1000);
    const layerExtent = await page.$eval(
      'body > map > map-layer:nth-child(1)',
      (layer) => layer.extent
    );

    expect(layerExtent.topLeft.tilematrix[0]).toEqual({
      horizontal: 0,
      vertical: 1
    });
    expect(layerExtent.bottomRight.tilematrix[0]).toEqual({
      horizontal: 4,
      vertical: 5
    });
  });

  test('TCRS inferring', async () => {
    const layerExtent = await page.$eval(
      'body > map > map-layer:nth-child(2)',
      (layer) => layer.extent
    );

    expect(layerExtent.topLeft.tcrs[0]).toEqual({
      horizontal: 0,
      vertical: 256
    });
    expect(layerExtent.bottomRight.tcrs[0]).toEqual({
      horizontal: 868.9331277338575,
      vertical: 1069.7755295390994
    });
  });

  test('PCRS inferring', async () => {
    const layerExtent = await page.$eval(
      'body > map > map-layer:nth-child(3)',
      (layer) => layer.extent
    );
    // the top left corner is that of the map-meta[name=extent]
    expect(layerExtent.topLeft.pcrs).toEqual({
      horizontal: -6601973,
      vertical: 1569758
    });
    // the bottom right corner is that of the map-feature
    expect(layerExtent.bottomRight.pcrs).toEqual({
      horizontal: -1319475.9373123178,
      vertical: -1731574.5341126453
    });
  });

  test('GCRS inferring', async () => {
    const layerExtent = await page.$eval(
      'body > map > map-layer:nth-child(4)',
      (layer) => layer.extent
    );
    let expectedTopLeftLongitude = -114.815198;
    let expectedTopLeftLatitude = 53;
    let expectedBottomRightLongitude = -62;
    let expectedBottomRightLatitude = 31.331629;

    expect(layerExtent.topLeft.gcrs.horizontal).toBeCloseTo(
      expectedTopLeftLongitude,
      6
    );
    expect(layerExtent.topLeft.gcrs.vertical).toBeCloseTo(
      expectedTopLeftLatitude,
      6
    );

    expect(layerExtent.bottomRight.gcrs.horizontal).toBeCloseTo(
      expectedBottomRightLongitude,
      6
    );
    expect(layerExtent.bottomRight.gcrs.vertical).toBeCloseTo(
      expectedBottomRightLatitude,
      6
    );
  });
});
