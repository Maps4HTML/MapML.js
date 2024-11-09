import { test, expect, chromium } from '@playwright/test';

test.describe('pmtiles map-link with associated style can be in a remote mapml document', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });

  test.beforeEach(async function () {
    await page.goto('pmtiles/map-link-pmtiles-styles.html');
  });
  test('map-link styles load correctly from within remote mapml', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('dark');
    layer.evaluate((l) => (l.checked = true));
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('pmtiles-dark.png', {
      maxDiffPixels: 200
    });
  });

  test('map-link in remote content selects correct stylesheet link from context', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('dark');
    layer.evaluate((l) => (l.checked = true));
    await page.waitForTimeout(500);
    const darkExtent = viewer.getByTestId('dark-me');
    const lightExtent = viewer.getByTestId('light-me');

    await darkExtent.evaluate((e) => {
      e.removeAttribute('checked');
    });
    await lightExtent.evaluate((e) => {
      e.checked = true;
    });
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('pmtiles-light.png', {
      maxDiffPixels: 200
    });
  });
  test('map-link in local content selects correct stylesheet link from context', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const remoteLayer = viewer.getByTestId('dark');
    const layer = viewer.getByTestId('local-layer');
    await layer.evaluate((l) => (l.checked = true));

    const darkExtent = viewer.getByTestId('local-dark-me');
    const lightExtent = viewer.getByTestId('local-light-me');

    await darkExtent.evaluate((e) => {
      e.removeAttribute('checked');
    });
    await lightExtent.evaluate((e) => {
      e.checked = true;
    });
    await page.waitForTimeout(500);
    await expect(viewer).toHaveScreenshot('pmtiles-local-light.png', {
      maxDiffPixels: 200
    });
  });
});
