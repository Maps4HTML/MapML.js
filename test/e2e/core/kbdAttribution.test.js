import { test, expect, chromium } from '@playwright/test';

test.describe('Keyboard shortcut attribution test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapml-viewer.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Keyboard shortcuts attribution opens up dialog', async () => {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const dialog = await page.$eval(
      'body > mapml-viewer div > dialog',
      (dialog) => dialog.hasAttribute('open')
    );

    expect(dialog).toBe(true);
  });

  test('X button closes dialog', async () => {
    await page.keyboard.press('Enter');
    const dialog = await page.$eval(
      'body > mapml-viewer div > dialog',
      (dialog) => dialog.hasAttribute('open')
    );
    expect(dialog).toBe(false);
  });
});
