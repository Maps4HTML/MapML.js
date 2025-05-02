import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright templatedPMTilesLayer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Test rendered data', async ({ page }) => {
    await page.goto('templatedPMTilesMVTLayer.html');
    await page.waitForTimeout(1000);
    const viewer = page.getByTestId('viewer');
    // seems like a lot of pixels to allow to be different, but missing fonts
    // across instances can require the snapshots to tolerate differences
    // due to that
    await expect(viewer).toHaveScreenshot('mvt-light.png', {
      maxDiffPixels: 1500
    });
    await viewer.evaluate((v) => v.zoomTo(0, 0, 2));
    await expect(viewer).toHaveScreenshot('mvt-light-z2.png', {
      maxDiffPixels: 1500
    });
    const lightLayer = page.getByTestId('light');
    await lightLayer.evaluate((l) => l.removeAttribute('checked'));
    await viewer.evaluate((v) => v.reload());

    await page.waitForTimeout(3000);
    const darkLayer = page.getByTestId('dark');
    await darkLayer.evaluate((l) => l.setAttribute('checked', 'checked'));
    await expect(viewer).toHaveScreenshot('pmtiles-dark.png', {
      maxDiffPixels: 1500
    });
    await darkLayer.evaluate((l) => l.zoomTo());
    await expect(viewer).toHaveScreenshot('pmtiles-dark-z10.png', {
      maxDiffPixels: 1500
    });
  });
  test('pmtilesStyles.js module not found console errors', async ({ page }) => {
    const messages = [];
    page.on('console', async (msg) => {
      for (const arg of msg.args()) messages.push(await arg.jsonValue());
    });
    await page.goto('templatedPMTilesMVTLayerMissingStyles.html');
    await page.waitForTimeout(1000);
    let errorLoadingModule = false;
    let errorFindingRules = false;
    for (const m of messages) {
      if (m.startsWith('Error importing pmtiles symbolizer rules or theme:'))
        errorLoadingModule = true;
      if (
        m.startsWith(
          'pmtiles symbolizer rules or theme not found for map-link@tref ->'
        )
      )
        errorFindingRules = true;
    }

    expect(errorLoadingModule).toBe(true);
    // code should not get into looking for the rules because the import has
    // failed
    expect(errorFindingRules).toBe(false);
    messages.length = 0;
    await page.goto('templatedPMTilesMVTLayerMissingRuleKey.html');
    await page.waitForTimeout(1000);
    errorLoadingModule = false;
    errorFindingRules = false;
    for (const m of messages) {
      if (m.startsWith('Error importing pmtiles symbolizer rules or theme:'))
        errorLoadingModule = true;
      if (
        m.startsWith(
          'pmtiles symbolizer rules or theme not found for map-link@tref ->'
        )
      )
        errorFindingRules = true;
    }
    expect(errorLoadingModule).toBe(false);
    expect(errorFindingRules).toBe(true);
  });
  test('A protomaps map-link in a non-OSMTILE map-extent is never enabled', async () => {
    await page.goto('templatedPMTilesCBMTILETest.html');
    await page.waitForTimeout(500);
    const viewer = page.getByTestId('viewer');
    const flexProjectionLayer = page.getByTestId('flexible-projection-layer');
    const fixedProjectionLayer = page.getByTestId('osmtile-only-layer');
    await expect(flexProjectionLayer).not.toHaveAttribute('disabled');
    await expect(fixedProjectionLayer).toHaveAttribute('disabled');
    await viewer.evaluate((v) => (v.projection = 'OSMTILE'));
    await page.waitForTimeout(500);
    // the flex projection layer will still be disabled because the pmtiles
    // layer lacks a stylesheet...
    await expect(flexProjectionLayer).toHaveAttribute('disabled');
    await expect(fixedProjectionLayer).not.toHaveAttribute('disabled');
  });
  test('A protomaps map-link, parent map-extent and ancestor map-layer are disabled when out of bounds', async ({
    page
  }) => {
    await page.goto('templatedPMTilesMVTLayer.html');
    await page.waitForTimeout(1000);
    const viewer = page.getByTestId('viewer');
    const lightLayer = page.getByTestId('light');
    const darkLayer = page.getByTestId('dark');
    await lightLayer.evaluate((l) => l.removeAttribute('checked'));
    await darkLayer.evaluate((l) => {
      l.checked = 'checked';
      l.zoomTo();
    });
    // at this point, the dark layer should be enabled
    await expect(darkLayer).not.toHaveAttribute('disabled');
    // move horizontally 2x the width of the extent, should make it not visible / disabled
    await darkLayer.evaluate((l) => {
      let w =
        l.extent.bottomRight.gcrs.horizontal - l.extent.topLeft.gcrs.horizontal;
      let h =
        l.extent.topLeft.gcrs.vertical - l.extent.bottomRight.gcrs.vertical;
      let cLat = l.extent.bottomRight.gcrs.vertical + h / 2;
      let cLon = l.extent.topLeft.gcrs.horizontal + w / 2;
      let z = l.parentElement.zoom;
      l.parentElement.zoomTo(cLat, cLon + w * 2, z);
    });
    await page.waitForTimeout(500);
    // at this point, the dark layer should be disabled
    await expect(darkLayer).toHaveAttribute('disabled');
  });
  test('A protomaps mvt map-link that has {z},{x},{y} variable names without associated map-inputs will not render', async ({
    page
  }) => {
    const messages = [];
    page.on('console', async (msg) => {
      for (const arg of msg.args()) messages.push(await arg.jsonValue());
    });
    await page.goto('templatedPMTilesMVTLayer.html');
    const viewer = page.getByTestId('viewer');
    const lightLayer = page.getByTestId('light');
    await lightLayer.evaluate((l) => l.removeAttribute('checked'));
    const darkLayer = page.getByTestId('dark');
    await darkLayer.evaluate((l) => l.removeAttribute('checked'));
    const hardCodedVariablesLayer = page.getByTestId('hard-coded-variables');
    await hardCodedVariablesLayer.evaluate((l) => (l.checked = true));
    await page.waitForTimeout(1000);
    await expect(viewer).toHaveScreenshot('mvt-blank.png', {
      maxDiffPixels: 100
    });
    let errorLoadingModule = false;
    let errorFindingRules = false;
    let errorNoZoomInput = false;
    let errorNoXInput = false;
    let errorNoYInput = false;
    for (const m of messages) {
      if (m.startsWith('Error importing pmtiles symbolizer rules or theme:'))
        errorLoadingModule = true;
      if (
        m.startsWith(
          'pmtiles symbolizer rules or theme not found for map-link@tref ->'
        )
      )
        errorFindingRules = true;
      if (
        m.startsWith(
          'input with name=z not found for template variable of same name'
        )
      )
        errorNoZoomInput = true;
      if (
        m.startsWith(
          'input with name=x not found for template variable of same name'
        )
      )
        errorNoXInput = true;
      if (
        m.startsWith(
          'input with name=y not found for template variable of same name'
        )
      )
        errorNoYInput = true;
    }
    // lack of rendering wasn't due to lack of styles
    expect(errorLoadingModule).toBe(false);
    expect(errorFindingRules).toBe(false);
    // errors on un-mapped template variables are the cause
    expect(errorNoZoomInput).toBe(true);
    expect(errorNoXInput).toBe(true);
    expect(errorNoYInput).toBe(true);
  });
  test('Custom pmtilesRules can render mvt data', async ({ page }) => {
    await page.goto('templatedPMTilesMVTLayerCustomStyles.html');
    await page.waitForTimeout(1000);
    const viewer = page.getByTestId('viewer');
    // seems like a lot of pixels to allow to be different, but missing fonts
    // across instances can require the snapshots to tolerate differences
    // due to that
    await expect(viewer).toHaveScreenshot('mvt-custom-spearfish.png', {
      maxDiffPixels: 100
    });
  });
});
