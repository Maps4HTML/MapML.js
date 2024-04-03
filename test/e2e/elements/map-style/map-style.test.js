import { test, expect, chromium } from '@playwright/test';

test.describe('map-style element tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-style.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test(`mutation observer - style changes when map-style gets updated`, async () => {
    let mapStyle = await page.locator('map-style');
    let styleTextContentMatch = await mapStyle.evaluate((mapStyle) => {
      return mapStyle.styleElement.textContent === mapStyle.textContent;
    });

    expect(styleTextContentMatch).toEqual(true);
    expect(mapStyle).toHaveText('.poly {stroke: black; fill:black}');

    // Change the map-style element to red
    await mapStyle.evaluate((mapStyle) => {
      mapStyle.textContent = '.poly {stroke: red; fill:red}';
    });

    // the style element and the map style should now be red
    mapStyle = await page.locator('map-style');
    styleTextContentMatch = await mapStyle.evaluate((mapStyle) => {
      return mapStyle.styleElement.textContent === mapStyle.textContent;
    });
    expect(styleTextContentMatch).toEqual(true);
    let styleTextContent = await mapStyle.evaluate((mapStyle) => {
      return mapStyle.styleElement.textContent;
    });
    expect(styleTextContent).toEqual('.poly {stroke: red; fill:red}');
  });
});
