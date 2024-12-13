import { test, expect, chromium } from '@playwright/test';

test.describe('map-link rel=stylesheet media attribute', () => {
  let page;
  let context;
  let viewer;
  let stylesheetLink;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link-stylesheet-media.html');
    await page.waitForTimeout(1000);
    viewer = page.getByTestId('viewer');
    stylesheetLink = page.locator('map-link[rel=stylesheet][href="red.css"]');
  });
  test(`when a map-link disables due to a media query, the styles\
   should be removed`, async () => {
    // map starts off at
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
    await stylesheetLink.evaluate((l) => (l.media = '(14 < map-zoom <= 18)'));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('default_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-link enables due to a mq being removed, the \
 styles should apply`, async () => {
    await stylesheetLink.evaluate((l) => l.removeAttribute('media'));
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });

  test(`when a map-link enables due to disabled attribute removed\
   ensure styles change`, async () => {
    await stylesheetLink.evaluate((l) => (l.disabled = true));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('default_styled_markers.png', {
      maxDiffPixels: 20
    });
    await stylesheetLink.evaluate((l) => (l.disabled = false));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
  test(`when a map-link does not enable due to disabled attribute \
removed while a non-matching media query is present, ensure that style does not \
change`, async () => {
    await stylesheetLink.evaluate((l) => (l.disabled = true));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('default_styled_markers.png', {
      maxDiffPixels: 20
    });
    // non-matching query (map z=14)
    await stylesheetLink.evaluate((l) => (l.media = '(14 < map-zoom <= 18)'));
    await page.waitForTimeout(500);
    // disabled overrides the media query because they compete to change it
    await stylesheetLink.evaluate((l) => (l.disabled = false));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('red_styled_markers.png', {
      maxDiffPixels: 20
    });
  });
});
