import { test, expect, chromium } from '@playwright/test';

exports.test = (path, expectedPCRS, expectedGCRS) => {
  test.describe(`<Layer>.extent Property Tests for ${
    path.split('.')[0]
  }`, () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto(path);
    });
    test.beforeEach(async () => {
      await page.waitForTimeout(250);
    });

    test('<map-layer>.extent test', async () => {
      await page.waitForTimeout(200);
      const extent = await page.$eval(
        'body > map > map-layer:nth-child(1)',
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty('zoom')).toBeTruthy();
      expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
      expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
      expect(extent.hasOwnProperty('projection')).toBeTruthy();
      expect(extent.topLeft.pcrs).toEqual(expectedPCRS.topLeft);
      expect(extent.bottomRight.pcrs).toEqual(expectedPCRS.bottomRight);
      // gcrs values go through proj4's inverse projection, whose transcendental
      // math varies in the last ulp or two between browser/V8 versions
      expect(extent.topLeft.gcrs.horizontal).toBeCloseTo(
        expectedGCRS.topLeft.horizontal,
        6
      );
      expect(extent.topLeft.gcrs.vertical).toBeCloseTo(
        expectedGCRS.topLeft.vertical,
        6
      );
      expect(extent.bottomRight.gcrs.horizontal).toBeCloseTo(
        expectedGCRS.bottomRight.horizontal,
        6
      );
      expect(extent.bottomRight.gcrs.vertical).toBeCloseTo(
        expectedGCRS.bottomRight.vertical,
        6
      );
    });
    test('2nd <map-layer>.extent test', async () => {
      const extent = await page.$eval(
        'body > map > map-layer:nth-child(2)',
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty('zoom')).toBeTruthy();
      expect(extent.hasOwnProperty('topLeft')).toBeTruthy();
      expect(extent.hasOwnProperty('bottomRight')).toBeTruthy();
      expect(extent.hasOwnProperty('projection')).toBeTruthy();
    });
  });
};
