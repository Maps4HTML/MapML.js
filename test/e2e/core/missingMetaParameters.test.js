import { test, expect, chromium } from '@playwright/test';

test.describe('Missing Parameters Test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('missingMetaParameters.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Static features with missing <map-meta name='zoom'></map-meta> & <map-meta name='extent'></map-meta>", async () => {
    await page.waitForTimeout(1000);
    const layerController = await page.$eval(
      'body > map:nth-child(1) > map-layer:nth-child(1)',
      (controller) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -2056306.8122221958,
      vertical: -870644.8824683931
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: -614264.1987553611,
      vertical: -1731574.5341126453
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 4,
      minNativeZoom: 2,
      minZoom: 0,
      maxZoom: 25
    });
  });

  test("Static tiles with missing <map-meta name='zoom'></map-meta>", async () => {
    const layerController = await page.$eval(
      'body > map:nth-child(1) > map-layer:nth-child(3)',
      (controller) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -4175739.0398780815,
      vertical: 5443265.599864535
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 5984281.280162558,
      vertical: -1330081.280162558
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 3,
      minNativeZoom: 2,
      minZoom: 1,
      maxZoom: 4
    });
  });

  test("Templated features with missing <map-meta name='zoom'></map-meta>", async () => {
    await page.waitForTimeout(500);
    const layerController = await page.$eval(
      'body > map:nth-child(1) > map-layer:nth-child(2)',
      (controller) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 18,
      minNativeZoom: 2,
      minZoom: 2,
      maxZoom: 18
    });
  });

  test("Templated tiles with missing <map-meta name='zoom'></map-meta> & extent", async () => {
    await page.waitForTimeout(500);
    const layerController = await page.$eval(
      'body > map:nth-child(2) > map-layer',
      (controller) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -180,
      vertical: 90
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 180,
      vertical: -90
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 2,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 2
    });
  });

  test("Templated image with missing <map-meta name='zoom'></map-meta>", async () => {
    const layerController = await page.$eval(
      'body > map:nth-child(1) > map-layer:nth-child(4)',
      (controller) => controller.extent
    );

    expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 28448056,
      vertical: 42672085
    });
    expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 38608077,
      vertical: 28448056
    });
    expect(layerController.zoom).toEqual({
      maxNativeZoom: 19,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 19
    });
  });
});
