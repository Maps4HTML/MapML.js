import { test, expect, chromium } from '@playwright/test';

test.describe('Templated features cleanup test', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('renderer.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Templated <map-link rel="features"> renderer cleans up after itself', async () => {
    await page.waitForTimeout(1000);
    const link = page.getByTestId('test-link');
    let svgCount = await link.evaluate(
      (l) => l._templatedLayer._container.querySelectorAll('svg').length
    );
    const viewer = page.getByTestId('map');
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom in').click();
    await page.getByLabel('Zoom in').click();
    await page.waitForTimeout(1000);
    svgCount = await link.evaluate(
      (l) => l._templatedLayer._container.querySelectorAll('svg').length
    );
    expect(svgCount).toEqual(1);
    await page.getByLabel('Interactive map').press('ArrowLeft');
    await page.getByLabel('Interactive map').press('ArrowLeft');
    await page.getByLabel('Interactive map').press('ArrowLeft');
    await page.getByLabel('Reload').click();
    await page.waitForTimeout(1000);
    svgCount = await link.evaluate(
      (l) => l._templatedLayer._container.querySelectorAll('svg').length
    );
    expect(svgCount).toEqual(1);
  });
});
