import { test, expect, chromium } from '@playwright/test';

test.describe('Map-change event are only fired when layers/extents are checked or unchecked in the layer menu ', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      slowMo: 250
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('events/map-change-event.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Map-change event for layers work', async () => {
    let layerClicked = 0;
    page.on('console', (msg) => {
      if (msg.text() === 'Layer clicked') {
        layerClicked++;
      }
    });

    // check and uncheck layers in the DOM shouldn't call map-change
    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      layer.addEventListener('map-change', () => {
        console.log('Layer clicked');
      });
      layer.checked = false;
      layer.checked = true;
    });
    expect(layerClicked).toBe(0);

    // check and uncheck layers using removeAttribute and setAttribute
    // shouldn't call map-change
    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      layer.removeAttribute('checked');
      layer.setAttribute('checked', '');
    });
    expect(layerClicked).toBe(0);

    // check and uncheck layers in the layer menu should call map-change
    await page.hover('.leaflet-top.leaflet-right');
    const button = await page.locator('.leaflet-control-layers-selector');
    await button.click();
    await button.click();

    expect(layerClicked).toBe(2);

    // using keyboard to check and uncheck layers in the layer menu should
    // call map-change
    await page.locator('mapml-viewer').click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    expect(layerClicked).toBe(4);
  });

  test('Map-change event for sub-layers work', async () => {
    let extentClicked = 0;
    page.on('console', (msg) => {
      if (msg.text() === 'Sub-layer clicked') {
        extentClicked++;
      }
    });

    // check and uncheck extents in the DOM shouldn't call map-change
    await page.evaluate(() => {
      const extent = document.querySelector('map-extent');
      extent.addEventListener('map-change', () => {
        console.log('Sub-layer clicked');
      });
      extent.checked = false;
      extent.checked = true;
    });
    expect(extentClicked).toBe(0);

    // check and uncheck extents using removeAttribute and setAttribute
    // shouldn't call map-change
    await page.evaluate(() => {
      const extent = document.querySelector('map-extent');
      extent.removeAttribute('checked');
      extent.setAttribute('checked', '');
    });
    expect(extentClicked).toBe(0);

    // check and uncheck extents in the layer menu should call map-change
    const layerSettings = await page.locator(
      '.mapml-layer-item-settings-control'
    );
    await page.hover('.leaflet-top.leaflet-right');
    await layerSettings.first().click();
    const extentControls = await page.locator('.mapml-layer-extent');
    const button = await extentControls.locator('.mapml-layer-item-toggle');
    await button.click();
    await button.click();

    expect(extentClicked).toBe(2);

    // using keyboard to check and uncheck extents in the layer menu should
    // call map-change
    await page.locator('mapml-viewer').click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    expect(extentClicked).toBe(4);
  });
});
