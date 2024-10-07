import { test, expect, chromium } from '@playwright/test';

test.describe('Layer Label Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('layerLabel.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Name of unnamed layer is Layer', async () => {
    const label = await page.locator('body > mapml-viewer > layer-');

    await page.waitForTimeout(500);
    expect(await label.evaluate((elem) => elem.label)).toEqual('Layer');
  });

  test('Unnamed layer shows up as Layer in layer control', async () => {
    const text = await page.locator(
      'body > mapml-viewer >> css=div > label.mapml-layer-item-toggle'
    );
    expect(await text.evaluate((text) => text.textContent)).toEqual('Layer');
  });
});

// to do: check that the thing's name is 'Layer'
//		  check that the thing on the layer control panel shows 'Layer'
