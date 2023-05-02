import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Keyboard Navigation + Query Layer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('featureNavigation.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Arrow Key Navigable Tests', () => {
    test('Tab focuses inline features', async () => {
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      const aHandle = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nextHandle = await page.evaluateHandle(
        (doc) => doc.shadowRoot,
        aHandle
      );
      const resultHandle = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nextHandle
      );
      const focused = await (
        await page.evaluateHandle(
          (elem) => elem.getAttribute('d'),
          resultHandle
        )
      ).jsonValue();
      expect(focused).toEqual('M330 83L586 83L586 339L330 339z');

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);

      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      const aHandleNext = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nextHandleNext = await page.evaluateHandle(
        (doc) => doc.shadowRoot,
        aHandleNext
      );
      const resultHandleNext = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nextHandleNext
      );
      const focusedNext = await (
        await page.evaluateHandle(
          (elem) => elem.getAttribute('d'),
          resultHandleNext
        )
      ).jsonValue();

      let tooltipCountNext = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );

      expect(tooltipCountNext).toEqual(1);
      expect(focusedNext).toEqual('M285 373L460 380L468 477L329 459z');
    });

    test('Tab focuses fetched features', async () => {
      await page.evaluateHandle(() =>
        document.getElementById('vector').setAttribute('checked', '')
      );
      await page.click('body');
      await page.keyboard.press('Tab'); // focus the map

      await page.keyboard.press('Tab'); // Vermont (features are sorted by distance from map centre)
      await page.keyboard.press('ArrowDown'); // New York
      await page.keyboard.press('ArrowDown'); // New Hampshire
      await page.keyboard.press('ArrowDown'); // Massachusetts
      const aHandle = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nextHandle = await page.evaluateHandle(
        (doc) => doc.shadowRoot,
        aHandle
      );
      const focused = await page.evaluate(
        (root) => root.activeElement.getAttribute('aria-label').trim(),
        nextHandle
      );
      expect(focused).toEqual('Massachusetts');

      await page.keyboard.press('ArrowDown');
      const focusedNext = await page.evaluate(
        (root) => root.activeElement.getAttribute('aria-label').trim(),
        nextHandle
      );

      expect(focusedNext).toEqual('Connecticut'); // spelling error https://en.wikipedia.org/wiki/Caractacus_Pott
    });

    test('When at last feature, arrow down goes to first feature', async () => {
      await page.goto('templatedFeaturesFilter.html');
      await page.waitForTimeout(1000);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
      }

      const activeFeature = await page.$eval('body > mapml-viewer', (map) =>
        map.shadowRoot.activeElement.getAttribute('aria-label')
      );

      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      const nextActiveFeature = await page.$eval('body > mapml-viewer', (map) =>
        map.shadowRoot.activeElement.getAttribute('aria-label')
      );

      await expect(activeFeature).toEqual('Hung Sum Restaurant');
      await expect(nextActiveFeature).toEqual('Sushi 88');
    });

    test('Center feature is always refocused', async () => {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');

      const activeFeature = await page.$eval('body > mapml-viewer', (map) =>
        map.shadowRoot.activeElement.getAttribute('aria-label')
      );
      await expect(activeFeature).toEqual('Sushi 88');
    });
  });
});
