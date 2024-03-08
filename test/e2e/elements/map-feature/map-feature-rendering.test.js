import { test, expect, chromium } from '@playwright/test';

test.describe('map-feature rendering tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });
  test('Test for zingers', async ({ page }) => {
    await page.goto('render-bug.html');
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot('no-zinger.png', {
      maxDiffPixels: 100
    });
  });
});
