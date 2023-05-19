import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Query Link Tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('queryLink.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Query Popup Tests', () => {
    test('Query link shows when within bounds', async () => {
      await page.click('div');
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
      );
      const popupNum = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );
      expect(popupNum).toEqual(1);
    });

    test('Query link closes previous popup when new query made within bounds', async () => {
      await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer').zoomTo(9, -27, 0)
      );
      await page.waitForTimeout(1000);
      await page.click('div');
      await page.waitForTimeout(500);
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
      );
      const popupNum = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );
      expect(popupNum).toEqual(1);
    });

    test('Query link does not show when out of bounds', async () => {
      await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer').zoomTo(-37.07821, -9.010487, 0)
      );
      await page.waitForTimeout(1000);
      await page.click('div');
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div',
        { state: 'hidden' }
      );
      const popupNumRight = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );

      await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer').zoomTo(-45.679787, -93.041053, 0)
      );
      await page.waitForTimeout(1000);
      await page.click('div');
      await page.waitForTimeout(1000);
      const popupNumBottom = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );

      await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer').zoomTo(-37.399782, 177.15222, 0)
      );
      await page.waitForTimeout(1000);
      await page.click('div');
      await page.waitForTimeout(1000);
      const popupNumLeft = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );

      await page.evaluateHandle(() =>
        document.querySelector('mapml-viewer').zoomTo(-32.240953, 94.969783, 0)
      );
      await page.waitForTimeout(1000);
      await page.click('div');
      await page.waitForTimeout(1000);
      const popupNumTop = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane',
        (div) => div.childElementCount
      );

      expect(popupNumRight).toEqual(0);
      expect(popupNumBottom).toEqual(0);
      expect(popupNumLeft).toEqual(0);
      expect(popupNumTop).toEqual(0);
    });
  });
  test.describe('Queried Feature Tests', () => {
    test('First feature added + popup content updated', async () => {
      await page.click(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button'
      );
      await page.click('div');
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );
      const href = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > a.mapml-zoom-link',
        (link) => link.getAttribute('href')
      );

      expect(feature).toEqual(
        'M259 279L263 279L264 281L265 285L266 286L266 287L266 287L267 287L266 288L266 288L266 288L266 289L266 290L267 291L266 291L260 292L260 293L260 293L260 294L261 294L260 294L260 294L259 294L259 293L259 293L259 294L259 294L258 294L257 289L257 283L257 280L257 280L259 279z'
      );
      expect(popup).toEqual('Alabama');
      expect(href).toEqual('#6,32.62418749999957,-86.6801555');

      const featureCount = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.children.length`
      );
      expect(featureCount).toEqual(1);
      const property = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.querySelector('map-properties').innerText.trim()`
      );
      expect(property).toEqual('Alabama');
    });

    test('Next feature added + popup content updated ', async () => {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );
      const href = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > a.mapml-zoom-link',
        (link) => link.getAttribute('href')
      );

      expect(feature).toEqual(
        'M205 271L201 288L196 287L193 285L187 280L187 280L188 280L188 279L188 279L188 279L188 278L189 277L189 277L189 276L189 276L190 276L190 275L190 275L190 274L190 273L190 273L190 273L190 272L190 271L191 270L191 270L192 270L192 270L192 270L193 267L201 270L205 271z'
      );
      expect(popup).toEqual('Arizona');
      expect(href).toEqual('#0,34.168684499999635,-111.9288505');

      const featureCount = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.children.length`
      );
      expect(featureCount).toEqual(1);
      const property = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.querySelector('map-properties').innerText.trim()`
      );
      expect(property).toEqual('Arizona');
    });

    test('Previous feature added + popup content updated ', async () => {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );
      const href = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > a.mapml-zoom-link',
        (link) => link.getAttribute('href')
      );

      expect(feature).toEqual(
        'M259 279L263 279L264 281L265 285L266 286L266 287L266 287L267 287L266 288L266 288L266 288L266 289L266 290L267 291L266 291L260 292L260 293L260 293L260 294L261 294L260 294L260 294L259 294L259 293L259 293L259 294L259 294L258 294L257 289L257 283L257 280L257 280L259 279z'
      );
      expect(popup).toEqual('Alabama');
      expect(href).toEqual('#6,32.62418749999957,-86.6801555');

      const featureCount = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.children.length`
      );
      expect(featureCount).toEqual(1);
      const property = await page.evaluate(
        `document.querySelector('mapml-viewer > layer- > map-extent').shadowRoot.querySelector('map-properties').innerText.trim()`
      );
      expect(property).toEqual('Alabama');
    });

    test('PCRS feature added + popup content updated ', async () => {
      for (let i = 0; i < 2; i++)
        await page.click(
          'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
        );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );

      expect(feature).toEqual('M246 332L232 207L138 232L156 307z');
      expect(popup).toEqual('PCRS Test');
    });

    test('TCRS feature added + popup content updated ', async () => {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );

      expect(feature).toEqual('M292 285L352 287L355 321L307 315z');
      expect(popup).toEqual('TCRS Test');
    });

    test('Tilematrix feature added + popup content updated ', async () => {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path',
        (tile) => tile.getAttribute('d')
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );

      expect(feature).toEqual('M307 185L395 185L395 273L307 273z');
      expect(popup).toEqual('TILEMATRIX Test');
    });
    test('Synthesized point, valid location ', async () => {
      await page.click(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)'
      );
      const feature = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g',
        (g) => (g.firstElementChild ? g.firstElementChild : false)
      );
      const popup = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe',
        (iframe) => iframe.contentWindow.document.querySelector('h1').innerText
      );
      const link = await page.$eval(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div',
        (popup) => popup.querySelector('a.mapml-zoom-link')
      );

      expect(feature).toBeFalsy();
      expect(popup).toEqual('No Geometry');
      expect(link).toBeFalsy();
    });

    test("'Zoom to here' link test", async () => {
      await page.reload();
      await page.waitForTimeout(200);

      const startTopLeft = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.topLeft.pcrs`
      );
      const startBottomRight = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.bottomRight.pcrs`
      );
      const startZoomLevel = await page.evaluate(
        `document.querySelector('mapml-viewer').zoom`
      );
      expect(startTopLeft.horizontal).toBe(-9181665.718398102);
      expect(startTopLeft.vertical).toBe(9155377.19075438);
      expect(startBottomRight.horizontal).toBe(10000664.312928632);
      expect(startBottomRight.vertical).toBe(-10026952.84057235);
      expect(startZoomLevel).toBe('0');

      await page.click('div');
      await page.waitForSelector(
        'div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div'
      );
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // tab into the "zoom to here" link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // zoom to here link closes popup
      const popupCount = await page.evaluate(
        `document.querySelector("mapml-viewer").shadowRoot.querySelector(".leaflet-popup-pane").childElementCount`
      );
      expect(popupCount).toBe(0);

      const endTopLeft = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.topLeft.pcrs`
      );
      const endBottomRight = await page.evaluate(
        `document.querySelector('mapml-viewer').extent.bottomRight.pcrs`
      );
      const endZoomLevel = await page.evaluate(
        `document.querySelector('mapml-viewer').zoom`
      );
      expect(endTopLeft.horizontal).toBe(448657.7089154199);
      expect(endTopLeft.vertical).toBe(-1444381.5087630227);
      expect(endBottomRight.horizontal).toBe(1242409.2964185923);
      expect(endBottomRight.vertical).toBe(-2238133.096266195);
      expect(endZoomLevel).toBe('6');
    });
  });
});
