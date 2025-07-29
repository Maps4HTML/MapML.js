import { test, expect, chromium } from '@playwright/test';

test.describe('Tests to confirm that content cannot be recursively loaded', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page = await context.newPage();
    await page.goto('templatedFeaturesOrTiles.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('Contents of features-tiles-extents.mapml copied to map-layer shadow root', async () => {
    await page.waitForTimeout(500);
    const layer = page.getByTestId('test-layer');
    const featuresTilesAndExtentCopied = await layer.evaluate(
      (l) =>
        l.shadowRoot.querySelectorAll('map-feature, map-tile, map-extent')
          .length === 6
    );
    expect(featuresTilesAndExtentCopied).toBe(true);
  });
  test('Contents of features-tiles-extents.mapml SELECTIVELY copied to map-link shadow root', async () => {
    const mapLinks = await page.getByTestId('test-link').all();
    expect(mapLinks.length).toBe(1);
    const mapLink = page.getByTestId('test-link');
    const featuresAndTilesCopied = await mapLink.evaluate(
      (l) => l.shadowRoot.querySelectorAll('map-feature, map-tile').length === 5
    );
    expect(featuresAndTilesCopied).toBe(true);
  });
});
