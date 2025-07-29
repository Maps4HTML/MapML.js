import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Layer Context Menu Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('layerContextMenu.html');
    await page.waitForTimeout(250);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Layer context menu shows when layer is clicked', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const cbmtLayer = await page.getByText('CBMT - INLINE');
    cbmtLayer.click({ button: 'right' });

    await page.waitForTimeout(500);
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

    expect(menuDisplay).toEqual('block');
    await page.keyboard.press('Escape');
  });

  test('Layer context menu copy layer', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const cbmtLayer = await page.getByText('CBMT - INLINE');
    await cbmtLayer.click({ button: 'right' });
    await page.keyboard.press('l');
    const mesageLayerArea = page.getByTestId('messageLayer');
    await mesageLayerArea.focus();
    await page.keyboard.press('Control+v');
    const copyLayer = await mesageLayerArea.evaluate((text) => text.value);
    expect(copyLayer).toEqual(
      `<map-layer label="CBMT - INLINE" checked="">
      <map-link rel="license" title="Testing Inc."></map-link>
      <map-extent units="CBMTILE" checked="">
        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
        <map-link rel="tile" tref="http://localhost:30001/data/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
      </map-extent>
    </map-layer>`
    );
  });

  test('Map zooms in to layer 2', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const layer2 = page.getByText('Layer 2');
    await layer2.click({ button: 'right', force: true });

    await page.keyboard.press('z');
    await page.waitForTimeout(1000);
    const mapZoom = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer.zoom);
    expect(mapZoom).toEqual(11);
    const mapLocation = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.getPixelBounds());
    expect(mapLocation).toEqual({
      max: { x: 43380, y: 43130 },
      min: { x: 42380, y: 42630 }
    });
  });

  test('Map zooms out to layer 3', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const layer3 = page.getByText('Layer 3');
    await layer3.click({ button: 'right', force: true });

    await page.keyboard.press('z');
    await page.waitForTimeout(3000);
    const mapLocation = await page.$eval('body > mapml-viewer', (text) =>
      text._map.getPixelBounds()
    );

    const mapZoom = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer.zoom);
    expect(mapZoom).toEqual(11);

    expect(mapLocation).toEqual({
      max: { x: 43380, y: 43557 },
      min: { x: 42380, y: 43057 }
    });
  });

  test('Map zooms out to layer 4', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const layer4 = page.getByText('Layer 4');
    await layer4.click({ button: 'right', force: true });

    await page.keyboard.press('z');
    await page.waitForTimeout(3000);
    const mapLocation = await page.$eval('body > mapml-viewer', (text) =>
      text._map.getPixelBounds()
    );

    const mapZoom = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer.zoom);
    expect(mapZoom).toEqual(5);
    expect(mapLocation).toEqual({
      max: { x: 8334, y: 8084 },
      min: { x: 7334, y: 7584 }
    });
  });

  test('Copy layer with relative src attribute', async () => {
    await page.reload();
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    const pseudotsuga = await layerControl.getByText('Genus Pseudotsuga');
    await pseudotsuga.click({ button: 'right' });

    await page.keyboard.press('l');
    const mesageLayerArea = page.getByTestId('messageLayer');
    await mesageLayerArea.focus();
    // reload is better than deleting text, because of cross-platform issue
    // with copy-pasting text on Windows/Linux
    //    await page.keyboard.press('Control+a');
    //    await page.keyboard.press('Backspace');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(1000);
    const copyLayer = await mesageLayerArea.evaluate((text) => text.value);

    expect(copyLayer).toEqual(
      '<map-layer src="http://localhost:30001/data/query/DouglasFir" label="Natural Resources Canada - Douglas Fir (Genus Pseudotsuga) 250m resolution"></map-layer>'
    );
  });

  test('Map Extent context menu shows when extent layer is right clicked', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    await page
      .getByRole('group', { name: 'CBMT - INLINE' })
      .getByTitle('Layer Settings', { exact: true })
      .click();
    await page
      .getByRole('group', { name: 'Sub-layer' })
      .locator('label')
      .click({
        button: 'right'
      });

    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.querySelector('.mapml-contextmenu.mapml-extent-menu'),
      nextHandle
    );

    const menuDisplay = await (
      await page.evaluateHandle(
        (elem) => window.getComputedStyle(elem).getPropertyValue('display'),
        resultHandle
      )
    ).jsonValue();

    expect(menuDisplay).toEqual('block');
    await page.keyboard.press('Escape');
  });

  test('Layer context menu - copy extent layer', async () => {
    await page
      .getByRole('group', { name: 'Sub-layer' })
      .locator('label')
      .click({
        button: 'right'
      });

    await page.keyboard.press('l');
    const mesageLayerArea = page.getByTestId('messageLayer');
    await mesageLayerArea.focus();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+v');
    const copyLayer = await mesageLayerArea.evaluate((text) => text.value);

    expect(copyLayer).toEqual(
      '<map-extent units="CBMTILE" checked="">\n        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>\n        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>\n        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>\n        <map-link rel="tile" tref="http://localhost:30001/data/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>\n      </map-extent>'
    );
  });

  test('Map zooms to extent layer', async () => {
    const layerControl = page.locator('.leaflet-control-layers');
    await layerControl.hover();
    await page
      .getByRole('group', { name: 'Sub-layer' })
      .locator('label')
      .click({
        button: 'right'
      });
    await page.keyboard.press('z');
    await page.waitForTimeout(1000);
    const mapZoom = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer.zoom);
    expect(mapZoom).toEqual(0);
    const mapLocation = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.getPixelBounds());
    expect(mapLocation).toEqual({
      max: { x: 1374, y: 1177 },
      min: { x: 374, y: 677 }
    });
  });
});
