import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Static Attribute to map', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapStatic.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting New Static Attribute to map', async () => {
    //setting static attribute in the map tag
    await page.$eval('body > map', (viewer) => (viewer.static = true));
    let attribute = await page.$eval('body > map', (viewer) =>
      viewer.hasAttribute('static')
    );
    expect(attribute).toEqual(true);
    //panning, zooming, etc. disabled
    let drag = await page.$eval(
      'body > map',
      (viewer) => viewer._map.dragging._enabled
    );
    let touchZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.touchZoom._enabled
    );
    let doubleClickZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.doubleClickZoom._enabled
    );
    let scrollWheelZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.scrollWheelZoom._enabled
    );
    let boxZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.boxZoom._enabled
    );
    let keyboard = await page.$eval(
      'body > map',
      (viewer) => viewer._map.keyboard._enabled
    );
    let zoomControl = await page.$eval(
      'body > map',
      (viewer) => viewer._zoomControl._disabled
    );
    expect(drag).toEqual(false);
    expect(touchZoom).toEqual(false);
    expect(doubleClickZoom).toEqual(false);
    expect(scrollWheelZoom).toEqual(false);
    expect(boxZoom).toEqual(false);
    expect(keyboard).toEqual(false);
    expect(zoomControl).toEqual(true);
  });

  test('Removing Static Attribute', async () => {
    //removing static attribute in the map tag
    await page.$eval('body > map', (viewer) => (viewer.static = false));
    let attribute = await page.$eval('body > map', (viewer) =>
      viewer.hasAttribute('static')
    );
    expect(attribute).toEqual(false);
    //panning, zooming, etc. enabled
    let drag = await page.$eval(
      'body > map',
      (viewer) => viewer._map.dragging._enabled
    );
    let touchZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.touchZoom._enabled
    );
    let doubleClickZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.doubleClickZoom._enabled
    );
    let scrollWheelZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.scrollWheelZoom._enabled
    );
    let boxZoom = await page.$eval(
      'body > map',
      (viewer) => viewer._map.boxZoom._enabled
    );
    let keyboard = await page.$eval(
      'body > map',
      (viewer) => viewer._map.keyboard._enabled
    );
    let zoomControl = await page.$eval(
      'body > map',
      (viewer) => viewer._zoomControl._disabled
    );
    expect(drag).toEqual(true);
    expect(touchZoom).toEqual(true);
    expect(doubleClickZoom).toEqual(true);
    expect(scrollWheelZoom).toEqual(true);
    expect(boxZoom).toEqual(true);
    expect(keyboard).toEqual(true);
    expect(zoomControl).toEqual(false);
  });
});
