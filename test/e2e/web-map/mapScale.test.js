import { test, expect, chromium } from '@playwright/test';

test.describe('Announce movement test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Output values are correct during zoom in', async () => {
    // focus the map
    await page.keyboard.press('Tab');
    // focus the zoom in control
    await page.keyboard.press('Tab');
    // activate zoom in -> zoom = 3
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    // activate zoom in -> zoom = 4
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // screen reader output is slow...
    const output = page.locator('.mapml-screen-reader-output-scale');
    const movedUp = await output.evaluate((output) => output.innerHTML);
    // zoom = 4 here (different start conditions that mapml-viewer.html)
    expect(movedUp).toEqual('1.7 centimeters to 300 kilometers');

    // nothing happens here because the zoom in is disabled...
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const movedUpAgain = await output.evaluate((output) => output.innerHTML);
    // zoom = 4 still
    expect(movedUpAgain).toEqual('1.7 centimeters to 300 kilometers');
  });

  test('Output values are correct during zoom out', async () => {
    await page.pause();
    // focus the zoom out control
    await page.keyboard.press('Tab');
    // go back to zoom = 3
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // screen reader output is slow...
    const output = page.locator('.mapml-screen-reader-output-scale');
    const movedUp = await output.evaluate((output) => output.innerHTML);
    expect(movedUp).toEqual('1.7 centimeters to 500 kilometers');

    // go to zoom = 2
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const movedUpAgain = await output.evaluate((output) => output.innerHTML);
    // zoom is now = 2
    expect(movedUpAgain).toEqual('2 centimeters to 1000 kilometers');
  });
});
