import { test, expect, chromium } from '@playwright/test';

test.describe('Feature Index Overlay test', () => {
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
    const afterFullscreenReticle = page.locator('#map1 .mapml-feature-index-box');
    expect(await afterFullscreenReticle.isHidden()).toBe(false);
    
    const afterFullscreenOutput = page.locator('#map1 output.mapml-feature-index');
    expect(await afterFullscreenOutput.evaluate(
        o => o.classList.contains('mapml-screen-reader-output')
    )).toBe(false);
    await page.locator('#map1').getByTitle('Exit Fullscreen').click();
  });
  test('Feature index overlay and reticle show on reload', async () => {
    await page.keyboard.press('ArrowRight');
    await page.locator('#map1').getByTitle('Reload').click();
    const afterReloadReticle = page.locator('#map1 .mapml-feature-index-box');
    expect(await afterReloadReticle.isHidden()).toBe(false);
    
    const afterReloadOutput = page.locator('#map1 output.mapml-feature-index');
    expect(await afterReloadOutput.evaluate(
        o => o.classList.contains('mapml-screen-reader-output')
    )).toBe(false);
    
  });
  test('Feature index overlay and reticle show on history-based navigation', async () => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift+F10');
    await page.locator('#map1').getByText('Back').click();
    await page.keyboard.press('Shift+F10');
    await page.locator('#map1').getByText('Back').click();
    const afterHistoryNavReticle = page.locator('#map1 .mapml-feature-index-box');
    expect(await afterHistoryNavReticle.isHidden()).toBe(false);
    
    const afterHistoryNavOutput = page.locator('#map1 output.mapml-feature-index');
    expect(await afterHistoryNavOutput.evaluate(
        o => o.classList.contains('mapml-screen-reader-output')
    )).toBe(false);
    await page.locator('#map1').getByTitle('Reload').click();
  });
  test.only('Feature index overlay and reticle show after following a link', async () => {
    await page.locator('#map3').scrollIntoViewIfNeeded();
    
    //const feature = page.locator('#linkedfeature').click({force: true});
    
  });
  test('Feature index content is correct', async () => {
    const spanCount = await page.$eval(
      'div > output.mapml-feature-index > span',
      (span) => span.childElementCount
    );
    const firstFeature = await page.$eval(
      'div > output.mapml-feature-index > span > span:nth-child(1)',
      (span) => span.innerText
    );
    const moreResults = await page.$eval(
      'div > output.mapml-feature-index > span > span:nth-child(8)',
      (span) => span.innerText
    );

    expect(spanCount).toEqual(8);
    expect(firstFeature).toContain('1 Vermont');
    expect(moreResults).toContain('9 More results');
  });

  test('Feature index more results are correct', async () => {
    await page.keyboard.press('9');
    await page.waitForTimeout(500);

    const spanCount = await page.$eval(
      'div > output.mapml-feature-index > span',
      (span) => span.childElementCount
    );
    const firstFeature = await page.$eval(
      'div > output.mapml-feature-index > span > span:nth-child(1)',
      (span) => span.innerText
    );
    const prevResults = await page.$eval(
      'div > output.mapml-feature-index > span > span:nth-child(5)',
      (span) => span.innerText
    );

    expect(spanCount).toEqual(5);
    expect(firstFeature).toContain('1 Pennsylvania');
    expect(prevResults).toContain('8 Previous results');
  });

  test('Feature index previous results are correct', async () => {
    await page.keyboard.press('8');
    const spanCount = await page.$eval(
      'div > output.mapml-feature-index > span',
      (span) => span.childElementCount
    );

    expect(spanCount).toEqual(8);
  });

  test('Feature index content is correct on moveend', async () => {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    const spanCount = await page.$eval(
      'div > output.mapml-feature-index > span',
      (span) => span.childElementCount
    );
    const firstFeature = await page.$eval(
      'div > output.mapml-feature-index > span > span:nth-child(1)',
      (span) => span.innerText
    );

    expect(spanCount).toEqual(2);
    expect(firstFeature).toContain('1 Maine');
  });

  test('Feature index message for "No features found", reticle still visible', async () => {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(1000);

    const overlayVisible = await page.$eval(
      'div > output.mapml-feature-index',
      (output) => !output.classList.contains('mapml-screen-reader-output')
    );
    const reticleVisible = await page.$eval(
      'div > div.mapml-feature-index-box',
      (div) => !div.hasAttribute('hidden')
    );
    const message = await page.$eval(
      '.mapml-feature-index-content > span',
      (message) => message.textContent
    );

    expect(overlayVisible).toEqual(true);
    expect(reticleVisible).toEqual(true);
    expect(message).toEqual('No features found');
  });

  test('Popup test with templated features', async () => {
    await page.mouse.click(10, 600);
    await page.waitForTimeout(500);
    await page.focus('#map2 > div');
    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Control+ArrowUp');
    await page.waitForTimeout(1000);

    await page.keyboard.press('1');
    await page.waitForTimeout(500);

    const popupCount = await page.$eval(
      '#map2 > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popup) => popup.childElementCount
    );
    const popupName = await page.$eval(
      '#map2 > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popup) => popup.children[0].innerText
    );

    expect(popupCount).toEqual(1);
    expect(popupName).toContain('Hareg Cafe & Variety');
  });

  test('Opening another popup with index keys closes already open popup', async () => {
    await page.keyboard.press('2');
    await page.waitForTimeout(500);

    const popupCount = await page.$eval(
      '#map2 > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popup) => popup.childElementCount
    );
    const popupName = await page.$eval(
      '#map2 > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
      (popup) => popup.children[0].innerText
    );
    const overlay = await page.$eval(
      '#map2 > div > output.mapml-feature-index',
      (output) => output.classList.contains('mapml-screen-reader-output')
    );

    expect(popupCount).toEqual(1);
    expect(popupName).toContain('Banditos');
    expect(overlay).toEqual(false);
  });
});
