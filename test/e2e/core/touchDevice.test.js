import { test, expect, chromium, devices } from '@playwright/test';
const device = devices['Pixel 5'];

test.describe('Playwright touch device tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    // the test must be run in headless mode
    // to successfully emulate a touch device with mouse disabled
    context = await chromium.launchPersistentContext('', {
      hasTouch: true
    });
    page = await context.newPage({
      ...device
    });
    await page.goto('layerContextMenu.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Tap/Long press to show layer control', async () => {
    // possibly useful for debugging CI problems
    // const isCI = process.env.CI === 'true'; // GitHub Actions sets CI=true
    const layerControl = await page.locator('.leaflet-control-layers');
    await layerControl.tap();
    // does not pass on linux
    //  await expect(layerControl).toHaveClass(/leaflet-control-layers-expanded/);
    await expect(layerControl).toHaveJSProperty('_isExpanded', true);

    // expect the opacity setting not open after the click
    let opacity = await page.$eval(
      '.leaflet-control-layers-overlays > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button:nth-child(2)',
      (btn) => btn.getAttribute('aria-expanded')
    );
    expect(opacity).toEqual('false');

    const viewer = await page.locator('mapml-viewer');
    // tap on the map to dismiss the layer control
    await viewer.tap({ position: { x: 150, y: 150 } });
    // tap on the lc to expand it
    await layerControl.tap();
    // long press on layercontrol does not dismiss it
    await layerControl.tap({ delay: 800 });
    // does not pass on linux
    //await expect(layerControl).toHaveClass(/leaflet-control-layers-expanded/);
    await expect(layerControl).toHaveJSProperty('_isExpanded', true);

    // expect the layer context menu to NOT show after the long press
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.querySelector('.mapml-contextmenu.mapml-layer-menu'),
      nextHandle
    );
    const menuDisplay = await (
      await page.evaluateHandle(
        (elem) => window.getComputedStyle(elem).getPropertyValue('display'),
        resultHandle
      )
    ).jsonValue();
    expect(menuDisplay).toEqual('none');
  });
});
