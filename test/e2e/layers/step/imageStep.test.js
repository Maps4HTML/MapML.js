import { test, expect, chromium } from '@playwright/test';

const request = require('./request');

test.describe('Templated image layer with step', () => {
  request.test(
    'step/templatedImageLayerStep.html',
    0,
    1,
    0,
    0,
    '/images/toporama_en.jpg',
    '-5537023.0124460235,-2392385.4881043136,5972375.006350018,3362313.521293707&m4h=t',
    '',
    '-968982.6263652518,-107703.83540767431,1412272.136144273,1082923.545847088&m4h=t',
    '',
    '',
    1,
    '-968982.6263652518,257421.89484378695,1412272.136144273,1448049.2760985494&m4h=t'
  );
  test.describe('', () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page =
        context.pages().find((page) => page.url() === 'about:blank') ||
        (await context.newPage());
      await page.goto('step/templatedImageLayerStep.html');
    });
    test.afterAll(async function () {
      await context.close();
    });

    let selector =
      '.leaflet-layer.mapml-extentlayer-container > div > img:last-child';
    test('Scale layer on add', async () => {
      await page.reload();
      await page.waitForTimeout(500);
      const transform = await page.$eval(
        selector,
        (img) => img.style.transform
      );
      expect(transform).toEqual(
        'translate3d(-106px, -53px, 0px) scale(1.70588)'
      );
    });

    test('Shift zooming from level 1 -> 4 requests and scales level 3', async () => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+Equal');
      await page.waitForTimeout(1000);
      const transform = await page.$eval(
        selector,
        (img) => img.style.transform
      );
      const url = await page.$eval(selector, (img) => img.src);
      expect(transform).toEqual(
        'translate3d(-107px, -54px, 0px) scale(1.71429)'
      );
      expect(url).toContain(
        '-968982.6263652518,-107703.83540767431,1412272.136144273,1082923.545847088&m4h=t'
      );
    });

    /*
      The resetting mentioned below would make it look like the map zoomed out before panning since the
      scaled layer's css scale transform would be removed and there would be enough time to see it before the new
      layer is added.
      https://github.com/Maps4HTML/MapML.js/commit/8df7c993276e719bb30c4f55a8966289d4c918b7
      */
    test('Overlay to remove does not reset its transform on shift pan when on a scaled layer', async () => {
      await page.keyboard.press('Shift+ArrowUp');
      let unscaleOnShiftPan;
      try {
        unscaleOnShiftPan = await page.waitForFunction(
          () =>
            document
              .querySelector('body > mapml-viewer')
              .shadowRoot.querySelector(
                '.leaflet-layer.mapml-extentlayer-container > div > img'
              ).style.transform === 'translate3d(0px, 0px, 0px)',
          {},
          { timeout: 1000 }
        );
      } catch (e) {}
      expect(unscaleOnShiftPan).toEqual(undefined);
    });
  });
});
