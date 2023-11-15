import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Map Element Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('tms.html');
    await page.waitForTimeout(250);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Painting tiles are in proper order', async () => {
    let tileOrder = ['1/0/1', '1/0/0', '1/1/1', '1/1/0'];
    const firstTile = await page
      .locator('mapml-viewer .mapml-tile-group:nth-child(1) > img')
      .evaluate((img) => img.src);
    const secondTile = await page
      .locator('mapml-viewer .mapml-tile-group:nth-child(2) > img')
      .evaluate((img) => img.src);
    const thirdTile = await page
      .locator('mapml-viewer .mapml-tile-group:nth-child(3) > img')
      .evaluate((img) => img.src);
    const fourthTile = await page
      .locator('mapml-viewer .mapml-tile-group:nth-child(4) > img')
      .evaluate((img) => img.src);
    expect(firstTile).toContain(tileOrder[0]);
    expect(secondTile).toContain(tileOrder[1]);
    expect(thirdTile).toContain(tileOrder[2]);
    expect(fourthTile).toContain(tileOrder[3]);
  });
});
