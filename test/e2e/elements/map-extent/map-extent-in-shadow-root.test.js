import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent can be inside a shadow root or other custom element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-extent-in-shadow-root.html');
  });
  test('map-extent getMapEl() works in shadow root', async () => {
    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('test-layer');
    const extent = layer.locator('map-extent');
    const extentGetMapElResult = await extent.evaluate((e) =>
      e.getMapEl().getAttribute('data-testid')
    );
    expect(extentGetMapElResult).toEqual('viewer');
  });
  test('map-extent getLayerEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    const layer = viewer.getByTestId('test-layer');
    const extent = layer.locator('map-extent');
    const extentGetLayerElResult = await extent.evaluate((e) =>
      e.getLayerEl().getAttribute('data-testid')
    );
    expect(extentGetLayerElResult).toEqual('test-layer');
  });
});
