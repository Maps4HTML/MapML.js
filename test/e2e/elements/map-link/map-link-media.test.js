import { test, expect, chromium } from '@playwright/test';

test.describe('map-link media attribute', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link-media.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('map-link is disabled when media attribute does not match', async () => {
    // const map = page.locator('mapml-viewer');
    const layer = page.locator('map-layer');
    const mapLink = page.locator('map-link').first();
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(mapLink).not.toHaveAttribute('disabled');

    // zoom out so that media attribute no longer matches, features should be disabled
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 10);
    });
    await expect(layer).toHaveAttribute('disabled');
    await expect(mapLink).toHaveAttribute('disabled');

    // zoom in so that media attribute matches, features should not be disabled
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 15);
    });
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(mapLink).not.toHaveAttribute('disabled');
  });

  test('remove media attribute works', async () => {
    const layer = page.locator('map-layer');
    const mapLink = page.locator('map-link').first();
    await mapLink.evaluate((l) => {
      l.media = '';
    });

    // zooming out no longer disables features
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 10);
    });
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(mapLink).not.toHaveAttribute('disabled');
  });

  test('set media attribute works', async () => {
    const layer = page.locator('map-layer');
    const mapLink = page.locator('map-link').first();
    await mapLink.evaluate((l) => {
      l.setAttribute('media', '(11 < map-zoom <= 18)');
    });

    // zoom out so that media attribute no longer matches, features should be disabled
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 10);
    });
    await expect(layer).toHaveAttribute('disabled');
    await expect(mapLink).toHaveAttribute('disabled');

    // zoom in so that media attribute matches, features should not be disabled
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 15);
    });
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(mapLink).not.toHaveAttribute('disabled');
  });

  test('modify media attribute works', async () => {
    const layer = page.locator('map-layer');
    const mapLink = page.locator('map-link').first();
    await mapLink.evaluate((l) => {
      l.setAttribute('media', '(15 < map-zoom <= 18)');
    });

    // the media attribute no longer matches, features should be disabled
    await expect(layer).toHaveAttribute('disabled');
    await expect(mapLink).toHaveAttribute('disabled');

    // zoom in so that media attribute matches, features should not be disabled
    await page.evaluate(() => {
      const map = document.querySelector('mapml-viewer');
      map.zoomTo(map.lat, map.lon, 16);
    });
    await expect(layer).not.toHaveAttribute('disabled');
    await expect(mapLink).not.toHaveAttribute('disabled');
  });
});
