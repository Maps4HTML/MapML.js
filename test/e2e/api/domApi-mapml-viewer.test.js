import { test, expect, chromium } from '@playwright/test';

test.describe("mapml-viewer DOM API Tests", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    page = await context.newPage();
    await page.goto("domApi-mapml-viewer.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Create a map viewer with document.createElement(mapml-viewer)", async () => {
    // check for error messages in console
    let errorLogs = [];
    page.on("pageerror", (err) => {
      errorLogs.push(err.message);
    })
    const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
    const nn = await (await page.evaluateHandle(viewer => viewer.nodeName, viewerHandle)).jsonValue();
    expect(nn).toEqual('MAPML-VIEWER');
    await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("controls", ""), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("width", "600"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("height", "600"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
    await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);
    const velName = await page.evaluate(() => document.body.querySelector("mapml-viewer").nodeName);
    expect(velName).toBe('MAPML-VIEWER');
    // check for error messages in console
    expect(errorLogs.length).toBe(0);
    // testing to ensure mapml-viewer was successfully implemented
    let verifymap= await page.evaluate( viewer => document.body.querySelector("mapml-viewer").childElementCount);
    expect(verifymap).toBe(1);
    // the map, having 0 layers, should not have a layer control, despite the controls attribute
    const layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);
  });

  test("Create a layer with document.createElement(layer-)", async () => {
    const layerHandle = await page.evaluateHandle(()=> document.createElement("layer-"));
    const nn = await  (await page.evaluateHandle(viewer => viewer.nodeName, layerHandle)).jsonValue();
    expect(nn).toEqual('LAYER-');
    await page.evaluateHandle((layer) => layer.setAttribute("label", "CBMT"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("src", "http://geogratis.gc.ca/mapml/en/cbmtile/cbmt/"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("checked", ""), layerHandle);
    await page.evaluateHandle((layer) => document.querySelector('mapml-viewer').appendChild(layer), layerHandle);
    let layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(false);

    // set the layer's hidden attribute, the layer should be removed from the layer
    // control (but not the map), which leaves 0 layers in the layer control, which means the
    // layer control should disappear
    await page.evaluateHandle((layer) => layer.setAttribute("hidden", ""), layerHandle);
    layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);

    // takes a couple of seconds for the tiles to load

    await page.waitForLoadState('networkidle');
    const layerVisible = await page.$eval(
            "body > mapml-viewer .leaflet-tile-loaded:nth-child(1)", 
            (tileDiv) => tileDiv.firstChild.nodeName === "IMG");
    expect(layerVisible).toBe(true);
  });

  test("Toggle all mapml-viewer controls by adding or removing controls attribute", async () => {
    await page.evaluateHandle(() => document.querySelector('layer-').setAttribute("hidden",""));
    await page.evaluateHandle(() => document.querySelector('layer-').removeAttribute("hidden"));

    const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
    let hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
    expect(hasControls).toBe(true);

    await page.evaluate( viewer => viewer.removeAttribute("controls"), viewerHandle);
    hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
    expect(hasControls).toBe(false);

    // ALL the controls displayed on the map should have disappeared
    let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
    let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    expect(layerControlHidden).toEqual(true);
  });  

  test("Removing layer removes layer control", async () => {
    const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
    await page.evaluate( viewer => viewer.setAttribute("controls",""), viewerHandle);
    let hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
    expect(hasControls).toBe(true);

    // remove layer and check that layercontrol disappears
    await page.evaluateHandle(() => document.querySelector('layer-').remove());
    let layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);
  });

  test("Create map without controls", async () => {
    // remove previously created map
    await page.evaluateHandle(() => document.querySelector('mapml-viewer').remove());

    const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
    await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("width", "600"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("height", "600"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
    await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);

    // no controls should be on the map
    let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
    let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    expect(layerControlHidden).toEqual(true);
  });

  test("Adding a layer to a map without controls does not add controls", async () => {
    const layerHandle = await page.evaluateHandle(()=> document.createElement("layer-"));
    await page.evaluateHandle((layer) => layer.setAttribute("label", "CBMT"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("src", "http://geogratis.gc.ca/mapml/en/cbmtile/cbmt/"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("checked", ""), layerHandle);
    await page.evaluateHandle((layer) => document.querySelector('mapml-viewer').appendChild(layer), layerHandle);

    // no controls should be on the map
    let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
    let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    expect(fullscreenHidden).toEqual(true);
    expect(layerControlHidden).toEqual(true);
  });

  test("Adding controls to a map which was created without controls", async () => {
    const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
    await page.evaluate( viewer => viewer.setAttribute("controls",""), viewerHandle);

    // All controls should be visible on the map
    let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
    let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);
    expect(fullscreenHidden).toEqual(false);
    expect(layerControlHidden).toEqual(false);

    // remove map for next test
    await page.evaluateHandle(() => document.querySelector('mapml-viewer').remove());
  });

  test("Creating mapml-viewer with the default size hides the fullscreen control and the controls attribute functions properly", async () => {
    // Adding map
    const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
    await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("controls", ""), viewerHandle);
    await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);

    let leftControlCount = await page.$eval(".leaflet-top.leaflet-left", (div) => div.childElementCount);
    expect(leftControlCount).toBe(2);

    let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);
    
    await page.evaluate( viewer => viewer.removeAttribute("controls"), viewerHandle);
    zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    expect(zoomHidden).toEqual(true);
    expect(reloadHidden).toEqual(true);
    
    await page.evaluate( viewer => viewer.setAttribute("controls",""), viewerHandle);
    zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
    reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
    expect(zoomHidden).toEqual(false);
    expect(reloadHidden).toEqual(false);
    
    // remove map for next test
    await page.evaluateHandle(() => document.querySelector('mapml-viewer').remove());
  });

  test.describe("controlslist test", () => {

    test("map created with controlslist", async () => {
      // Adding map
      const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
      await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("width", "600"), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("height", "600"), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("controls", ""), viewerHandle);
      await page.evaluateHandle((viewer) => viewer.setAttribute("controlslist", "nozoom nofullscreen"), viewerHandle);
      await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);

      // layer, zoom and fullscreen controls should be hidden
      let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
      let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
      let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
      let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(false);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);

      // Remove controlslist for next test
      await page.evaluate( viewer => viewer.removeAttribute("controlslist"), viewerHandle);
    });

    test("Adding controlslist using setAttribute", async () => {
      const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
      await page.evaluate( viewer => viewer.setAttribute("controlslist","noreload nozoom"), viewerHandle);
      let hascontrolslist = await page.evaluate( viewer => viewer.getAttribute("controlslist"), viewerHandle);
      expect(hascontrolslist).toEqual('noreload nozoom');
  
      let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
      let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
      let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
      let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(true);
    });

    test("Turning controls off and on to see if controlslist is preserved", async () => {
      // Turning controls off
      const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
      await page.evaluate( viewer => viewer.removeAttribute("controls"), viewerHandle);
      let hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
      expect(hasControls).toBe(false);
  
      let zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
      let reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
      let fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
      let layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(true);
      expect(layerControlHidden).toEqual(true);

      // Turning controls on
      await page.evaluate( viewer => viewer.setAttribute("controls",""), viewerHandle);
      hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
      expect(hasControls).toBe(true);

      zoomHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-zoom", (div) => div.hidden);
      reloadHidden = await page.$eval(".leaflet-top.leaflet-left > .mapml-reload-button", (div) => div.hidden);
      fullscreenHidden = await page.$eval(".leaflet-top.leaflet-left > .leaflet-control-fullscreen", (div) => div.hidden);
      layerControlHidden = await page.$eval(".leaflet-top.leaflet-right > .leaflet-control-layers", (div) => div.hidden);
      expect(zoomHidden).toEqual(true);
      expect(reloadHidden).toEqual(true);
      expect(fullscreenHidden).toEqual(false);
      expect(layerControlHidden).toEqual(true);
    });

  });

});