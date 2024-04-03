import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });
  test("Ensure page doesn't throw errors", async () => {
    await page.goto('handleChange-bug.html');
    // check for error messages in console
    let errorLogs = [];
    await page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    // remove the layer, re-add it, should log the error
    const map = page.getByTestId('viewer');
    await map.evaluate((m) => {
      let l = m.querySelector('[data-testid=problem-layer]');
      let lyrHTML = l.outerHTML;
      l.remove();
      // this should throw, get handled and counted by our errorLogs array
      m.insertAdjacentHTML('afterbegin', lyrHTML);
    });
    // fail if error messages in console
    expect(errorLogs.length).toBe(0);
  });
});
