import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright web-map Element Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('map.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Paste geojson Layer to map using ctrl+v', async () => {
    await page.click('body > textarea#copyGeoJSON');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(2);
  });

  test('Paste Link to map using ctrl+v', async () => {
    await page.click('body > textarea#copyLink');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(3);
  });

  test('Paste Invalid text to map using ctrl+v', async () => {
    await page.click('body > textarea#invalidText');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(3);
  });

  test('Paste Invalid link to map using ctrl+v', async () => {
    await page.click('body > textarea#invalidLink');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(3);
  });

  test('Paste links with GeoJSON content-type to map using ctrl+v', async () => {
    await page.click('body > textarea#linkGeoJSONContentType');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(4);
  });

  test('Paste links with JSON content-type to map using ctrl+v', async () => {
    await page.click('body > textarea#linkJSONContentType');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(5);
  });

  test('Paste links with GeoJSON extension to map using ctrl+v', async () => {
    await page.click('body > textarea#linkGeoJSONExt');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(6);
  });

  test('Paste links with JSON extension to map using ctrl+v', async () => {
    await page.click('body > textarea#linkJSONExt');
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    await page.click('body > map');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const layerCount = await page.$eval(
      'body > map',
      (map) => map.layers.length
    );
    expect(layerCount).toEqual(7);
  });

  test('Press spacebar when focus is on map', async () => {
    //  scroll to the top
    await page.mouse.wheel(0, -1000);
    await page.waitForTimeout(300);
    await page.click('body > map');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    const currPos = await page.$eval('body > map', () => window.pageYOffset);
    expect(currPos).toEqual(0);
  });

  test.describe('Controls List search Attribute Tests', () => {
    test('controlslist=search shows search control', async () => {
      await page.$eval('body > map', (map) =>
        map.setAttribute('controlslist', 'search')
      );
      let searchControl = await page.locator('.mapml-search-control');
      await expect(searchControl).toBeVisible();
    });
    test('search control hidden when controlslist does not contain search', async () => {
      await page.$eval('body > map', (map) =>
        map.setAttribute('controlslist', 'noreload')
      );
      let searchControl = await page.locator('.mapml-search-control');
      await expect(searchControl).toBeHidden();
    });
    test('search control persists after toggling controls', async () => {
      await page.$eval('body > map', (map) =>
        map.setAttribute('controlslist', 'search')
      );
      // toggle controls off
      await page.click('body > map', { button: 'right' });
      await page.click('.mapml-contextmenu > button:nth-of-type(6)');
      // toggle controls on
      await page.click('body > map', { button: 'right' });
      await page.click('.mapml-contextmenu > button:nth-of-type(6)');

      let searchControl = await page.locator('.mapml-search-control');
      await expect(searchControl).toBeVisible();
    });
    test('controlsList property reflects search token', async () => {
      let contains = await page.$eval('body > map', (map) =>
        map.controlsList.contains('search')
      );
      expect(contains).toEqual(true);

      // clean up
      await page.$eval('body > map', (map) =>
        map.removeAttribute('controlslist')
      );
    });
  });
});
