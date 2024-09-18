import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright mapml-viewer issue-980 test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapml-viewer-unknown-projection.html');
    await page.waitForTimeout(500);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('mapml-viewer projection set to unknown prj errors to console', async () => {
    let message;
    page.on('pageerror', (exception) => (message = exception.message));
    const viewer = page.getByTestId('testviewer');
    await viewer.evaluate((v) => (v.projection = 'unknown'));
    // update the projection attribute on the viewer
    await page.waitForTimeout(6000);
    expect(message).toBe('Undefined projection: unknown');
  });
});
