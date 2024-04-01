import { test, expect, chromium } from '@playwright/test';

test.describe('map-feature can be inside a shadow root or other custom element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('feature-in-shadow-root.html');
  });
  test('map-feature getMapEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('test-layer');
    const feature = layer.getByTestId('hareg');
    const featureGetMapElResult = await feature.evaluate((f) =>
      f.getMapEl().getAttribute('data-testid')
    );
    expect(featureGetMapElResult).toEqual('viewer');
  });
  test('map-feature getLayerEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    const layer = viewer.getByTestId('test-layer');
    const feature = layer.getByTestId('hareg');
    const featureGetLayerElResult = await feature.evaluate((f) =>
      f.getLayerEl().getAttribute('data-testid')
    );
    expect(featureGetLayerElResult).toEqual('test-layer');
  });
});
