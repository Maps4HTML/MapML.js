import { test, expect, chromium } from '@playwright/test';

test.describe('Adding Width and Height Attribute to mapml-viewer', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapml-viewerHeightAndWidthAttributes.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Setting New Width and Height Attributes to mapml-viewer', async () => {
    //setting new height and width attribute values in the mapml-viewer tag
    await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.setAttribute('width', '700')
    );
    await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.setAttribute('height', '700')
    );
    //actual height and width value of the map
    let height_without_px = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.height
    );
    let width_without_px = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.width
    );
    expect(height_without_px).toEqual(700);
    expect(width_without_px).toEqual(700);
  });

  test('Testing Validity of Width and Height Attributes', async () => {
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
    let height_with_px = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer._container.style.height
    );
    let width_with_px = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer._container.style.width
    );
    expect(height_with_px).toEqual(height_attribute_value + 'px');
    expect(width_with_px).toEqual(width_attribute_value + 'px');
  });

  test('Map Property Dimension Match On Window Size Change', async () => {
    await page.goto('windowSizeChange.html');
    //change initial viewport of the map
    await page.setViewportSize({ width: 300, height: 300 });
    //actual height and width value of the map
    let _height = await page.$eval(
      'body > mapml-viewer',
      (viewer) => window.getComputedStyle(viewer).height
    );
    let _width = await page.$eval(
      'body > mapml-viewer',
      (viewer) => window.getComputedStyle(viewer).width
    );
    //expected width and height
    let map_height = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.height
    );
    let map_width = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.width
    );
    map_height += 'px';
    map_width += 'px';
    expect(map_height).toEqual(_height);
    expect(map_width).toEqual(_width);
  });

  test('Only Width Added to A Map With No Width OR Height Attributes', async () => {
    await page.goto('noWidthAndHeight.html');
    let has_height = await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.hasAttribute('height')
    );
    expect(has_height).toEqual(false);
    //set a height attribute to a map with no height or width attributes
    await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.setAttribute('height', '500')
    );
    //expected height to be true
    has_height = await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.hasAttribute('height')
    );
    expect(has_height).toEqual(true);
  });

  test('Only Height Added to A Map With No Width OR Height Attributes', async () => {
    await page.goto('noWidthAndHeight.html');
    let has_width = await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.hasAttribute('width')
    );
    expect(has_width).toEqual(false);
    //set a height attribute to a map with no height or width attributes
    await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.setAttribute('width', '500')
    );
    //expected height to be true
    has_width = await page.$eval('body > mapml-viewer', (viewer) =>
      viewer.hasAttribute('width')
    );
    expect(has_width).toEqual(true);
  });
});
