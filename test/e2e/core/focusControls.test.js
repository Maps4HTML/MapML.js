import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Keyboard Navigation + Query Layer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('focusControls.html');
    await page.waitForTimeout(1000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Focus Controls button after query focuses the zoom in control', async () => {
    await page.getByTestId('viewer').click();
    await page.getByTitle('Focus Controls').click();
    await expect(page.getByTitle('Zoom in')).toBeFocused();
  });
});
