import { test, expect, chromium } from '@playwright/test';

test.describe('map-link can be inside a shadow root or other custom element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link-in-shadow-root.html');
  });

  test('map-link getMapEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toBeTruthy();
    const layer = viewer.getByTestId('test-layer');
    const link = layer.getByTestId('test-link');
    const linkGetMapElResult = await link.evaluate((l) =>
      l.getMapEl().getAttribute('data-testid')
    );
    expect(linkGetMapElResult).toEqual('viewer');
  });
  test('map-link getLayerEl() works in shadow root', async () => {
    const viewer = page.getByTestId('viewer');
    const layer = viewer.getByTestId('test-layer');
    const link = layer.getByTestId('test-link');
    const linkGetLayerElResult = await link.evaluate((l) =>
      l.getLayerEl().getAttribute('data-testid')
    );
    expect(linkGetLayerElResult).toEqual('test-layer');
  });
});
