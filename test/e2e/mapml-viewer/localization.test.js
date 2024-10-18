import { test, expect, chromium } from '@playwright/test';

test.describe('<mapml-viewer> localization tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('localization.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('', async () => {});
});
