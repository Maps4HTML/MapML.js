import { test, expect, chromium } from '@playwright/test';

test.describe('web-map DOM API Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('domApi-web-map.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Create a web map with document.createElement(map)', async () => {
    // check for error messages in console
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    const mapHandle = await page.evaluateHandle(() =>
      document.createElement('map', { is: 'web-map' })
    );
    const nn = await (
      await page.evaluateHandle((map) => map.nodeName, mapHandle)
    ).jsonValue();
    expect(nn).toEqual('MAP');
    await page.evaluateHandle(
      (map) => map.setAttribute('is', 'web-map'),
      mapHandle
    );
    await page.evaluateHandle((map) => map.setAttribute('lat', 45), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute('lon', -90), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute('zoom', 2), mapHandle);
    await page.evaluateHandle(
      (map) => map.setAttribute('controls', ''),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('width', '600'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('height', '600'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('projection', 'CBMTILE'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => document.body.appendChild(map),
      mapHandle
    );
    const velName = await page.evaluate(
      () => document.body.querySelector('map').nodeName
    );
    expect(velName).toBe('MAP');
    // check for error messages in console
    expect(errorLogs.length).toBe(0);
    // testing to ensure web-map was successfully implemented
    let verifymap = await page.evaluate(
      (map) => document.body.querySelector('map').childElementCount
    );
    expect(verifymap).toBe(2);
    // the map, having 0 layers, should not have a layer control, despite the controls attribute
    const layerControlHidden = await page.$eval(
      'css=body > map>> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div',
      (elem) => elem.hasAttribute('hidden')
    );
    expect(layerControlHidden).toEqual(true);
  });

  test('Create a layer with document.createElement(map-layer)', async () => {
    const layerHandle = await page.evaluateHandle(() =>
      document.createElement('map-layer')
    );
    const nn = await (
      await page.evaluateHandle((map) => map.nodeName, layerHandle)
    ).jsonValue();
    expect(nn).toEqual('MAP-LAYER');
    await page.evaluateHandle(
      (layer) => layer.setAttribute('label', 'CBMT'),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => layer.setAttribute('src', 'tiles/cbmt/cbmt.mapml'),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => layer.setAttribute('checked', ''),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => document.querySelector('map').appendChild(layer),
      layerHandle
    );
    let layerControl = await page.locator('.leaflet-control-layers');
    await expect(layerControl).toBeVisible();

    // set the layer's hidden attribute, the layer should be removed from the layer
    // control (but not the map), which leaves 0 layers in the layer control, which means the
    // layer control should disappear
    await page.evaluateHandle(
      (layer) => layer.setAttribute('hidden', ''),
      layerHandle
    );
    await expect(layerControl).toBeHidden();

    // takes a couple of seconds for the tiles to load

    await page.waitForLoadState('networkidle');
    const layerVisible = await page.$eval(
      'body > map .leaflet-tile-loaded:nth-child(1)',
      (tileDiv) => tileDiv.firstChild.nodeName === 'IMG'
    );
    expect(layerVisible).toBe(true);
  });
  test('Remove map from DOM, add it back in', async () => {
    // check for error messages in console
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    // locators avoid flaky tests, allegedly
    const viewer = await page.locator('map');
    await viewer.evaluate(() => {
      let m = document.querySelector('map');
      document.body.removeChild(m);
      document.body.appendChild(m);
    });
    await viewer.evaluate((viewer) =>
      viewer.querySelector('map-layer').whenReady()
    );
    await page.waitForTimeout(250);
    expect(
      await viewer.evaluate(() => {
        let m = document.querySelector('map');
        let l = m.querySelector('map-layer');
        return l.label;
        // the label attribute is ignored if the mapml document has a map-title
        // element, which is the case here.  Since the layer loads over the
        // network, it means that the map is back to normal after being re-added
        /// to the DOM, if the label reads as follows:
      })
    ).toEqual('Canada Base Map - Transportation (CBMT)');
    // takes a couple of seconds for the tiles to load

    // check for error messages in console
    expect(errorLogs.length).toBe(0);

    await page.waitForLoadState('networkidle');
    const layerTile = await page.locator(
      'body > map .leaflet-tile-loaded:nth-child(1)'
    );
    expect(
      await layerTile.evaluate((tile) => tile.firstChild.nodeName === 'IMG')
    ).toBe(true);
  });

  test('Toggle all web map controls by adding or removing controls attribute', async () => {
    await page.evaluateHandle(() =>
      document.querySelector('map-layer').setAttribute('hidden', '')
    );
    await page.evaluateHandle(() =>
      document.querySelector('map-layer').removeAttribute('hidden')
    );

    const mapHandle = await page.evaluateHandle(() =>
      document.querySelector('map')
    );
    let hasControls = await page.evaluate(
      (map) => map.hasAttribute('controls'),
      mapHandle
    );
    expect(hasControls).toBe(true);

    await page.evaluate((map) => map.removeAttribute('controls'), mapHandle);
    hasControls = await page.evaluate(
      (map) => map.hasAttribute('controls'),
      mapHandle
    );
    expect(hasControls).toBe(false);

    // ALL the controls displayed on the map should have disappeared
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
    let scaleHidden = await page.$eval(
      '.leaflet-bottom.leaflet-left > .mapml-control-scale',
      (div) => div.hidden
    );
    let geolocation = await page.$eval(
      '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
      (div) => div.hidden
    );
    expect(geolocation).toEqual(true);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    expect(layerControlHidden).toEqual(true);
    expect(scaleHidden).toEqual(true);
  });

  test('Removing layer removes layer control', async () => {
    const mapHandle = await page.evaluateHandle(() =>
      document.querySelector('map')
    );
    await page.evaluate((map) => map.setAttribute('controls', ''), mapHandle);
    let hasControls = await page.evaluate(
      (map) => map.hasAttribute('controls'),
      mapHandle
    );
    expect(hasControls).toBe(true);

    // remove layer and check that layercontrol disappears
    await page.evaluateHandle(() =>
      document.querySelector('map-layer').remove()
    );
    let layerControlHidden = await page.$eval(
      'css=body > map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div',
      (elem) => elem.hasAttribute('hidden')
    );
    expect(layerControlHidden).toEqual(true);
  });

  test('Create map without controls', async () => {
    // remove previously created map
    await page.evaluateHandle(() => document.querySelector('map').remove());

    const mapHandle = await page.evaluateHandle(() =>
      document.createElement('map', { is: 'web-map' })
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('is', 'web-map'),
      mapHandle
    );
    await page.evaluateHandle((map) => map.setAttribute('lat', 45), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute('lon', -90), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute('zoom', 2), mapHandle);
    await page.evaluateHandle(
      (map) => map.setAttribute('width', '600'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('height', '600'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('projection', 'CBMTILE'),
      mapHandle
    );
    await page.evaluateHandle(
      (map) => document.body.appendChild(map),
      mapHandle
    );

    // no controls should be on the map
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
    let scaleHidden = await page.$eval(
      '.leaflet-bottom.leaflet-left > .mapml-control-scale',
      (div) => div.hidden
    );
    let geolocation = await page.$eval(
      '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
      (div) => div.hidden
    );
    expect(geolocation).toEqual(true);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    expect(layerControlHidden).toEqual(true);
    expect(scaleHidden).toEqual(true);
  });

  test('Adding a layer to a map without controls does not add controls', async () => {
    const layerHandle = await page.evaluateHandle(() =>
      document.createElement('map-layer')
    );
    await page.evaluateHandle(
      (layer) => layer.setAttribute('label', 'CBMT'),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => layer.setAttribute('src', 'tiles/cbmt/cbmt.mapml'),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => layer.setAttribute('checked', ''),
      layerHandle
    );
    await page.evaluateHandle(
      (layer) => document.querySelector('map').appendChild(layer),
      layerHandle
    );

    // no controls should be on the map
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
    let layerControl = await page.locator('.leaflet-control-layers');
    let scaleHidden = await page.$eval(
      '.leaflet-bottom.leaflet-left > .mapml-control-scale',
      (div) => div.hidden
    );
    let geolocation = await page.$eval(
      '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
      (div) => div.hidden
    );
    expect(geolocation).toEqual(true);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    await expect(layerControl).toBeHidden();
    expect(scaleHidden).toEqual(true);
  });

  test('Adding controls to a map which was created without controls', async () => {
    const mapHandle = await page.evaluateHandle(() =>
      document.querySelector('map')
    );
    await page.evaluate((map) => (map.controls = true), mapHandle);

    // All controls should be visible on the map
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
    await page.waitForTimeout(300);
    let layerControlHidden = await page.$eval(
      '.leaflet-top.leaflet-right > .leaflet-control-layers',
      (div) => div.hidden
    );
    let scaleHidden = await page.$eval(
      '.leaflet-bottom.leaflet-left > .mapml-control-scale',
      (div) => div.hidden
    );
    let geolocation = await page.$eval(
      '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
      (div) => div.hidden
    );
    expect(geolocation).toEqual(true);
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);
    expect(fullscreenHidden).toEqual(false);
    expect(layerControlHidden).toEqual(false);
    expect(scaleHidden).toEqual(false);

    // remove map for next test
    await page.evaluateHandle(() => document.querySelector('map').remove());
  });

  test('Creating map with the default size hides the fullscreen control and the controls attribute functions properly', async () => {
    // Adding map
    const mapHandle = await page.evaluateHandle(() =>
      document.createElement('map', { is: 'web-map' })
    );
    await page.evaluateHandle(
      (map) => map.setAttribute('is', 'web-map'),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => viewer.setAttribute('lat', 45),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => viewer.setAttribute('lon', -90),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => viewer.setAttribute('zoom', 2),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => viewer.setAttribute('projection', 'CBMTILE'),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => viewer.setAttribute('controls', ''),
      mapHandle
    );
    await page.evaluateHandle(
      (viewer) => document.body.appendChild(viewer),
      mapHandle
    );

    let leftControlCount = await page.$eval(
      '.leaflet-top.leaflet-left',
      (div) => div.childElementCount
    );
    expect(leftControlCount).toBe(2);

    let zoomHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .leaflet-control-zoom',
      (div) => div.hidden
    );
    let reloadHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .mapml-reload-button',
      (div) => div.hidden
    );
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);

    await page.evaluate(
      (viewer) => viewer.removeAttribute('controls'),
      mapHandle
    );
    zoomHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .leaflet-control-zoom',
      (div) => div.hidden
    );
    reloadHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .mapml-reload-button',
      (div) => div.hidden
    );
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);

    await page.evaluate(
      (viewer) => viewer.setAttribute('controls', ''),
      mapHandle
    );
    zoomHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .leaflet-control-zoom',
      (div) => div.hidden
    );
    reloadHidden = await page.$eval(
      '.leaflet-top.leaflet-left > .mapml-reload-button',
      (div) => div.hidden
    );
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);

    // remove map for next test
    await page.evaluateHandle(() => document.querySelector('map').remove());
  });

  test.describe('controlslist test', () => {
    test('map created with controlslist', async () => {
      // Adding map
      const mapHandle = await page.evaluateHandle(() =>
        document.createElement('map', { is: 'web-map' })
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('is', 'web-map'),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('lat', 45),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('lon', -90),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('zoom', 2),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('width', '600'),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('height', '600'),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('projection', 'CBMTILE'),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('controls', ''),
        mapHandle
      );
      await page.evaluateHandle(
        (map) =>
          map.setAttribute('controlslist', 'nozoom nofullscreen noscale'),
        mapHandle
      );
      await page.evaluateHandle(
        (map) => document.body.appendChild(map),
        mapHandle
      );

      // layer, zoom and fullscreen controls should be hidden
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
      let scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      let geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(false);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);
      expect(scaleHidden).toEqual(true);

      // Remove controlslist for next test
      await page.evaluate(
        (map) => map.removeAttribute('controlslist'),
        mapHandle
      );
    });

    test('Adding controlslist using setAttribute and controlsList setter', async () => {
      const mapHandle = await page.evaluateHandle(() =>
        document.querySelector('map')
      );
      await page.evaluate(
        (map) => map.setAttribute('controlslist', 'noreload'),
        mapHandle
      );
      let hascontrolslist = await page.evaluate(
        (map) => map.getAttribute('controlslist'),
        mapHandle
      );
      expect(hascontrolslist).toEqual('noreload');

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
      let scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      let geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(zoomHidden).toEqual(false);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(true);
      expect(scaleHidden).toEqual(false);

      // controlsList setter
      await page.evaluate(
        (map) => (map.controlsList = 'noreload nozoom'),
        mapHandle
      );
      hascontrolslist = await page.evaluate(
        (map) => map.getAttribute('controlslist'),
        mapHandle
      );
      expect(hascontrolslist).toEqual('noreload nozoom');

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
      scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(true);
      expect(scaleHidden).toEqual(false);
    });

    test('Turning controls off and on to see if controlslist is preserved', async () => {
      // Turning controls off
      const mapHandle = await page.evaluateHandle(() =>
        document.querySelector('map')
      );
      await page.evaluate((map) => map.removeAttribute('controls'), mapHandle);
      let hasControls = await page.evaluate(
        (map) => map.hasAttribute('controls'),
        mapHandle
      );
      expect(hasControls).toBe(false);

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
      let scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      let geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);
      expect(scaleHidden).toEqual(true);

      // Turning controls on
      await page.evaluate((map) => map.setAttribute('controls', ''), mapHandle);
      hasControls = await page.evaluate(
        (map) => map.hasAttribute('controls'),
        mapHandle
      );
      expect(hasControls).toBe(true);

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
      scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(true);
      expect(scaleHidden).toEqual(false);
    });
    test('controlslist geolocations test', async () => {
      const viewerHandle = await page.evaluateHandle(() =>
        document.querySelector('map')
      );
      await page.evaluate(
        (map) => map.setAttribute('controlslist', 'geolocation'),
        viewerHandle
      );
      let hascontrolslist = await page.evaluate(
        (map) => map.getAttribute('controlslist'),
        viewerHandle
      );
      expect(hascontrolslist).toEqual('geolocation');

      let geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(false);
      //remove geolocation
      await page.evaluate(
        (map) => (map.controlsList = 'noreload'),
        viewerHandle
      );
      hascontrolslist = await page.evaluate(
        (viewer) => viewer.getAttribute('controlslist'),
        viewerHandle
      );
      expect(hascontrolslist).toEqual('noreload');

      let reloadHidden = await page.$eval(
        '.leaflet-top.leaflet-left > .mapml-reload-button',
        (div) => div.hidden
      );
      geolocation = await page.$eval(
        '.leaflet-bottom.leaflet-right > .leaflet-control-locate',
        (div) => div.hidden
      );
      expect(geolocation).toEqual(true);
      expect(reloadHidden).toEqual(true);
    });
    test('controlslist removeAttribute', async () => {
      const mapHandle = await page.evaluateHandle(() =>
        document.querySelector('map')
      );
      // removeAttribute
      await page.evaluate(
        (viewer) => viewer.removeAttribute('controlslist'),
        mapHandle
      );

      let hasControlslist = await page.evaluate(
        (viewer) => viewer.hasAttribute('controlslist'),
        mapHandle
      );
      expect(hasControlslist).toEqual(false);

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
      let scaleHidden = await page.$eval(
        '.leaflet-bottom.leaflet-left > .mapml-control-scale',
        (div) => div.hidden
      );
      expect(zoomHidden).toEqual(false);
      expect(reloadHidden).toEqual(false);
      expect(fullscreenHidden).toEqual(false);
      expect(scaleHidden).toEqual(false);

      let controlslistDomTokenListLength = await page.evaluate(
        (viewer) => viewer.controlsList.length,
        mapHandle
      );
      expect(controlslistDomTokenListLength).toBe(0);

      // remove map for next test
      await page.evaluateHandle(() => document.querySelector('map').remove());
    });

    test.describe('DomTokenList Methods test', () => {
      test('using .add(), .replace() and .value() methods of controlsList', async () => {
        // Adding map
        const mapHandle = await page.evaluateHandle(() =>
          document.createElement('map', { is: 'web-map' })
        );
        await page.evaluateHandle(
          (map) => map.setAttribute('is', 'web-map'),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('lat', 45),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('lon', -90),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('zoom', 2),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('width', '600'),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('height', '600'),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('projection', 'CBMTILE'),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => viewer.setAttribute('controls', ''),
          mapHandle
        );
        await page.evaluateHandle(
          (viewer) => document.body.appendChild(viewer),
          mapHandle
        );

        let controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlsListLength).toEqual(0);

        // Testing .value()
        await page.evaluateHandle(
          (viewer) => (viewer.controlsList.value = 'nozoom nolayer'),
          mapHandle
        );
        let controlslistAttribute = await page.evaluate(
          (viewer) => viewer.getAttribute('controlslist'),
          mapHandle
        );
        let controlsListValue = await page.evaluate(
          (viewer) => viewer.controlsList.value,
          mapHandle
        );
        controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlslistAttribute).toEqual('nozoom nolayer');
        expect(controlsListValue).toEqual('nozoom nolayer');
        expect(controlsListLength).toEqual(2);

        // Testing .add()
        await page.evaluateHandle(
          (viewer) => viewer.controlsList.add('nofullscreen'),
          mapHandle
        );
        controlslistAttribute = await page.evaluate(
          (viewer) => viewer.getAttribute('controlslist'),
          mapHandle
        );
        controlsListValue = await page.evaluate(
          (viewer) => viewer.controlsList.value,
          mapHandle
        );
        controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlslistAttribute).toEqual('nozoom nolayer nofullscreen');
        expect(controlsListValue).toEqual('nozoom nolayer nofullscreen');
        expect(controlsListLength).toEqual(3);

        // Testing .replace()
        await page.evaluateHandle(
          (viewer) => viewer.controlsList.replace('nolayer', 'noreload'),
          mapHandle
        );
        controlslistAttribute = await page.evaluate(
          (viewer) => viewer.getAttribute('controlslist'),
          mapHandle
        );
        controlsListValue = await page.evaluate(
          (viewer) => viewer.controlsList.value,
          mapHandle
        );
        controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlslistAttribute).toEqual('nozoom noreload nofullscreen');
        expect(controlsListValue).toEqual('nozoom noreload nofullscreen');
        expect(controlsListLength).toEqual(3);

        // Testing .toggle()
        await page.evaluateHandle(
          (viewer) => viewer.controlsList.toggle('nofullscreen'),
          mapHandle
        );
        controlslistAttribute = await page.evaluate(
          (viewer) => viewer.getAttribute('controlslist'),
          mapHandle
        );
        controlsListValue = await page.evaluate(
          (viewer) => viewer.controlsList.value,
          mapHandle
        );
        controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlslistAttribute).toEqual('nozoom noreload');
        expect(controlsListValue).toEqual('nozoom noreload');
        expect(controlsListLength).toEqual(2);
      });

      test('using .contains(), .item(), .remove() and .supports() methods of controlsList', async () => {
        const mapHandle = await page.evaluateHandle(() =>
          document.querySelector('map')
        );

        // Testing .contains()
        let controlslistContains = await page.evaluate(
          (viewer) => viewer.controlsList.contains('nozoom'),
          mapHandle
        );
        expect(controlslistContains).toBe(true);
        controlslistContains = await page.evaluate(
          (viewer) => viewer.controlsList.contains('nofullscreen'),
          mapHandle
        );
        expect(controlslistContains).toBe(false);

        // Testing .item()
        let controlslistItem = await page.evaluate(
          (viewer) => viewer.controlsList.item(1),
          mapHandle
        );
        expect(controlslistItem).toEqual('noreload');
        controlslistItem = await page.evaluate(
          (viewer) => viewer.controlsList.item(2),
          mapHandle
        );
        expect(controlslistItem).toEqual(null);

        // Testing .remove()
        await page.evaluateHandle(
          (viewer) => viewer.controlsList.remove('noreload'),
          mapHandle
        );
        let controlslistAttribute = await page.evaluate(
          (viewer) => viewer.getAttribute('controlslist'),
          mapHandle
        );
        let controlsListValue = await page.evaluate(
          (viewer) => viewer.controlsList.value,
          mapHandle
        );
        let controlsListLength = await page.evaluate(
          (viewer) => viewer.controlsList.length,
          mapHandle
        );
        expect(controlslistAttribute).toEqual('nozoom');
        expect(controlsListValue).toEqual('nozoom');
        expect(controlsListLength).toEqual(1);

        // Testing .supports()
        let controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('noreload'),
          mapHandle
        );
        expect(controlslistSupported).toBe(true);
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('nofullscreen'),
          mapHandle
        );
        expect(controlslistSupported).toBe(true);
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('nozoom'),
          mapHandle
        );
        expect(controlslistSupported).toBe(true);
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('nolayer'),
          mapHandle
        );
        expect(controlslistSupported).toBe(true);
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('noscale'),
          mapHandle
        );
        expect(controlslistSupported).toBe(true);
        // controls which are not yet supported / or invalid
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('nogeolocation'),
          mapHandle
        );
        expect(controlslistSupported).toBe(false);
        controlslistSupported = await page.evaluate(
          (viewer) => viewer.controlsList.supports('nocode'),
          mapHandle
        );
        expect(controlslistSupported).toBe(false);

        // remove map for next test
        await page.evaluateHandle(() => document.querySelector('map').remove());
      });
    });

    test('controls disabled for empty custom projection map', async () => {
      // Adding custom projection map
      const mapHandle = await page.evaluateHandle(() =>
        document.createElement('map', { is: 'web-map' })
      );
      await page.evaluateHandle(
        (map) => map.setAttribute('is', 'web-map'),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('lat', 45),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('lon', -90),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('zoom', 2),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('width', '600'),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('height', '600'),
        mapHandle
      );

      // Adding custom projection
      const custProj = await page.evaluate((viewer) => {
        return viewer.defineCustomProjection(template);
      }, mapHandle);
      expect(custProj).toEqual('basic');

      await page.evaluateHandle(
        (viewer) => viewer.setAttribute('projection', 'basic'),
        mapHandle
      );
      await page.evaluateHandle(
        (viewer) => document.body.appendChild(viewer),
        mapHandle
      );

      await page.evaluate((viewer) => {
        viewer.projection = 'basic';
      }, mapHandle);

      // Toggle Controls (T) contextmenu is disabled
      let toggleControlsBtn = await page.$eval(
        'div > div.mapml-contextmenu > button:nth-child(10)',
        (btn) => btn.disabled
      );
      expect(toggleControlsBtn).toBe(true);
    });
  });
});
