import { test, expect, chromium } from '@playwright/test';

test.describe('map-feature rendering tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });
  test('Test for zingers', async ({ page }) => {
    await page.goto('render-bug.html');
    const viewer = page.getByTestId('viewer');
    await expect(viewer).toHaveScreenshot('no-zinger.png', {
      maxDiffPixels: 100
    });
  });
  test('removing a map-feature from DOM removes its rendering', async ({
    page
  }) => {
    await page.goto('static-features.html');
    // Wait for initial rendering
    await page.waitForTimeout(1000);
    const viewer = page.getByTestId('viewer');
    let nFeatures = await viewer.evaluate(
      (v) => v.querySelectorAll('map-feature').length
    );
    expect(nFeatures).toEqual(5);
    const f = page.locator('map-feature').first();
    const rendered = await f.evaluate((f) => {
      f._featureLayer._container.setAttribute(
        'data-testid',
        'test-feature-container'
      );
      f._groupEl.setAttribute('data-testid', 'test-feature-rendering');
      return f._groupEl.isConnected;
    });
    expect(rendered).toBe(true);
    await expect(page.getByTestId('test-feature-rendering')).toHaveCount(1);
    await expect(page.getByTestId('test-feature-container')).toHaveCount(1);
    await f.evaluate((f) => f.remove());
    await expect(page.getByTestId('test-feature-rendering')).toHaveCount(0);
    await expect(
      page
        .getByTestId('test-feature-container')
        .locator('g[aria-label="Feature"]')
    ).toHaveCount(4);
  });

  test('removing last map-feature in a sequence removes rendering container', async ({
    page
  }) => {
    await page.goto('static-features.html');
    // Wait for initial rendering
    await page.waitForTimeout(1000);
    const viewer = page.getByTestId('viewer');
    let nFeatures = await viewer.evaluate(
      (v) => v.querySelectorAll('map-feature').length
    );
    expect(nFeatures).toEqual(5);
    const containerConnected = await viewer.evaluate((v) => {
      v.querySelector('map-feature')._featureLayer._container.setAttribute(
        'data-testid',
        'test-feature-container'
      );
      return v.querySelector('map-feature')._featureLayer._container
        .isConnected;
    });
    expect(containerConnected).toBe(true);
    nFeatures = await viewer.evaluate((v) => {
      v.querySelectorAll('map-feature').forEach((el) => el.remove());
      return v.querySelectorAll('map-feature').length;
    });
    expect(nFeatures).toEqual(0);
    await expect(page.getByTestId('test-feature-container')).toHaveCount(0);
  });
});
