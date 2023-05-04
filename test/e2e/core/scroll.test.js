import { test, expect, chromium } from '@playwright/test';

test.describe('Scroll test', () => {
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

  test('Scrolling the map does not scroll the document', async () => {
    //Force the windows scroll bar to appear
    await page.$eval('body > textarea', (textarea) =>
      textarea.setAttribute('cols', 200)
    );
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    const scrollX = await page.evaluate('window.scrollX');
    expect(scrollX).toEqual(0);
  });
});
