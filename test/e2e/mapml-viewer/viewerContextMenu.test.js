import { test, expect, chromium } from '@playwright/test';

//expected topLeft values in the different cs, at the different
//positions the map goes in
let expectedPCRS = [
  { horizontal: -9373489.01871137, vertical: 11303798.154262971 },
  { horizontal: -5059449.140631609, vertical: 10388337.990009308 }
];
let expectedGCRS = [
  { horizontal: -128.07848522325827, vertical: -3.3883427348651636 },
  { horizontal: -131.75138842058425, vertical: 18.07246131233218 }
];
let expectedFirstTileMatrix = [
  { horizontal: 2.57421875, vertical: 2.8515625 },
  { horizontal: 3.0134698275862073, vertical: 2.944773706896552 }
];
let expectedFirstTCRS = [
  { horizontal: 659, vertical: 730 },
  { horizontal: 771.4482758620691, vertical: 753.8620689655173 }
];

// expected extent top-left and bottom-right value at different zoom levels (0 and 1)
let expectedExtentPCRS_0 = [
  { horizontal: -9373489, vertical: 11303798 },
  { horizontal: 9808841, vertical: -11714998 }
];
let expectedExtentPCRS_1 = [
  { horizontal: -5396794, vertical: 6520122 },
  { horizontal: 5848021, vertical: -6973655 }
];

test.describe('Playwright mapml-viewer Context Menu (and api) Tests', () => {
  let page;
  let context;
  let currExtCS, currLocCS;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('mapml-viewer.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Context menu focus on keyboard shortcut', async () => {
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.outerText,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('View fullscreen (F)');
  });

  test('Context menu tab goes to next item', async () => {
    await page.keyboard.press('Tab');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.outerText,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('Copy (C)');
  });

  test('Context menu shift + tab goes to previous item', async () => {
    await page.keyboard.press('Shift+Tab');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.outerText,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('View fullscreen (F)');
  });

  test('Submenu opens on C with focus on first item', async () => {
    await page.keyboard.press('c');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.outerText,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('Map');
  });

  test('Context menu displaying on map', async () => {
    await page.click('body > mapml-viewer', { button: 'right' });
    const contextMenu = await page.$eval(
      'div > div.mapml-contextmenu',
      (menu) => window.getComputedStyle(menu).getPropertyValue('display')
    );
    expect(contextMenu).toEqual('block');
  });
  test('Context menu, back item', async () => {
    await page.$eval('body > mapml-viewer', (map) => map.zoomTo(81, -63, 1));
    await page.waitForTimeout(1000);
    await page.click('body > mapml-viewer', { button: 'right' });
    await page.click('div > div.mapml-contextmenu > button:nth-child(1)');
    await page.waitForTimeout(1000);
    const extent = await page.$eval('body > mapml-viewer', (map) => map.extent);

    expect(extent.projection).toEqual('CBMTILE');
    expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
    expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
    expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
  });
  test('Context menu, back and reload item at initial location disabled', async () => {
    await page.click('body > mapml-viewer', { button: 'right' });
    const backBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(1)',
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(2)',
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(3)',
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(true);
    expect(fwdBtn).toEqual(false);
    expect(reloadBtn).toEqual(true);
  });
  test('Context menu, forward item', async () => {
    await page.click('body > mapml-viewer', { button: 'right' });
    await page.click('div > div.mapml-contextmenu > button:nth-child(2)');
    await page.waitForTimeout(1000);
    const extent = await page.$eval('body > mapml-viewer', (map) => map.extent);

    expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
    expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
    expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
  });
  test('Context menu, forward item at most recent location disabled', async () => {
    await page.click('body > mapml-viewer', { button: 'right' });
    const backBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(1)',
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(2)',
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(3)',
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(false);
    expect(fwdBtn).toEqual(true);
    expect(reloadBtn).toEqual(false);
  });

  test.describe('Context Menu, Toggle Controls ', () => {
    test('Context menu, toggle controls off', async () => {
      let zoomHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-zoom',
        (div) => div.hidden
      );
      let reloadHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .mapml-reload-button',
        (div) => div.hidden
      );
      let fullscreenHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-fullscreen',
        (div) => div.hidden
      );
      let layerControlHidden = await page.$eval(
        '.leaflet-top.leaflet-right > .leaflet-control-layers',
        (div) => div.hidden
      );
      expect(zoomHidden).toEqual(false);
      expect(reloadHidden).toEqual(false);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(false);

      await page.click('body > mapml-viewer', { button: 'right' });
      await page.click('div > div.mapml-contextmenu > button:nth-of-type(7)');

      zoomHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-zoom',
        (div) => div.hidden
      );
      reloadHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .mapml-reload-button',
        (div) => div.hidden
      );
      fullscreenHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-fullscreen',
        (div) => div.hidden
      );
      layerControlHidden = await page.$eval(
        '.leaflet-top.leaflet-right > .leaflet-control-layers',
        (div) => div.hidden
      );
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);
    });

    test('Context menu, toggle controls on', async () => {
      let zoomHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-zoom',
        (div) => div.hidden
      );
      let reloadHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .mapml-reload-button',
        (div) => div.hidden
      );
      let fullscreenHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-fullscreen',
        (div) => div.hidden
      );
      let layerControlHidden = await page.$eval(
        '.leaflet-top.leaflet-right > .leaflet-control-layers',
        (div) => div.hidden
      );
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);

      await page.click('body > mapml-viewer', { button: 'right' });
      await page.click('div > div.mapml-contextmenu > button:nth-of-type(7)');

      zoomHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-zoom',
        (div) => div.hidden
      );
      reloadHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .mapml-reload-button',
        (div) => div.hidden
      );
      fullscreenHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .leaflet-control-fullscreen',
        (div) => div.hidden
      );
      layerControlHidden = await page.$eval(
        '.leaflet-top.leaflet-right > .leaflet-control-layers',
        (div) => div.hidden
      );
      expect(zoomHidden).toEqual(false);
      expect(reloadHidden).toEqual(false);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(false);
    });

    test('Context menu, toggle controls after changing opacity', async () => {
      await page.hover(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div'
      );
      await page.click(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)',
        (div) => (div.open = true)
      );
      await page.$eval(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details',
        (div) => (div.open = true)
      );
      await page.click(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input'
      );
      const valueBefore = await page.$eval(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input',
        (opacity) => opacity.value
      );
      expect(valueBefore).toEqual('0.5');

      await page.click('body > mapml-viewer', { button: 'right' });
      await page.click('div > div.mapml-contextmenu > button:nth-child(6)');
      await page.click('body > mapml-viewer', { button: 'right' });
      await page.click('div > div.mapml-contextmenu > button:nth-child(6)');

      const valueAfter = await page.$eval(
        'div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input',
        (opacity) => opacity.value
      );

      expect(valueAfter).toEqual('0.5');
    });
  });

  test('Submenu, copy map (MapML)', async () => {
    await page.reload();
    const viewer = page.getByTestId('testviewer');
    // have to wait for whenLayersReady because the extent sprouts implicit attributes
    // from properties that are set by default
    await viewer.evaluate((viewer) => viewer.whenLayersReady());
    await viewer.click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.click('body > textarea#coord');
    await page.keyboard.press('Control+v');
    const copyValue = await page.$eval(
      'body > textarea#coord',
      (text) => text.value
    );
    const expected = `<mapml-viewer data-testid="testviewer" style="height: 600px;width:500px;" projection="CBMTILE" zoom="0" lat="47" lon="-92" controls="" role="application">
    <map-layer data-testid="testlayer" label="CBMT - INLINE" checked="">
      <map-meta name="zoom" content="min=0,max=25"></map-meta>
      <map-extent units="CBMTILE" checked="" hidden="">
        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
        <map-link rel="tile" tref="/data/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
      </map-extent>
    </map-layer>
  </mapml-viewer>`;
    expect(copyValue).toEqual(expected);
    await page.locator('body > textarea#coord').fill('');
  });

  test('Submenu, copy extent with zoom level = 0', async () => {
    currExtCS = await page.$eval(
      'body > mapml-viewer',
      (map) => map._map.contextMenu.defExtCS
    );
    // set cs to pcrs for copying extent test
    await page.$eval('body > mapml-viewer', (map) => {
      map._map.contextMenu.defExtCS = 'pcrs';
    });
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.click('body > textarea#coord');
    await page.keyboard.press('Control+v');
    const copyValue = await page.$eval(
      'body > textarea#coord',
      (text) => text.value
    );
    const expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_0[0].horizontal}, top-left-northing=${expectedExtentPCRS_0[0].vertical}, bottom-right-easting=${expectedExtentPCRS_0[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_0[1].vertical}"></map-meta>`;
    expect(copyValue).toEqual(expected);
    await page.locator('body > textarea#coord').fill('');
  });

  test('Submenu, copy extent with zoom level = 1', async () => {
    // zoom in
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.click('body > textarea#coord');
    await page.keyboard.press('Control+v');
    const copyValue = await page.$eval(
      'body > textarea#coord',
      (text) => text.value
    );
    const expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_1[0].horizontal}, top-left-northing=${expectedExtentPCRS_1[0].vertical}, bottom-right-easting=${expectedExtentPCRS_1[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_1[1].vertical}"></map-meta>`;
    expect(copyValue).toEqual(expected);
    await page.locator('body > textarea#coord').fill('');
    await page.$eval(
      'body > mapml-viewer',
      (map, currExtCS) => {
        map._map.contextMenu.defExtCS = currExtCS;
      },
      currExtCS
    );
  });

  test('Submenu, copy mapml-viewer location in gcrs (default) coordinates', async () => {
    // set cs to pcrs for copying location test
    await page.$eval('body > mapml-viewer', (map) => {
      map._map.contextMenu.defLocCS = 'gcrs';
    });
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.click('body > textarea#coord');
    await page.keyboard.press('Control+v');
    const copyValue = await page.$eval(
      'body > textarea#coord',
      (text) => text.value
    );
    const expected = `<map-feature zoom="1">
        <map-featurecaption>Copied CBMTILE gcrs location</map-featurecaption>
        <map-properties>
            <h2>Copied CBMTILE gcrs location</h2>
            <div style="text-align:center">-92.062002 46.922393</div>
        </map-properties>
        <map-geometry cs="gcrs">
          <map-point>
            <map-coordinates>-92.062002 46.922393</map-coordinates>
          </map-point>
        </map-geometry>
      </map-feature>`;
    expect(copyValue).toEqual(expected);
    await page.locator('body > textarea#coord').fill('');
    await page.$eval(
      'body > mapml-viewer',
      (map, currLocCS) => {
        map._map.contextMenu.defLocCS = currLocCS;
      },
      currLocCS
    );
  });
  test('Paste map-feature to mapml-viewer', async () => {
    currLocCS = await page.$eval(
      'body > mapml-viewer',
      (map) => map._map.contextMenu.defLocCS
    );
    // set cs to pcrs for copying location test
    await page.$eval('body > mapml-viewer', (map) => {
      map._map.contextMenu.defLocCS = 'gcrs';
    });
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('p');

    const layerLabel = await page.$eval(
      'body > mapml-viewer',
      (map) => map.layers[1].label
    );
    expect(layerLabel).toEqual('Pasted Layer');
    // clean up
    await page.$eval('body > mapml-viewer', (map) =>
      map.removeChild(map.querySelector('[label="Pasted Layer"]'))
    );
  });
  // other cs not implemented yet: tile,map,
  test('Submenu, copy location in tilematrix coordinates, which is not implemented, so faked with gcrs', async () => {
    // set the copy location coordinate system to the not-implemented tilematrix
    await page.$eval('body > mapml-viewer', (map) => {
      map._map.contextMenu.defLocCS = 'tilematrix';
      // ContextMenu.js double-checks the value of defLocCS against the
      // M.options.defaultLocCoor when the context menu is shown,
      // so have to ensure it has the value we want to test against.
      M.options.defaultLocCoor = 'tilematrix';
    });

    await page.click('body > mapml-viewer');
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.click('body > textarea#coord');
    await page.keyboard.press('Control+v');
    const copyValue = await page.$eval(
      'body > textarea#coord',
      (text) => text.value
    );
    const expected = `<map-feature zoom="1">
        <map-featurecaption>Copied CBMTILE tilematrix location (not implemented yet)</map-featurecaption>
        <map-properties>
            <h2>Copied CBMTILE tilematrix location (not implemented yet)</h2>
            <div style="text-align:center">6 6</div>
        </map-properties>
        <map-geometry cs="gcrs">
          <map-point>
            <map-coordinates>-92.062002 46.922393</map-coordinates>
          </map-point>
        </map-geometry>
      </map-feature>`;
    expect(copyValue).toEqual(expected);
    await page.locator('body > textarea#coord').fill('');
    await page.$eval(
      'body > mapml-viewer',
      (map, currLocCS) => {
        map._map.contextMenu.defLocCS = currLocCS;
      },
      currLocCS
    );
  });
  test('Context menu, All buttons enabled when fwd and back history present', async () => {
    await page.click('body > mapml-viewer');
    await page.$eval('body > mapml-viewer', (map) => map.zoomTo(81, -63, 3));
    await page.waitForTimeout(1000);
    await page.$eval('body > mapml-viewer', (map) => map.zoomTo(81, -63, 5));
    await page.waitForTimeout(1000);
    await page.click('body > mapml-viewer', { button: 'right' });
    await page.click('div > div.mapml-contextmenu > button:nth-child(1)');
    await page.click('body > mapml-viewer', { button: 'right' });
    const backBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(1)',
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(2)',
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(3)',
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(false);
    expect(fwdBtn).toEqual(false);
    expect(reloadBtn).toEqual(false);
  });

  test('Context menu, click at margin and move mouse out when submenu is visible', async () => {
    // click at the right-bottom margin of map
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(200);
    await page.click('body > mapml-viewer', {
      button: 'right',
      position: { x: 495, y: 550 }
    });
    const contextMenu = await page
      .locator('div > div.mapml-contextmenu')
      .first();
    expect(await contextMenu.isVisible()).toBeTruthy();
    const mapSize = await page.$eval('body > mapml-viewer', (map) => {
      return { x: map.width, y: map.height };
    });
    const contextMenuSize = await page.$eval(
      'div > div.mapml-contextmenu',
      (menu) => {
        return {
          x: menu.offsetWidth + menu.getBoundingClientRect().left,
          y: menu.offsetHeight + menu.getBoundingClientRect().top
        };
      }
    );
    expect(
      contextMenuSize.x <= mapSize.x && contextMenuSize.y <= mapSize.y
    ).toBeTruthy();

    // move the mouse from "copy" to another button in the main contextmenu
    await page.hover('div > div.mapml-contextmenu > button:nth-of-type(5)');
    const submenu = await page.locator('div > div#mapml-copy-submenu').first();
    expect(await submenu.isVisible()).toBeTruthy();
    await page.hover('div > div.mapml-contextmenu > button:nth-of-type(6)');
    expect(await submenu.isHidden()).toBeTruthy();
  });

  test('Layer Context menu, Pressing enter on contextmenu focuses on checkbox element', async () => {
    await page.click('body > mapml-viewer');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    await page.keyboard.press('Enter');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.nodeName,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('INPUT');
  });

  test('Layer Context menu, Opening contextmenu focuses on first layer contextmenu', async () => {
    await page.keyboard.press('Shift+F10');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.outerText,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('Zoom To Layer (Z)');
  });

  test('Layer Context menu, escaping from the contextmenu takes you back to the checkbox element', async () => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    const aHandle = await page.evaluateHandle(() =>
      document.querySelector('mapml-viewer')
    );
    const nextHandle = await page.evaluateHandle(
      (doc) => doc.shadowRoot,
      aHandle
    );
    const resultHandle = await page.evaluateHandle(
      (root) => root.activeElement,
      nextHandle
    );
    const nameHandle = await page.evaluateHandle(
      (name) => name.nodeName,
      resultHandle
    );
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual('INPUT');
  });

  test('Layer Context menu, Pressing space on checkbox button toggles layer', async () => {
    await page.keyboard.press('Space');
    const layerCheck = await page.$eval('body > mapml-viewer', (map) => {
      return map.layers[0].checked;
    });
    expect(layerCheck).toEqual(false);
  });

  test('Checking Context Menu Items Names In Order', async () => {
    let back = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(1)',
      (btn) => btn.textContent
    );
    expect(back).toEqual('Back (Alt+Left Arrow)');
    let forward = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(2)',
      (btn) => btn.textContent
    );
    expect(forward).toEqual('Forward (Alt+Right Arrow)');
    let reload = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(3)',
      (btn) => btn.textContent
    );
    expect(reload).toEqual('Reload (Ctrl+R)');
    let fullScreen = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(4)',
      (btn) => btn.textContent
    );
    expect(fullScreen).toEqual('View fullscreen (F)');
    let copy = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(6)',
      (btn) => btn.textContent
    );
    expect(copy).toEqual('Copy (C)');
    let paste = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(8)',
      (btn) => btn.textContent
    );
    expect(paste).toEqual('Paste (P)');
    let controls = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(10)',
      (btn) => btn.textContent
    );
    expect(controls).toEqual('Toggle Controls (T)');
    let debug = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(11)',
      (btn) => btn.textContent
    );
    expect(debug).toEqual('Toggle Debug Mode (D)');
    let source = await page.$eval(
      'div > div.mapml-contextmenu > button:nth-child(12)',
      (btn) => btn.textContent
    );
    expect(source).toEqual('View Map Source (V)');
    try {
      await page.$eval(
        'div > div.mapml-contextmenu > button:nth-child(13)',
        (btn) => btn.textContent
      );
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        expect.stringContaining(
          'page.$eval: Failed to find element matching selector'
        )
      );
    }
    let copySubMenu1 = await page.$eval(
      'div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(1)',
      (btn) => btn.textContent
    );
    expect(copySubMenu1).toEqual('Map');
    let copySubMenu2 = await page.$eval(
      'div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(2)',
      (btn) => btn.textContent
    );
    expect(copySubMenu2).toEqual('Extent');
    let copySubMenu3 = await page.$eval(
      'div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(3)',
      (btn) => btn.textContent
    );
    expect(copySubMenu3).toEqual('Location');
  });
});
