import { test, expect, chromium } from '@playwright/test';

test.describe('map-input can be inside a shadow root or other custom element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-input-in-shadow-root.html');
  });
  test('map-input getMapEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('test-layer');
    const input = layer.getByTestId('test-input');
    const inputGetMapElResult = await input.evaluate((i) =>
      i.getMapEl().getAttribute('data-testid')
    );
    expect(inputGetMapElResult).toEqual('viewer');
  });
  test('map-input getLayerEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    const layer = viewer.getByTestId('test-layer');
    const input = layer.getByTestId('test-input');
    const inputGetLayerElResult = await input.evaluate((i) =>
      i.getLayerEl().getAttribute('data-testid')
    );
    expect(inputGetLayerElResult).toEqual('test-layer');
  });
});
