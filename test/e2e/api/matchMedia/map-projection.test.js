import { test, expect, chromium } from '@playwright/test';

test.describe('matchMedia map-projection tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {});
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('map-projection.html');
    await page.waitForTimeout(500);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('matchMedia API shows maps based on projections selected by user', async () => {
    const map = page.locator('mapml-viewer');
    const osmLayer = page.locator('#OSMTILE');
    const cbmtLayer = page.locator('#CBMTILE');
    const switchOSM = page.locator('.switchOSM');
    const switchCBMT = page.locator('.switchCBMT');

    await switchCBMT.click();
    await page.waitForTimeout(500);
    await expect(osmLayer).toHaveAttribute('hidden');

    await switchOSM.click();
    await page.waitForTimeout(500);
    await expect(cbmtLayer).toHaveAttribute('hidden');
  });
});
