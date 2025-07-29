import { test, expect, chromium } from '@playwright/test';

test.describe('map-layer media attribute', () => {
  let page;
  let context;
  let viewer;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-layer-media.html');
    await page.waitForTimeout(1000);
    viewer = page.getByTestId('viewer');
  });
  test('On initial load, a matching media queried layer is enabled', async () => {
    const matchedQueryLayer = page.getByTestId('initial-mq');
    // map loads at z=2, query matches 0 <= z <= 3
    await expect(matchedQueryLayer).not.toHaveAttribute('disabled', '');
  });
  test(`A visible (enabled) map-layer with no media query should remain enabled \
when a matching mq is added`, async () => {
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await expect(noInitialQueryLayer).not.toHaveAttribute('disabled', '');
    await viewer.evaluate((v) => v.zoomTo(v.lat, v.lon, 4));
    await page.waitForTimeout(200);
    // should still be enabled:
    await expect(noInitialQueryLayer).not.toHaveAttribute('disabled', '');
  });
  test(`A visible (enabled) map-layer with no media query should be disabled \
when a non-matching media query attribute is set`, async () => {
    await expect(viewer).toHaveAttribute('zoom', '4');
    const presentInLayerControl = await viewer.evaluate((v) => {
      let lc = v._layerControl;
      let layers = lc._layers.map((e) => e.layer._layerEl);
      let noInitialQueryLayer = v.querySelector('[data-testid=no-initial-mq]');
      return layers.some((e) => e === noInitialQueryLayer);
    });
    expect(presentInLayerControl).toBe(true);
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await expect(noInitialQueryLayer).not.toHaveAttribute('disabled', '');
    await noInitialQueryLayer.evaluate(
      (l) => (l.media = '(0 <= map-zoom <=3)')
    );
    await expect(noInitialQueryLayer).toHaveAttribute('disabled', '');
  });
  test(`A mq-disabled layer is removed from the layer control`, async () => {
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await expect(noInitialQueryLayer).toHaveAttribute(
      'media',
      '(0 <= map-zoom <=3)'
    );
    await expect(noInitialQueryLayer).toHaveAttribute('disabled', '');
    const presentInLayerControl = await viewer.evaluate((v) => {
      let lc = v._layerControl;
      let layers = lc._layers.map((e) => e.layer._layerEl);
      let noInitialQueryLayer = v.querySelector('[data-testid=no-initial-mq]');
      return layers.some((e) => e === noInitialQueryLayer);
    });
    expect(presentInLayerControl).toBe(false);
  });
  test(`A layer disabled due to mq would otherwise be enabled is \
enabled and added to the layer control when mq removed`, async () => {
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await expect(noInitialQueryLayer).toHaveAttribute(
      'media',
      '(0 <= map-zoom <=3)'
    );
    await expect(noInitialQueryLayer).toHaveAttribute('disabled', '');
    await noInitialQueryLayer.evaluate((l) => l.removeAttribute('media'));
    await expect(noInitialQueryLayer).not.toHaveAttribute('disabled', '');
    const presentInLayerControl = await viewer.evaluate((v) => {
      let lc = v._layerControl;
      let layers = lc._layers.map((e) => e.layer._layerEl);
      let noInitialQueryLayer = v.querySelector('[data-testid=no-initial-mq]');
      return layers.some((e) => e === noInitialQueryLayer);
    });
    expect(presentInLayerControl).toBe(true);
  });
  test(`An empty media query is the same as no media query`, async () => {
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await noInitialQueryLayer.evaluate((l) => l.setAttribute('media', ' '));
    await expect(noInitialQueryLayer).not.toHaveAttribute('disabled', '');
  });
  test(`An invalid media query is the same as a non-matching media query`, async () => {
    const noInitialQueryLayer = page.getByTestId('no-initial-mq');
    await noInitialQueryLayer.evaluate((l) => l.setAttribute('media', '(foo '));
    // Wait for the invalid media query to trigger the disabled attribute
    await expect(noInitialQueryLayer).toHaveAttribute('disabled', '', {
      timeout: 2000
    });
  });
});
