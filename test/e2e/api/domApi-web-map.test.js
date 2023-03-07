import { test, expect, chromium } from '@playwright/test';

test.describe("web-map DOM API Tests", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    page = await context.newPage();
    await page.goto("domApi-web-map.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Create a web map with document.createElement(map)", async () => {
    const mapHandle = await page.evaluateHandle(()=> document.createElement("map", {is:"web-map"}));
    const nn = await (await page.evaluateHandle(map => map.nodeName, mapHandle)).jsonValue();
    expect(nn).toEqual('MAP');
    await page.evaluateHandle((map) => map.setAttribute("is", "web-map"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("lat", 45), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("lon", -90), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("zoom", 2), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("controls", ""), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("width", "600"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("height", "600"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("projection", "CBMTILE"), mapHandle);
    await page.evaluateHandle((map) => document.body.appendChild(map), mapHandle);
    const velName = await page.evaluate(() => document.body.querySelector("map").nodeName);
    expect(velName).toBe('MAP');
    // testing to ensure web-map was successfully implemented
    let verifymap= await page.evaluate( map => document.body.querySelector("map").childElementCount);
    expect(verifymap).toBe(2);
    // the map, having 0 layers, should not have a layer control, despite the controls attribute
    const layerControlHidden = await page.$eval(
        "css=body > map>> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);
  });

  test("Create a layer with document.createElement(layer-)", async () => {
    const layerHandle = await page.evaluateHandle(()=> document.createElement("layer-"));
    const nn = await  (await page.evaluateHandle(map => map.nodeName, layerHandle)).jsonValue();
    expect(nn).toEqual('LAYER-');
    await page.evaluateHandle((layer) => layer.setAttribute("label", "CBMT"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("src", "http://geogratis.gc.ca/mapml/en/cbmtile/cbmt/"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("checked", ""), layerHandle);
    await page.evaluateHandle((layer) => document.querySelector('map').appendChild(layer), layerHandle);
    let layerControlHidden = await page.$eval(
      "css=body > map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(false);

    // set the layer's hidden attribute, the layer should be removed from the layer
    // control (but not the map), which leaves 0 layers in the layer control, which means the
    // layer control should disappear
    await page.evaluateHandle((layer) => layer.setAttribute("hidden", ""), layerHandle);
    layerControlHidden = await page.$eval(
      "css=body > map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);

    // takes a couple of seconds for the tiles to load

    await page.waitForLoadState('networkidle');
    const layerVisible = await page.$eval(
            "body > map .leaflet-tile-loaded:nth-child(1)", 
            (tileDiv) => tileDiv.firstChild.nodeName === "IMG");
    expect(layerVisible).toBe(true);
  });

  test("Toggle all web map controls by adding or removing controls attribute", async () => {
    await page.evaluateHandle(() => document.querySelector('layer-').setAttribute("hidden",""));
    await page.evaluateHandle(() => document.querySelector('layer-').removeAttribute("hidden"));

    const mapHandle = await page.evaluateHandle(() => document.querySelector('map'));
    let hasControls = await page.evaluate( map => map.hasAttribute("controls"), mapHandle);
    expect(hasControls).toBe(true);

    await page.evaluate( map => map.removeAttribute("controls"), mapHandle);
    hasControls = await page.evaluate( map => map.hasAttribute("controls"), mapHandle);
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
    const mapHandle = await page.evaluateHandle(() => document.querySelector('map'));
    await page.evaluate( map => map.setAttribute("controls",""), mapHandle);
    let hasControls = await page.evaluate( map => map.hasAttribute("controls"), mapHandle);
    expect(hasControls).toBe(true);

    // remove layer and check that layercontrol disappears
    await page.evaluateHandle(() => document.querySelector('layer-').remove());
    let layerControlHidden = await page.$eval(
      "css=body > map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(true);
  });

  test("Create map without controls", async () => {
    // remove previously created map
    await page.evaluateHandle(() => document.querySelector('map').remove());

    const mapHandle = await page.evaluateHandle(()=> document.createElement("map", {is:"web-map"}));
    await page.evaluateHandle((map) => map.setAttribute("is", "web-map"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("lat", 45), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("lon", -90), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("zoom", 2), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("width", "600"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("height", "600"), mapHandle);
    await page.evaluateHandle((map) => map.setAttribute("projection", "CBMTILE"), mapHandle);
    await page.evaluateHandle((map) => document.body.appendChild(map), mapHandle);

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
    await page.evaluateHandle((layer) => document.querySelector('map').appendChild(layer), layerHandle);

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
    const mapHandle = await page.evaluateHandle(() => document.querySelector('map'));
    await page.evaluate( map => map.setAttribute("controls",""), mapHandle);

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
    await page.evaluateHandle(() => document.querySelector('map').remove());
  });

  test.describe("controlslist test", () => {

    test("map created with controlslist", async () => {
      // Adding map
      const mapHandle = await page.evaluateHandle(()=> document.createElement("map", {is:"web-map"}));
      await page.evaluateHandle((map) => map.setAttribute("is", "web-map"), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("lat", 45), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("lon", -90), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("zoom", 2), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("width", "600"), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("height", "600"), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("projection", "CBMTILE"), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("controls", ""), mapHandle);
      await page.evaluateHandle((map) => map.setAttribute("controlslist", "nozoom nofullscreen"), mapHandle);
      await page.evaluateHandle((map) => document.body.appendChild(map), mapHandle);

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
      await page.evaluate( map => map.removeAttribute("controlslist"), mapHandle);
    });

    test("Adding controlslist using setAttribute", async () => {
      const mapHandle = await page.evaluateHandle(() => document.querySelector('map'));
      await page.evaluate( map => map.setAttribute("controlslist","noreload nozoom"), mapHandle);
      let hascontrolslist = await page.evaluate( map => map.getAttribute("controlslist"), mapHandle);
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
      const mapHandle = await page.evaluateHandle(() => document.querySelector('map'));
      await page.evaluate( map => map.removeAttribute("controls"), mapHandle);
      let hasControls = await page.evaluate( map => map.hasAttribute("controls"), mapHandle);
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
      await page.evaluate( map => map.setAttribute("controls",""), mapHandle);
      hasControls = await page.evaluate( map => map.hasAttribute("controls"), mapHandle);
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