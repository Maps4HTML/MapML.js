import { test, expect, chromium } from '@playwright/test';

test.describe('Announce movement test', () => {
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

  test('Output values are correct during zoom in', async () => {
    // focus the map
    await page.keyboard.press('Tab');
    // focus the zoom in control
    await page.keyboard.press('Tab');
    // activate zoom in -> zoom = 1
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    // activate zoom in -> zoom = 2
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // screen reader output is slow...
    const output = page.locator('.mapml-screen-reader-output-scale');
    const movedUp = await output.evaluate((output) => output.innerHTML);
    expect(movedUp).toEqual('2.1 centimeters to 1000 kilometers');

    // go to zoom = 3
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const movedUpAgain = await output.evaluate((output) => output.innerHTML);
    // zoom = 3
    expect(movedUpAgain).toEqual('1.7 centimeters to 500 kilometers');
  });

  test('Output values are correct during zoom out', async () => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // screen reader output is slow...
    const output = page.locator('.mapml-screen-reader-output-scale');
    const movedUp = await output.evaluate((output) => output.innerHTML);
    expect(movedUp).toEqual('2.1 centimeters to 1000 kilometers');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const movedUpAgain = await output.evaluate((output) => output.innerHTML);
    // zoom is now = 0
    expect(movedUpAgain).toEqual('2.6 centimeters to 2000 kilometers');
  });
});
