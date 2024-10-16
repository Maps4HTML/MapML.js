import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Opacity Attribute to the map-layer Element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('layerOpacityAttribute.html');
    const l = await page.locator('map-layer');
    await l.evaluate((l) => l.whenReady());
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting Opacity Attibute to map-layer Element', async () => {
    let opacity_attribute_value = await page.$eval(
      'body > mapml-viewer > map-layer',
      (layer) => layer.getAttribute('opacity')
    );
    let layer_opacity = await page.$eval(
      'body > mapml-viewer > map-layer',
      (layer) => layer.opacity
    );
    expect(layer_opacity).toEqual(+opacity_attribute_value);
  });
  test('Opacity Slider Value Test', async () => {
    let opacity_slider_value = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input[type=range]',
      (input) => input.value
    );
    let layer_opacity = await page.$eval(
      'body > mapml-viewer > map-layer',
      (layer) => layer.opacity
    );
    expect(layer_opacity).toEqual(+opacity_slider_value);
  });
});
