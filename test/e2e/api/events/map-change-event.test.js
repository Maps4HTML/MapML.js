import { test, expect, chromium } from '@playwright/test';

test.describe('map change event test ', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('events/map-change-event.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Map change event for layers work', async () => {
    let layerClicked = 0;
    page.on('console', (msg) => {
      if (msg.text() === 'Layer clicked') {
        layerClicked++;
      }
    });

    await page.evaluate(() => {
      const layer = document.querySelector('map-layer');
      layer.addEventListener('map-change', () => {
        console.log('Layer clicked');
      });
      layer.checked = false;
      layer.checked = true;
    });

    await page.waitForTimeout(500);
    expect(layerClicked).toBe(2);
  });

  test('Map change event for sub-layers work', async () => {
    let extentClicked = 0;
    page.on('console', (msg) => {
      if (msg.text() === 'Sub-layer clicked') {
        extentClicked++;
      }
    });

    await page.evaluate(() => {
      const extent = document.querySelector('map-extent');
      extent.addEventListener('map-change', () => {
        console.log('Sub-layer clicked');
      });
      extent.checked = false;
      extent.checked = true;
    });

    await page.waitForTimeout(500);
    expect(extentClicked).toBe(2);
  });
});
