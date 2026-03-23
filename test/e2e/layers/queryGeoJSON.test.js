import { test, expect, chromium } from '@playwright/test';

test.describe('GeoJSON Query Response', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', {
      headless: true,
      slowMo: 250
    });
    page = await context.newPage();
    await page.goto('queryGeoJSON.html');
    await page.waitForTimeout(1000);
  });
  test.afterAll(async function () {
    await context.close();
  });
  test('Query returns features from all four GeoJSON extents', async () => {
    await page.click('mapml-viewer');
    const popupContainer = page.locator('.mapml-popup-content > iframe');
    await expect(popupContainer).toBeVisible();
    const popupFeatureCount = page.locator('.mapml-feature-count');
    await expect(popupFeatureCount).toHaveText('1/4', { useInnerText: true });
  });
  test('Standard CRS:84 GeoJSON feature has cs meta set to gcrs', async () => {
    // The first feature comes from the CRS:84 extent (geojsonFeature)
    // Its meta should have cs=gcrs since coordinates are standard lon/lat
    let csMeta = await page.evaluate(() => {
      let layer = document.querySelector('mapml-viewer').layers[0]._layer;
      let features = layer._mapmlFeatures;
      // find the feature from CRS:84 response (the polygon from geojsonFeature)
      let f = features.find(
        (feat) => feat.querySelector('map-polygon') !== null
      );
      if (f && f.meta) {
        let cs = f.meta.find((m) => m.getAttribute('name') === 'cs');
        return cs ? cs.getAttribute('content') : null;
      }
      return null;
    });
    expect(csMeta).toBe('gcrs');
  });
  test('GeoJSON with explicit crs member has cs meta set to pcrs', async () => {
    // The feature from geojsonProjectedWithCrs has a "crs" member
    // Its meta should have cs=pcrs
    let csMeta = await page.evaluate(() => {
      let layer = document.querySelector('mapml-viewer').layers[0]._layer;
      let features = layer._mapmlFeatures;
      // find the feature with properties containing "Test Point with CRS"
      let f = features.find((feat) => {
        let props = feat.querySelector('map-properties');
        return props && props.innerHTML.includes('Test Point with CRS');
      });
      if (f && f.meta) {
        let cs = f.meta.find((m) => m.getAttribute('name') === 'cs');
        return cs ? cs.getAttribute('content') : null;
      }
      return null;
    });
    expect(csMeta).toBe('pcrs');
  });
  test('GeoJSON with projected coordinates but no crs member has cs meta set to pcrs via magnitude heuristic', async () => {
    // The feature from geojsonProjectedNoCrs has large coordinate values
    // but no "crs" member — the magnitude heuristic should detect this
    let csMeta = await page.evaluate(() => {
      let layer = document.querySelector('mapml-viewer').layers[0]._layer;
      let features = layer._mapmlFeatures;
      // find the feature with properties containing "Test Point projected no CRS"
      let f = features.find((feat) => {
        let props = feat.querySelector('map-properties');
        return props && props.innerHTML.includes('Test Point projected no CRS');
      });
      if (f && f.meta) {
        let cs = f.meta.find((m) => m.getAttribute('name') === 'cs');
        return cs ? cs.getAttribute('content') : null;
      }
      return null;
    });
    expect(csMeta).toBe('pcrs');
  });
  test('GeoJSON with null geometry is processed via geojson2mapml with synthesized click-point geometry', async () => {
    // The feature from geojsonNullGeometry has geometry: null
    // It should still be processed by geojson2mapml (properties as table)
    // with a synthesized point geometry at the click location
    let result = await page.evaluate(() => {
      let layer = document.querySelector('mapml-viewer').layers[0]._layer;
      let features = layer._mapmlFeatures;
      // find the feature with properties containing "PIEN"
      let f = features.find((feat) => {
        let props = feat.querySelector('map-properties');
        return props && props.innerHTML.includes('PIEN');
      });
      if (!f) return { found: false };
      // check that properties are rendered as a table (geojson2mapml default)
      let props = f.querySelector('map-properties');
      let hasTable = props.querySelector('table') !== null;
      // check that a point geometry was synthesized
      let hasPoint = f.querySelector('map-geometry map-point') !== null;
      return { found: true, hasTable: hasTable, hasPoint: hasPoint };
    });
    expect(result.found).toBe(true);
    expect(result.hasTable).toBe(true);
    expect(result.hasPoint).toBe(true);
  });
});
