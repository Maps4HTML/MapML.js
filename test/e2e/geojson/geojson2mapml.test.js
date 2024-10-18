import { test, expect, chromium } from '@playwright/test';

test.describe('GeoJSON API - geojson2mapml', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('geojson2mapml.html');
    await page.waitForTimeout(1000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Point Geometry (string json)', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[0].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(1)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('Line Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[1].innerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(2)').innerHTML
      );
    expect(out).toEqual(exp);
  });

  test('Polygon Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[2].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(3)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('MultiPoint Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[3].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(4)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('MultiLineString Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[4].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(5)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('MultiPolygon Geometry', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[5].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(6)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('Geometry Collection', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[6].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(7)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('Feature Collection', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[7].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(8)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('BBOX, Options label, caption + properties string', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[8].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) => node.content.querySelector('map-layer:nth-child(9)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('BBOX, Options label, caption + properties function', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[9].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) =>
          node.content.querySelector('map-layer:nth-child(10)').outerHTML
      );
    expect(out).toEqual(exp);
  });

  test('Feature', async () => {
    const out = await page.$$eval(
      '#output > map-layer',
      (node) => node[10].outerHTML
    );
    const exp = await page
      .locator('#expected')
      .evaluate(
        (node) =>
          node.content.querySelector('map-layer:nth-child(11)').outerHTML
      );
    expect(out).toEqual(exp);
  });
  test('M.geojson2mapml public API method exists and works', async () => {
    const viewer = page.getByTestId('map');
    await viewer.evaluate((v) => {
      let l = M.geojson2mapml(point, {
        label: 'M.geojson2mapml public API method works'
      });
      v.appendChild(l);
      l.setAttribute('data-testid', 'test-layer');
    });
    const layer = page.getByTestId('test-layer');
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(layer).toHaveAttribute(
      'label',
      'M.geojson2mapml public API method works'
    );
  });
});
