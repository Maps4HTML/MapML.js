import { test, expect, chromium } from '@playwright/test';

test.describe('Mixed Layer Z-Index Rendering Tests', () => {
  let page;
  let context;

  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mixedLayer.html');
  });

  test('baseline rendering - red map-extent over green inline tiles and features', async () => {
    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');

    await expect(viewer).toHaveScreenshot('mixedLayer-baseline.png', {
      maxDiffPixels: 50
    });

    // Verify that the red map-extent is checked and rendering
    const redExtent = await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      return {
        checked: mapExtents[0]?.checked,
        label: mapExtents[0]?.getAttribute('label')
      };
    });

    expect(redExtent.checked).toBe(true);
    expect(redExtent.label).toBe('map-extent red tiles');
  });

  test('map-extent unchecked state shows underlying green tiles', async () => {
    // Uncheck the red map-extent to reveal green inline tiles
    await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      if (mapExtents[0]) {
        mapExtents[0].checked = false;
      }
    });
    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');

    await expect(viewer).toHaveScreenshot('mixedLayer-red-unchecked.png', {
      maxDiffPixels: 50
    });

    // Verify the red extent is now unchecked
    const redExtentChecked = await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      return mapExtents[0]?.checked;
    });

    expect(redExtentChecked).toBe(false);
  });

  test('blue map-extent renders over all other content when checked', async () => {
    // Check the blue image map-extent
    await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      if (mapExtents[1]) {
        mapExtents[1].checked = true;
      }
    });
    await page.waitForTimeout(500);

    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot('mixedLayer-blue-checked.png', {
      maxDiffPixels: 50
    });

    // Verify the blue extent is checked
    const blueExtent = await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      return {
        checked: mapExtents[1]?.checked,
        label: mapExtents[1]?.getAttribute('label')
      };
    });

    expect(blueExtent.checked).toBe(true);
    expect(blueExtent.label).toBe('map-extent blue image');
  });

  test('DOM order change affects z-index rendering', async () => {
    // Reset to testable state
    await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      if (mapExtents[0]) mapExtents[0].checked = true; // red tiles
      if (mapExtents[1]) mapExtents[1].checked = false; // blue image
    });

    // Move first map-extent after first map-feature to test DOM ordering impact
    await page.evaluate(() => {
      const mapExtents = document.querySelectorAll('map-extent');
      const mapFeatures = document.querySelectorAll('map-feature');

      if (mapExtents[0] && mapFeatures[0]) {
        const firstFeature = mapFeatures[0];
        const firstExtent = mapExtents[0];

        // Insert the map-extent after the first map-feature
        firstFeature.parentNode.insertBefore(
          firstExtent,
          firstFeature.nextSibling
        );
      }
    });
    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot('mixedLayer-dom-reordered.png', {
      maxDiffPixels: 50
    });
  });

  test('feature data maintains correct z-index order when layer is checked', async () => {
    // Reset to baseline state
    await page.reload();

    // Wait for features to be loaded and rendered
    await page.waitForTimeout(1000);

    // Verify features exist in DOM
    const featuresCount = await page.evaluate(() => {
      return document.querySelectorAll('map-feature').length;
    });

    // At least one feature should exist
    expect(featuresCount).toBeGreaterThan(0);

    await page.waitForTimeout(500);

    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot('mixedLayer-features-baseline.png', {
      maxDiffPixels: 50
    });
  });

  test('z-index values follow correct hierarchy', async () => {
    // Test that DOM elements exist and can be properly layered
    const elementCounts = await page.evaluate(() => {
      const mapExtents = Array.from(document.querySelectorAll('map-extent'));
      const inlineTiles = Array.from(
        document.querySelectorAll('map-tile')
      ).filter((tile) => !tile.closest('map-extent'));
      const mapFeatures = Array.from(document.querySelectorAll('map-feature'));

      return {
        extentCount: mapExtents.length,
        tileCount: inlineTiles.length,
        featureCount: mapFeatures.length,
        checkedExtents: mapExtents.filter((e) => e.checked).length
      };
    });

    // Validate that we have the expected elements
    expect(elementCounts.extentCount).toBe(2);
    expect(elementCounts.tileCount).toBeGreaterThan(0);
    expect(elementCounts.featureCount).toBeGreaterThan(0);
    expect(elementCounts.checkedExtents).toBeGreaterThan(0);

    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot(
      'mixedLayer-hierarchy-validation.png',
      {
        maxDiffPixels: 50
      }
    );
  });

  test.afterAll(async () => {
    await context.close();
  });
});
