describe("Playwright Layer Context Menu Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "layerContextMenu.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Layer context menu shows when layer is clicked", async () => {
    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div", {force:  true});
    await page.click(" .mapml-layer-item:nth-child(1) button[title='Layer Settings']", { button: "right", force: true});
    await page.waitForSelector(".mapml-contextmenu.mapml-layer-menu",{state: 'visible'});
      
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.querySelector(".mapml-contextmenu.mapml-layer-menu"), nextHandle);

    const menuDisplay = await (await page.evaluateHandle(elem => elem.style.display, resultHandle)).jsonValue();

    await expect(menuDisplay).toEqual("block");
  });

  test("Layer context menu copy layer extent", async () => {
    await page.keyboard.press("c");
    await page.click("body > textarea");
    await page.keyboard.press("Control+v");
    const copyValue = await page.$eval(
      "body > textarea",
      (text) => text.value
    );

    await expect(copyValue).toEqual("<map-meta name=\"extent\" content=\"top-left-easting=-6207743.103886206, top-left-northing=10861943.103886206, bottom-right-easting=3952277.216154434, bottom-right-northing=-3362085.3441706896\"></map-meta>");
  });

  test("Use Layer context menu to zoom in to disabled layer", async () => {
    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div", {force:  true});
    await page.click("div .mapml-layer-item:nth-child(2) button[title='Layer Settings']",{ button: "right", force: true});
    await page.waitForSelector(".mapml-contextmenu.mapml-layer-menu",{state: 'visible'});
    await page.keyboard.press("z");
    await page.waitForTimeout(1000);
    const mapLocation = await page.$eval(
      "body > mapml-viewer",
      (text) => text._map.getPixelBounds()
    );

    const mapZoom = await page.$eval(
      "body > mapml-viewer",
      (text) => text._map.getZoom()
    );

    await expect(mapZoom).toEqual(11);
    await expect(mapLocation).toEqual({ max: { x: 43130, y: 43130 }, min: { x: 42630, y: 42630 } });
  });

  test("Use Layer context menu to zoom in to disabled layer", async () => {
    for (let i = 0; i < 5; i++) {
      await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in");
      await page.waitForTimeout(200);
    }
    await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div", {force:  true});
    await page.click("div .mapml-layer-item:nth-child(3) button[title='Layer Settings']",{ button: "right", force: true});
    await page.waitForSelector(".mapml-contextmenu.mapml-layer-menu",{state: 'visible'});
    await page.keyboard.press("z");
    await page.waitForTimeout(1000);
    const mapLocation = await page.$eval(
      "body > mapml-viewer",
      (text) => text._map.getPixelBounds()
    );

    const mapZoom = await page.$eval(
      "body > mapml-viewer",
      (text) => text._map.getZoom()
    );

    await expect(mapZoom).toEqual(11);
    await expect(mapLocation).toEqual({ max: { x: 43130, y: 43557 }, min: { x: 42630, y: 43057 } });
  });
});