import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Checked Attribute Tests', () => {
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

  test('Check attribute removed', async () => {
    await page.$eval('body > mapml-viewer > map-layer', (layer) =>
      layer.removeAttribute('checked')
    );
    await page.hover(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right'
    );
    const layerController = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input',
      (controller) => controller.checked
    );

    expect(layerController).toEqual(false);
  });
  test('Check attribute added', async () => {
    await page.$eval('body > mapml-viewer > map-layer', (layer) =>
      layer.setAttribute('checked', '')
    );
    const layerController = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > label > input',
      (controller) => controller.checked
    );

    expect(layerController).toEqual(true);
  });

  test.describe('Hidden attribute tests', () => {
    test('Control panel hidden when no layers/all layers hidden', async () => {
      await page.$eval('body > mapml-viewer > map-layer', (layer) =>
        layer.setAttribute('hidden', '')
      );
      const controlsHidden = await page.$eval(
        'css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(true);
    });
    test('Control panel unhidden when at least one layer with no hidden attribute', async () => {
      await page.$eval('body > mapml-viewer > map-layer', (layer) =>
        layer.setAttribute('hidden', '')
      );
      // there's a single layer in the mapml-viewer.html page, so the layer control
      // should disappear (is hidden) when the last layer in it is hidden
      let controlsHidden = await page.$eval(
        'css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(true);
      // so far so good
      await page.$eval('body > mapml-viewer > map-layer', (layer) =>
        layer.removeAttribute('hidden')
      );
      controlsHidden = await page.$eval(
        'css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container >> .leaflet-control-layers.leaflet-control',
        (elem) => elem.hasAttribute('hidden')
      );
      expect(controlsHidden).toEqual(false);
    });
    //        test("[" + browserType + "]" + " Initial map element extent", async () => {
    //          await page.$eval("body > mapml-viewer > map-layer",
    //            (layer) => layer.setAttribute("checked", ""));
    //          const layerController = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > summary > div > label > input",
    //            (controller) => controller.checked);
    //
    //          expect(layerController).toEqual(true);
    //        });
  });

  test.describe('Disabled attributes test', () => {
    test('Setting disabled, attribute reset on update/move', async () => {
      const layer = page.getByTestId('testlayer');
      await layer.evaluate((l) => l.setAttribute('disabled', ''));
      const viewer = page.getByTestId('testviewer');
      await viewer.evaluate((map) => map.zoomTo(47, -92, 0));
      await page.waitForTimeout(500);
      await expect(layer).not.toHaveAttribute('disabled');
    });
  });

  test.describe('Opacity setters & getters test', () => {
    test('Setting opacity', async () => {
      await page.reload();
      const layer = page.getByTestId('testlayer');
      await layer.evaluate((layer) => layer.whenReady());
      await layer.evaluate((layer) => (layer.opacity = 0.4));
      let value = await layer.evaluate(
        (layer) =>
          layer._layerControlHTML.querySelector('input[type=range]').value
      );
      expect(value).toEqual('0.4');
    });

    test('Getting appropriate opacity', async () => {
      const layer = page.getByTestId('testlayer');
      let value = await layer.evaluate((layer) => layer.opacity);
      expect(value).toEqual(0.4);
    });
  });
});
