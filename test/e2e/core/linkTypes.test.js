import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Feature Links Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('linkTypes.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('HTML Link Type Tests', () => {
    test('HTML _self target navigates to new page', async () => {
      await page.click('body > map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Enter'); // Press enter on the feature in the top-left
      await page.waitForTimeout(1000);
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
    });
    test('HTML _top target point navigates to new page', async () => {
      await page.goBack();
      await page.waitForTimeout(1000);
      await page.click('body > map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter'); // Press enter on the top point feature in the top left
      await page.waitForTimeout(1000);
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/fdi/');
    });
    test('HTML _parent target point navigates to new page', async () => {
      await page.goBack();
      await page.waitForTimeout(1000);
      await page.click('body > map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }
      await page.keyboard.press('Enter'); // Press enter on the second feature in the top left
      await page.waitForTimeout(1000);
      const url = await page.url();
      expect(url).toEqual('https://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/');
    });
    test('HTML _blank target projection negotiation with hash', async () => {
      await page.goBack();
      await page.waitForTimeout(2000);
      await page.click('body > map');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter'); // Press enter on the second point in the top left
      await page.waitForTimeout(1000);
      const extent = await page.$eval('body > map', (map) => map.extent);
      expect(extent.topLeft.gcrs).toEqual({
        horizontal: -118.38250407225894,
        vertical: 54.364895138267244
      });
      expect(extent.bottomRight.gcrs).toEqual({
        horizontal: -41.67362559864071,
        vertical: 7.463862967414659
      });
    });
  });
});
