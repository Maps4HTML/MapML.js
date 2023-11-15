import { test, expect, chromium } from '@playwright/test';

test.use({
  geolocation: { longitude: -75.705278, latitude: 45.397778 },
  permissions: ['geolocation']
});

test.describe('Feature Index Overlay Focus tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      slowMo: 250
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('featureIndexOverlay.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Feature index overlay and reticle shows on focus', async () => {
    const hiddenOverlay = await page.$eval(
      'div > output.mapml-feature-index',
      (output) => output.classList.contains('mapml-screen-reader-output')
    );
    const hiddenReticle = await page.$eval(
      'div > div.mapml-feature-index-box',
      (div) => div.hasAttribute('hidden')
    );

    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    const afterTabOverlay = await page.$eval(
      'div > output.mapml-feature-index',
      (output) => output.classList.contains('mapml-screen-reader-output')
    );
    const afterTabReticle = await page.$eval(
      'div > div.mapml-feature-index-box',
      (div) => div.hasAttribute('hidden')
    );

    expect(hiddenOverlay).toEqual(true);
    expect(hiddenReticle).toEqual(true);
    expect(afterTabOverlay).toEqual(false);
    expect(afterTabReticle).toEqual(false);
  });
  test('Feature index overlay and reticle show on fullscreen', async () => {
    await page.locator('#map1').getByTitle('View Fullscreen').click();
    const afterFullscreenReticle = page.locator(
      '#map1 .mapml-feature-index-box'
    );
    expect(await afterFullscreenReticle.isHidden()).toBe(false);

    const afterFullscreenOutput = page.locator(
      '#map1 output.mapml-feature-index'
    );
    expect(
      await afterFullscreenOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);
    await page.locator('#map1').getByTitle('Exit Fullscreen').click();
  });
  test('Feature index overlay and reticle show on reload', async () => {
    await page.keyboard.press('ArrowRight');
    await page.locator('#map1').getByTitle('Reload').click();
    const afterReloadReticle = page.locator('#map1 .mapml-feature-index-box');
    expect(await afterReloadReticle.isHidden()).toBe(false);

    const afterReloadOutput = page.locator('#map1 output.mapml-feature-index');
    expect(
      await afterReloadOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);
  });
  test('Feature index overlay and reticle show on history-based navigation', async () => {
    await page.locator('#map1').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift+F10');
    await page.locator('#map1').getByText('Back').click();
    await page.keyboard.press('Shift+F10');
    await page.locator('#map1').getByText('Back').click();
    const afterHistoryNavReticle = await page.locator(
      '#map1 .mapml-feature-index-box'
    );
    expect(await afterHistoryNavReticle.isHidden()).toBe(false);
    const afterHistoryNavOutput = page.locator(
      '#map1 output.mapml-feature-index'
    );
    expect(
      await afterHistoryNavOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);
    //await page.locator('#map1').getByTitle('Reload').click();
  });
  test('Feature index overlay and reticle show on geolocation activation, deactivation', async () => {
    await page
      .locator('#map3')
      .getByTitle('Show my location - location tracking off')
      .click();
    const afterGeolocationStartReticle = page.locator(
      '#map3 .mapml-feature-index-box'
    );
    expect(await afterGeolocationStartReticle.isHidden()).toBe(false);

    const afterGeolocationStartOutput = page.locator(
      '#map3 output.mapml-feature-index'
    );
    expect(
      await afterGeolocationStartOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);

    await page
      .locator('#map3')
      .getByTitle('Show my location - location tracking on')
      .click();
    const afterGeolocationStopReticle = page.locator(
      '#map3 .mapml-feature-index-box'
    );
    expect(await afterGeolocationStopReticle.isHidden()).toBe(false);

    const afterGeolocationStopOutput = page.locator(
      '#map3 output.mapml-feature-index'
    );
    expect(
      await afterGeolocationStopOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);
    await page.locator('#map3').getByTitle('Reload').click();
  });
  test('Feature index overlay and reticle show after following a link', async () => {
    await page.locator('#map3').click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const afterFollowingLinkReticle = page.locator(
      '#map3 .mapml-feature-index-box'
    );
    expect(await afterFollowingLinkReticle.isHidden()).toBe(false);

    const afterFollowingLinkOutput = page.locator(
      '#map3 output.mapml-feature-index'
    );
    expect(
      await afterFollowingLinkOutput.evaluate((o) =>
        o.classList.contains('mapml-screen-reader-output')
      )
    ).toBe(false);
    await page.locator('#map3').getByTitle('Reload').click();
  });
});
