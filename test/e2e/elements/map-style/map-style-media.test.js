import { test, expect, chromium } from '@playwright/test';

test.describe('map-style media attribute', () => {
  let page;
  let context;
  let viewer;
  let stylesheet;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-style-media.html');
    await page.waitForTimeout(1000);
    viewer = page.getByTestId('viewer');
    stylesheet = page.locator('map-style');
  });
  test(`when a map-style disables due to a media query, the styles\
   should be removed`, async () => {
    // map starts off at
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
    await stylesheet.evaluate((l) => (l.media = '(14 < map-zoom <= 18)'));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('default_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-style enables due to a mq being removed, the \
 styles should apply`, async () => {
    await stylesheet.evaluate((l) => l.removeAttribute('media'));
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
});
