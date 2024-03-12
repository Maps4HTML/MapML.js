import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Keyboard Navigation + Query Layer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('popupTabNavigation.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Feature Popup Tab Navigation Tests', () => {
    test('Inline features popup focus order', async () => {
      await page.evaluateHandle(() =>
        document.getElementById('vector').removeAttribute('checked')
      );
      await page.evaluateHandle(() =>
        document.getElementById('query').removeAttribute('checked')
      );
      const body = page.locator('body');
      await body.click();
      await page.keyboard.press('Tab'); // focus map

      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Enter'); // display popup with link in it
      const viewer = page.locator('mapml-viewer');
      let f = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.className
      );
      expect(f).toEqual('mapml-popup-content');

      await page.keyboard.press('Tab'); // focus link
      let f2 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.tagName
      );
      expect(f2.toUpperCase()).toEqual('A');

      await page.keyboard.press('Tab'); // focus on "zoom to here" link
      let f3 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.tagName
      );
      expect(f3.toUpperCase()).toEqual('A');

      await page.keyboard.press('Tab'); // focus on |< affordance
      let f4 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.title
      );
      expect(f4).toEqual('Focus Map');

      await page.keyboard.press('Tab'); // focus on < affordance
      let f5 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.title
      );
      expect(f5).toEqual('Previous Feature');

      await page.keyboard.press('Tab'); // focus on > affordance
      let f6 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.title
      );
      expect(f6).toEqual('Next Feature');

      await page.keyboard.press('Tab'); // focus on >| affordance
      let f7 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.title
      );
      expect(f7).toEqual('Focus Controls');

      await page.keyboard.press('Tab'); // focus on X dismiss popup affordance
      let f8 = await viewer.evaluate(
        (viewer) => viewer.shadowRoot.activeElement.className
      );
      expect(f8).toEqual('leaflet-popup-close-button');
    });

    test('Tab to next feature after tabbing out of popup', async () => {
      await page.keyboard.press('Escape'); // focus back on feature
      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();
      expect(f).toEqual('M330 83L586 83L586 339L330 339z');
      await page.waitForTimeout(500);
      // that we have to do this to get the tooltip back is a bug #681
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );

      expect(tooltipCount).toEqual(1);
    });

    test('Shift + Tab to current feature while popup open', async () => {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual('M330 83L586 83L586 339L330 339z');
    });

    test('Previous feature button focuses previous feature', async () => {
      await page.keyboard.press('ArrowDown'); // focus next feature
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // popup
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus < affordance (previous feature)
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // focus should fall on previous feature
      await page.waitForTimeout(500);
      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual('M330 83L586 83L586 339L330 339z');
    });

    test('Tooltip appears after pressing esc key', async () => {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await page.keyboard.down('Escape'); // focus back on feature
      await page.keyboard.up('Escape');
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
      expect(f).toEqual('M330 83L586 83L586 339L330 339z');
    });

    test('Tooltip appears after pressing enter on close button', async () => {
      await page.keyboard.press('Enter'); // focus back into popup
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // focus on x button
      await page.keyboard.down('Enter'); // press x button
      await page.keyboard.up('Enter');
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
      expect(f).toEqual('M330 83L586 83L586 339L330 339z');
    });

    test('Next feature button focuses next feature', async () => {
      await page.keyboard.press('Enter'); // popup with link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus < affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus > affordance (next feature)
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // focus falls on next feature
      const h = await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer')
      );
      const nh = await page.evaluateHandle((doc) => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(
        (root) => root.activeElement.querySelector('.leaflet-interactive'),
        nh
      );
      const f = await (
        await page.evaluateHandle((elem) => elem.getAttribute('d'), rh)
      ).jsonValue();

      let tooltipCount = await page.$eval(
        'mapml-viewer .leaflet-tooltip-pane',
        (div) => div.childElementCount
      );

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual('M285 373L460 380L468 477L329 459z');
    });

    test('Focus Controls focuses the first <button> child in control div', async () => {
      await page.waitForTimeout(1000);
      const viewer = page.locator('mapml-viewer');
      await viewer.click();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.click('body > mapml-viewer');
      await page.keyboard.press('Shift+F10');
      await page.keyboard.press('t');
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      let f = await page.$eval(
        'body > mapml-viewer',
        (viewer) => viewer.shadowRoot.activeElement.innerHTML
      );
      expect(f).toEqual('Maps for HTML Community Group');
    });

    test('Zoom link zooms to the zoom level = zoom attribute', async () => {
      const body = page.locator('body');
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Enter'); // display popup with link in it
      await page.keyboard.press('Tab'); // focus link
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      const zoom = await page.$eval(
        'body > mapml-viewer',
        (map) => +map.getAttribute('zoom')
      );
      expect(zoom).toEqual(2);
    });

    test('Zoom link zooms to the maximum zoom level that can show the feature completely when zoom attribute does not present', async () => {
      const body = page.locator('body');
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // zoom out
      await page.waitForTimeout(200);
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowLeft'); // focus targeted feature
      await page.keyboard.press('Enter'); // display popup with link in it
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      const zoom = await page.$eval(
        'body > mapml-viewer',
        (map) => +map.getAttribute('zoom')
      );
      expect(zoom).toEqual(2);
    });
  });
});
