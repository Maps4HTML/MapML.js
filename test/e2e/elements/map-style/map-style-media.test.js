import { test, expect, chromium } from '@playwright/test';

test.describe('map-style media attribute', () => {
  let page;
  let context;
  let viewer;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-style-media.html');
    await page.waitForTimeout(1000);
    viewer = page.getByTestId('viewer');
  });
  test(`when a map-style loads with a matching media query, the styles apply`, async () => {
    await expect(viewer).toHaveAttribute('zoom', '14');
    // map starts off with orange markers enabled via media="(map-zoom: 14)"
    const orangeStyle = page.getByTestId('orange');
    await expect(orangeStyle).toHaveAttribute('media', '(map-zoom: 14)');
    await expect(viewer).toHaveScreenshot('orange_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test('when a map-style loads without a media query, the styles apply', async () => {
    await expect(viewer).toHaveAttribute('zoom', '14');
    await viewer.evaluate((v) => v.zoomTo(v.lat, v.lon, v.zoom - 1));

    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-style enables due to its mq being removed, the \
 styles should apply`, async () => {
    await expect(viewer).toHaveAttribute('zoom', '13');
    let stylesheet = page.locator('map-style[data-testid="invalid-mq"]');
    await stylesheet.evaluate((l) => l.removeAttribute('media'));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('purple_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-style loads with a non-matching media query, \
its styles do not apply`, async () => {
    await expect(viewer).toHaveAttribute('zoom', '13');
    let stylesheet = page.getByTestId('pink');
    let isRenderedAsStyleElement = await stylesheet.evaluate((s) =>
      s.hasOwnProperty('styleElement')
    );
    await expect(isRenderedAsStyleElement).toBe(false);
  });
  test(`map-style disabled due to setting of non-matching media query`, async () => {
    await expect(viewer).toHaveAttribute('zoom', '13');
    // it's no longer invalid, but valid and matching, let's set it to non-match
    let stylesheet = page.locator('map-style[data-testid="invalid-mq"]');
    await stylesheet.evaluate((s) => (s.media = '(map-zoom: 14)'));
    // markers should fall back to red style

    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`map-style enables when non-matching media query is updated to be matching`, async () => {
    let stylesheet = page.getByTestId('pink');
    // pink is the last stylesheet, closest to content
    await stylesheet.evaluate((s) => (s.media = '(map-zoom: 13)'));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('pink_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`map-style disabled due to update of matching to invalid mq`, async () => {
    let stylesheet = page.getByTestId('pink');
    await stylesheet.evaluate((s) => (s.media = 'invalid mq'));

    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
});
