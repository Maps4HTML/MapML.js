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
      expect(extent.topLeft.gcrs).toEqual(expectedGCRS.topLeft);
      expect(extent.bottomRight.gcrs).toEqual(expectedGCRS.bottomRight);
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
