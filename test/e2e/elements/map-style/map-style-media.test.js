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
    stylesheet = page.locator('map-style[data-testid="invalid-mq"]');
  });
  test(`when a map-style disables due to a media query, the styles\
   should be removed`, async () => {
    // map starts off with orange markers
    await expect(viewer).toHaveScreenshot('orange_styled_markers.png', {
      maxDiffPixels: 20
    });
    await viewer.evaluate((v)=> v.zoomTo(v.lat,v.lon, (v.zoom - 1)));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-style enables due to a mq being removed, the \
 styles should apply`, async () => {
    
    await stylesheet.evaluate((l) => l.removeAttribute('media'));
        await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('purple_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
});

// when a map-style loads with a matching media query, the styles apply
// when a map-style loads without a media query, the styles apply
// when a map-style loads with a non-matching media query, the styles do not apply
// map-style disabled due to setting of non-matching media query
// map-style enables when non-matching media query is updated to be matching
// map-style disabled due to update of matching to invalid mq
// map-style enables due to removal of invalid mq
//
