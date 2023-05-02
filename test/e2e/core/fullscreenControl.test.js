import { test, expect, chromium } from '@playwright/test';

////expected topLeft values in the different cs, at the different
//positions the map goes in

const playwright = require('playwright');

test.describe('Playwright mapml-viewer fullscreen tests', () => {
  let context, page;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      slowMo: 250
    });
    page = await context.newPage();
  });
  test.afterAll(async () => {
    await context.close();
  });
  test.beforeEach(async () => {
    await page.goto('fullscreenControlMapmlViewer.html');
  });
  test('Fullscreen button makes mapml-viewer element the fullscreen element', async () => {
    await page.click(
      'xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    // the first mapml-viewer should be returned by document.fullscreen
    expect(fullscreenElement).toEqual('map1');
    await page.click(
      'xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
    await page.click(
      'xpath=/html/body/mapml-viewer[2] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await page.click(
        'xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a',
        { timeout: 500 }
      );
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
  });

  test('Context Menu Fullscreen Button makes the mapml-viewer element fullscreen', async () => {
    await page.click('body > #map1');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F');
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    expect(fullscreenElement).toEqual('map1');
  });
});

test.describe('Playwright mapml-viewer fullscreen tests', () => {
  let context, page;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      slowMo: 250
    });
    page = await context.newPage();
  });
  test.afterAll(async () => {
    await context.close();
  });
  test.beforeEach(async () => {
    await page.goto('fullscreenControlWebMap.html');
  });
  test('Fullscreen button makes map element the fullscreen element', async () => {
    await page.click(
      'xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    // the first map element should be returned by document.fullscreen
    expect(fullscreenElement).toEqual('map1');
    await page.click(
      'xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
    await page.click(
      'xpath=/html/body/map[2]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a'
    );
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await page.click(
        'xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a',
        { timeout: 500 }
      );
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual('map2');
  });

  test('Context Menu Fullscreen Button makes the map element fullscreen', async () => {
    await page.click('body > #map1');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('F');
    let fullscreenElement = await page.evaluate(
      `document.fullscreenElement.id`
    );
    expect(fullscreenElement).toEqual('map1');
  });
});
