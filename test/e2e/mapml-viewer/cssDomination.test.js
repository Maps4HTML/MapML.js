import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Width and Height Attribute to mapml-viewer', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('cssDomination.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Css Values Dominate Attribute Values', async () => {
    //height and width attribute value in the mapml-viewer tag
    let height_attribute_value = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.getAttribute('height')
    );
    let width_attribute_value = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.getAttribute('width')
    );
    //actual height and width value of the map
    let map_height = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.height
    );
    let map_width = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.width
    );
    expect(height_attribute_value).not.toEqual(map_height);
    expect(width_attribute_value).not.toEqual(map_width);
    expect(map_width).toEqual(300);
    expect(map_height).toEqual(300);
    expect(height_attribute_value).toEqual('600');
    expect(width_attribute_value).toEqual('600');
  });
});
