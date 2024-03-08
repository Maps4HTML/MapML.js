import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Client Tile Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('clientTemplatedTileLayer.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test.beforeEach(async () => {
    await page.waitForTimeout(250);
  });
  test('Custom Tiles Loaded In, Accurate Coordinates', async () => {
    const one = await page.$eval(
      '.mapml-tile-group:nth-child(1) > p',
      (tile) => tile.textContent
    );
    const two = await page.$eval(
      '.mapml-tile-group:nth-child(2) > p',
      (tile) => tile.textContent
    );
    const three = await page.$eval(
      '.mapml-tile-group:nth-child(3) > p',
      (tile) => tile.textContent
    );
    const four = await page.$eval(
      '.mapml-tile-group:nth-child(4) > p',
      (tile) => tile.textContent
    );
    const five = await page.$eval(
      '.mapml-tile-group:nth-child(5) > p',
      (tile) => tile.textContent
    );
    const six = await page.$eval(
      '.mapml-tile-group:nth-child(6) > p',
      (tile) => tile.textContent
    );

    expect(one).toEqual('101');
    expect(two).toEqual('001');
    expect(three).toEqual('201');
    expect(four).toEqual('111');
    expect(five).toEqual('011');
    expect(six).toEqual('211');
  });
});
