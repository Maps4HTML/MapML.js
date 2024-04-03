import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright TemplatedMapMLTile Layer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('templatedMapMLTileLayer.html');
    await page.waitForTimeout(500);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Test that ONLY tiles spanning the layer extent are loaded and rendered', async () => {
    const templatedMapLink = page.getByTestId('templated-link');
    const renderedTilesCount = await templatedMapLink.evaluate((l) => {
      return l._templatedLayer._container.querySelectorAll('svg').length;
    });
    expect(renderedTilesCount).toEqual(2);
  });
});
