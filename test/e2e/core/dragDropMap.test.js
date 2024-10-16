//Duplicate of dragDrop.html, uses web-map instead
import { test, expect, chromium } from '@playwright/test';

test.describe('Drag and Drop Layers (map-layer, GeoJSON, Link) to web-map', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('dragDropMap.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Drag and drop of valid mapml URL', async () => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        'http://localhost:30001/data/query/DouglasFir',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('map', 'drop', { dataTransfer });
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(2);
  });

  test('Drag and drop of valid geoJSON', async () => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "coordinates": [ [ -79.81317924469873, 43.57621615843999 ], [ -80.67304547572238, 43.287051102433196 ] ], "type": "LineString" } } ] }',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('map', 'drop', { dataTransfer });
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(3);
  });

  test('Drag and drop of valid map-layer', async () => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        '<map-layer label="Ottawa" checked> <map-meta name="projection" content="CBMTILE"></map-meta> <map-meta name="cs" content="gcrs"></map-meta> <map-feature> <map-featurecaption>Ottawa</map-featurecaption> <map-geometry> <map-point class="ottawa"> <map-coordinates>-75.697193 45.421530</map-coordinates> </map-point> </map-geometry> </map-feature> </map-layer>',
        'text/plain'
      );
      return dt;
    });
    await page.dispatchEvent('map', 'drop', { dataTransfer });
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(4);
  });

  test('Drag and drop of Invalid text', async () => {
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add('This is an invalid layer yo!', 'text/plain');
      return dt;
    });
    await page.dispatchEvent('map', 'drop', { dataTransfer });
    await page.waitForTimeout(500);
    await page.hover('.leaflet-top.leaflet-right');
    let vars = await page.$$('.leaflet-control-layers-overlays > fieldset');
    expect(vars.length).toBe(4);
  });
});
