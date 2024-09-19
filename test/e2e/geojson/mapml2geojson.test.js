import { test, expect, chromium } from '@playwright/test';

test.describe('GeoJSON API - mapml2geojson', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapml2geojson.html');
    //await page.waitForTimeout(10000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Point Geometry', async () => {
    const out0 = await page.$eval('body > p#json0', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp0 = await page.$eval('body > p#exp0', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out0).toEqual(exp0);
  });

  test('Line Geometry', async () => {
    const out1 = await page.$eval('body > p#json1', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp1 = await page.$eval('body > p#exp1', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out1).toEqual(exp1);
  });

  test('Polygon Geometry with holes', async () => {
    const out2 = await page.$eval('body > p#json2', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp2 = await page.$eval('body > p#exp2', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out2).toEqual(exp2);
  });

  test('MultiPoint Geometry', async () => {
    const out3 = await page.$eval('body > p#json3', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp3 = await page.$eval('body > p#exp3', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out3).toEqual(exp3);
  });

  test('MultiLineString Geometry', async () => {
    const out4 = await page.$eval('body > p#json4', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp4 = await page.$eval('body > p#exp4', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out4).toEqual(exp4);
  });

  test('MultiPolygon Geometry', async () => {
    const out5 = await page.$eval('body > p#json5', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp5 = await page.$eval('body > p#exp5', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out5).toEqual(exp5);
  });

  test('Feature Collections', async () => {
    const out6 = await page.$eval('body > p#json6', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp6 = await page.$eval('body > p#exp6', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out6).toEqual(exp6);
  });

  test('Geometry Collection', async () => {
    const out7 = await page.$eval('body > p#json7', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp7 = await page.$eval('body > p#exp7', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out7).toEqual(exp7);
  });

  test('propertyFunction + bbox test', async () => {
    const out8 = await page.$eval('body > p#json8', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp8 = await page.$eval('body > p#exp8', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out8).toEqual(exp8);
  });

  test('transform is false', async () => {
    const out9 = await page.$eval('body > p#json9', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp9 = await page.$eval('body > p#exp9', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out9).toEqual(exp9);
  });

  test('map-geometrycollection wrapped in map-a', async () => {
    const out10 = await page.$eval('body > p#json10', (p) =>
      JSON.parse(p.innerHTML)
    );
    const exp10 = await page.$eval('body > p#exp10', (p) =>
      JSON.parse(p.innerHTML)
    );
    expect(out10).toEqual(exp10);
  });
  test('M.mapml2geojson public API method exists and works', async () => {
    const geojsonPoint = await page.evaluate(() => {
      let layer = document.querySelector('[data-testid=point]');
      return M.mapml2geojson(layer);
    });
    expect(geojsonPoint.title).toEqual('Point Geometry');
  });
});
