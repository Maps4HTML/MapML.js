import { test, expect, chromium } from '@playwright/test';

/*
 * Skip this use case until we figure out how to use media queries to select
 * links based on map scale, projection, zoom, extent etc.
 *
 * In the current configuration, the map is constrained to allow zooming only
 * within the zoom bounds of its layers. So, if the layer only allows zoom
 * levels 0-8 and it should give way to a different linked layer resource at
 * zoom = 9, and THEN change projections due to it being the only layer on the
 * map, there is a conflict between to maxZoom of the map (based on the initial
 * layer's min/max Zoom) and the zoom at which the layer should change source.
 *
 * That mechanism should be re-designed, eliminating the need for the zoomin and
 * zoomout link relations, by using links that have media queries on them,
 * probably with a simple rel=alternate value.
 */
test.describe.skip('Playwright zoomin zoomout Projection Change Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('zoomChangeProjection.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('zoomin link changes projections', async () => {
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
    );
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > map',
      (map) => map.projection
    );
    const layerValid = await page.$eval(
      'body > map > map-layer',
      (layer) => !layer.hasAttribute('disabled')
    );
    expect(newProjection).toEqual('OSMTILE');
    expect(layerValid).toEqual(true);
  });

  test('zoomout link changes projections', async () => {
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
    );
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > map',
      (map) => map.projection
    );
    const layerValid = await page.$eval(
      'body > map > map-layer',
      (layer) => !layer.hasAttribute('disabled')
    );
    expect(newProjection).toEqual('CBMTILE');
    expect(layerValid).toEqual(true);
  });
});
