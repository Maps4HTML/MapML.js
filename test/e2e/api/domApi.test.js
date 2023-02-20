import { test, expect, chromium } from '@playwright/test';

test.describe("mapml-viewer DOM API Tests", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    page = await context.newPage();
    await page.goto("domApi.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Create a map viewer with document.createElement(mapml-viewer)", async () => {
    const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
    const nn = await (await page.evaluateHandle(viewer => viewer.nodeName, viewerHandle)).jsonValue();
    expect(nn).toEqual('MAPML-VIEWER');
    await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("controls", "controls"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
    await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);
    const velName = await page.evaluate(() => document.body.querySelector("mapml-viewer").nodeName);
    expect(velName).toBe('MAPML-VIEWER');
    // testing to ensure mapml-viewer was successfully implemented
    let verifymap= await page.evaluate( viewer => document.body.querySelector("mapml-viewer").childElementCount);
    expect(verifymap).toBe(1);
    // the map, having 0 layers, should not have a layer control, despite the controls attribute
    const layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    await expect(layerControlHidden).toEqual(true);
  });

  test("Create a layer with document.createElement(layer-)", async () => {
    const layerHandle = await page.evaluateHandle(()=> document.createElement("layer-"));
    const nn = await  (await page.evaluateHandle(viewer => viewer.nodeName, layerHandle)).jsonValue();
    expect(nn).toEqual('LAYER-');
    await page.evaluateHandle((layer) => layer.setAttribute("label", "CBMT"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("src", "http://geogratis.gc.ca/mapml/en/cbmtile/cbmt/"), layerHandle);
    await page.evaluateHandle((layer) => layer.setAttribute("checked", "checked"), layerHandle);
    await page.evaluateHandle((layer) => document.querySelector('mapml-viewer').appendChild(layer), layerHandle);
    let layerControlHidden = await page.$eval(
      "css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
      (elem) => elem.hasAttribute("hidden")
    );
    expect(layerControlHidden).toEqual(false);

    // set the layer's hidden attribute, the layer should be removed from the layer
    // control (but not the map), which leaves 0 layers in the layer control, which means the
    // layer control should disappear
    await page.evaluateHandle((layer) => layer.setAttribute("hidden", "hidden"), layerHandle);
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
    const viewerHandle = await page.evaluateHandle(() => document.querySelector('mapml-viewer'));
    let hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
    expect(hasControls).toBe(true);

    await page.evaluate( viewer => viewer.removeAttribute("controls"), viewerHandle);
    hasControls = await page.evaluate( viewer => viewer.hasAttribute("controls"), viewerHandle);
    expect(hasControls).toBe(false);

    // ALL the controls  displayed on the map should have disappeared
    const mapControlsHidden = await page.$eval(
      "div.leaflet-control-container > div.leaflet-top.leaflet-right",
      (elem) => elem.childElementCount === 0
    );
    expect(mapControlsHidden).toBe(true);

  });  

});