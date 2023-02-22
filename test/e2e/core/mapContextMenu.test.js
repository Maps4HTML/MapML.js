import { test, expect, chromium } from '@playwright/test';
//
//expected topLeft values in the different cs, at the different
//positions the map goes in
let expectedPCRS = [
  { horizontal: -9373489.01871137, vertical: 11303798.154262971 },
  { horizontal: -5059449.140631609, vertical: 10388337.990009308 }];
let expectedGCRS = [
  { horizontal: -128.07848522325827, vertical: -3.3883427348651636 },
  { horizontal: -131.75138842058425, vertical: 18.07246131233218 }];
let expectedFirstTileMatrix = [
  { horizontal: 2.57421875, vertical: 2.8515625 },
  { horizontal: 3.0134698275862073, vertical: 2.944773706896552 }];
let expectedFirstTCRS = [
  { horizontal: 659, vertical: 730 },
  { horizontal: 771.4482758620691, vertical: 753.8620689655173 }];

// expected extent top-left and bottom-right values at different zoom levels
let expectedExtentPCRS_0 = [
  {horizontal: -9373489, vertical: 11303798},
  {horizontal: 9808841, vertical: -11714998}
];
let expectedExtentPCRS_1 = [
  {horizontal: -5396794, vertical: 6520122},
  {horizontal: 5848021, vertical: -6973655}
];

test.describe("Playwright Map Context Menu Tests", () => {
  let page;
  let context;
  let currExtCS, currLocCS;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("mapElement.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Context menu dismissed by Escape key", async () => {
    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    const contextMenu = page.locator('css= body > map >> css= div > div.mapml-contextmenu').first();
    expect( await contextMenu.isVisible()).toBeTruthy();
    await page.keyboard.press("Escape");
    expect(await contextMenu.isHidden()).toBeTruthy();
  });
  test("Context menu focus on keyboard shortcut", async () => {
    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("View fullscreen (E)");
  });

  test("Context menu tab goes to next item", async () => {
    await page.keyboard.press("Tab");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Copy (C)");
  });

  test("Submenu opens on C with focus on first item", async () => {
    await page.keyboard.press("c");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Map");
  });

  test("Context menu displaying on map", async () => {
    await page.click("body > map", { button: "right" });
    const contextMenu = await page.$eval(
      "div > div.mapml-contextmenu",
      (menu) => window.getComputedStyle(menu).getPropertyValue("display")
    );
    expect(contextMenu).toEqual("block");
  });
  test("Context menu, back item", async () => {
    await page.$eval(
      "body > map",
      (map) => map.zoomTo(81, -63, 1)
    );
    await page.waitForTimeout(1000);
    await page.click("body > map", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(1)");
    await page.waitForTimeout(1000);
    const extent = await page.$eval(
      "body > map",
      (map) => map.extent
    );

    expect(extent.projection).toEqual("CBMTILE");
    expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
    expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
    expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
  });
  test("Context menu, back and reload item at initial location disabled", async () => {
    await page.click("body > map", { button: "right" });
    const backBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(1)",
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(2)",
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(3)",
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(true);
    expect(fwdBtn).toEqual(false);
    expect(reloadBtn).toEqual(true);
  });
  test("Context menu, forward item", async () => {
    await page.click("body > map", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(2)");
    await page.waitForTimeout(1000);
    const extent = await page.$eval(
      "body > map",
      (map) => map.extent
    );

    expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
    expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
    expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
  });
  test("Context menu, forward item at most recent location disabled", async () => {
    await page.click("body > map", { button: "right" });
    const backBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(1)",
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(2)",
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(3)",
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(false);
    expect(fwdBtn).toEqual(true);
    expect(reloadBtn).toEqual(false);
  });

  test.describe("Context Menu, Toggle Controls ", () => {
    test("Context menu, toggle controls off", async () => {
      const controlsOn = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
        (controls) => controls.childElementCount
      );

      await page.click("body > map", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-of-type(7)");

      const controlsOff = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
        (controls) => controls.childElementCount
      );

      expect(controlsOn).toEqual(3);
      expect(controlsOff).toEqual(0);
    });

    test("Context menu, toggle controls on", async () => {
      const controlsOn = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
        (controls) => controls.childElementCount
      );

      await page.click("body > map", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-of-type(7)");

      const controlsOff = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
        (controls) => controls.childElementCount
      );

      expect(controlsOn).toEqual(0);
      expect(controlsOff).toEqual(3);
    });

    test("Context menu, toggle controls after changing opacity", async () => {
      await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
      await page.click(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)",
      );
      await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details",
        (div) => div.open = true
      );
      await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input");
      const valueBefore = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input",
        (opacity) => opacity.value
      );
      expect(valueBefore).toEqual("0.5");

      await page.click("body > map", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-child(6)");
      await page.click("body > map", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-child(6)");

      const valueAfter = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input",
        (opacity) => opacity.value
      );

      expect(valueAfter).toEqual("0.5");
    });
  });

  test("Submenu, copy map (MapML)", async () => {
    await page.reload();
    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.click("body > textarea#coord");
    await page.keyboard.press("Control+v");
    const copyValue = await page.$eval(
      "body > textarea#coord",
      (text) => text.value
    );
    const expected = `<map style="height: 600px;width:500px;" is="web-map" projection="CBMTILE" zoom="0" lat="47" lon="-92" controls="" role="application">
    <layer- label="CBMT - INLINE" checked="">
      <map-extent units="CBMTILE" hidden="">
        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
        <map-link rel="tile" tref="/data/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
      </map-extent>
    </layer->
  </map>`;
    expect(copyValue).toEqual(expected);
    await page.locator("body > textarea#coord").fill('');
  });

  test("Submenu, copy extent with zoom level = 0", async () => {
    currExtCS = await page.$eval(
      "body > map",
      (map) => (map._map.contextMenu.defExtCS)
    );
    // set cs to pcrs for copying extent test
    await page.$eval(
      "body > map",
      (map) => {map._map.contextMenu.defExtCS = 'pcrs';}
    );
    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.click("body > textarea#coord");
    await page.keyboard.press("Control+v");
    const copyValue = await page.$eval(
      "body > textarea#coord",
      (text) => text.value
    );
    const expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_0[0].horizontal}, top-left-northing=${expectedExtentPCRS_0[0].vertical}, bottom-right-easting=${expectedExtentPCRS_0[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_0[1].vertical}"></map-meta>`;
    expect(copyValue).toEqual(expected);
    await page.locator("body > textarea#coord").fill('');
  });

  test("Submenu, copy extent with zoom level = 1", async () => {
    // zoom in
    await page.click("body > map");
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.click("body > textarea#coord");
    await page.keyboard.press("Control+v");
    const copyValue = await page.$eval(
      "body > textarea#coord",
      (text) => text.value
    );
    const expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_1[0].horizontal}, top-left-northing=${expectedExtentPCRS_1[0].vertical}, bottom-right-easting=${expectedExtentPCRS_1[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_1[1].vertical}"></map-meta>`;
    expect(copyValue).toEqual(expected);
    await page.locator("body > textarea#coord").fill('');
    await page.$eval(
      "body > map",
      (map, currExtCS) => {
        map._map.contextMenu.defExtCS = currExtCS;
      }, 
      currExtCS
    );
  });

  test("Submenu, copy location", async () => {
    currLocCS = await page.$eval(
      "body > map",
      (map) => (map._map.contextMenu.defLocCS)
    )
    // set cs to pcrs for copying location test
    await page.$eval(
      "body > map",
      (map) => {map._map.contextMenu.defLocCS = 'gcrs';}
    );
    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await page.click("body > textarea#coord");
    await page.keyboard.press("Control+v");
    const copyValue = await page.$eval(
      "body > textarea#coord",
      (text) => text.value
    );
    const expected = "lon :-92.062002, lat:46.922393";
    expect(copyValue).toEqual(expected);
    await page.locator("body > textarea#coord").fill('');
    await page.$eval(
      "body > map",
      (map, currLocCS) => {
        map._map.contextMenu.defLocCS = currLocCS;
      }, 
      currLocCS
    );
  });

  test("Paste valid Layer to map", async () => {
    await page.click("body > textarea#layer");
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+c");

    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("p");

    const layerLabel = await page.$eval(
      "body > map",
      (map) => map.layers[1].label
    );
    expect(layerLabel).toEqual("Test Layer");
  });

  test("Paste invalid element to map", async () => {
    await page.click("body > textarea#invalidLayer");
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+c");

    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("p");
    const layerCount = await page.$eval(
      "body > map",
      (map) => map.children.length
    );
    expect(layerCount).toEqual(4);
  });

  test("Paste geojson to map", async () => {
    await page.click("body > textarea#geojson");
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+c");

    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("p");
    const layerLabel = await page.$eval(
      "body > map",
      (map) => map.layers[2].outerHTML
    );
    const expected = await page.$eval(
      "body > textarea#geojsonExpected",
      (textarea) => textarea.value
    );
    expect(layerLabel).toEqual(expected);
  });

  test("Paste invalid geojson to map", async () => {
    await page.click("body > textarea#geojsonInvalid");
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+c");

    await page.click("body > map");
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("p");
    const layerCount = await page.$eval(
      "body > map",
      (map) => map.children.length
    );
    expect(layerCount).toEqual(5);
  });

  test("Context menu, click at margin and move mouse out when submenu is visible", async () => {
    // click at the right-bottom margin of map
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(200);
    await page.click("body > map", {
      button: 'right',
      position: {x: 495, y: 580}
    });
    const contextMenu = await page.locator('div > div.mapml-contextmenu').first();
    expect(await contextMenu.isVisible()).toBeTruthy();
    const mapSize = await page.$eval(
      "body > map",
      (map) => { return {x: map.width, y: map.height} }
    );
    const contextMenuSize = await page.$eval(
      "div > div.mapml-contextmenu",
      (menu) => {
        return {
          x: menu.offsetWidth + menu.getBoundingClientRect().left,
          y: menu.offsetHeight + menu.getBoundingClientRect().top
        }
      }
    );
    expect(contextMenuSize.x <= mapSize.x && contextMenuSize.y <= mapSize.y).toBeTruthy();

    // move the mouse from "copy" to another button in the main contextmenu
    await page.hover("div > div.mapml-contextmenu > button:nth-of-type(5)");
    const submenu = await page.locator('div > div#mapml-copy-submenu').first();
    expect(await submenu.isVisible()).toBeTruthy();
    await page.hover("div > div.mapml-contextmenu > button:nth-of-type(6)");
    expect(await submenu.isHidden()).toBeTruthy();
  });
  
  test("Context menu, All buttons enabled when fwd and back history present", async () => {
    await page.click("body > map");
    await page.$eval(
      "body > map",
      (map) => map.zoomTo(81, -63, 3)
    );
    await page.waitForTimeout(1000);
    await page.$eval(
      "body > map",
      (map) => map.zoomTo(81, -63, 5)
    );
    await page.waitForTimeout(1000);
    await page.click("body > map", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(1)");
    await page.click("body > map", { button: "right" });
    const backBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(1)",
      (btn) => btn.disabled
    );
    const fwdBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(2)",
      (btn) => btn.disabled
    );
    const reloadBtn = await page.$eval(
      "div > div.mapml-contextmenu > button:nth-child(3)",
      (btn) => btn.disabled
    );

    expect(backBtn).toEqual(false);
    expect(fwdBtn).toEqual(false);
    expect(reloadBtn).toEqual(false);
  });

  test("Layer Context menu, Pressing enter on contextmenu focuses on checkbox element", async () => {
    await page.click("body > map");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.nodeName, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("INPUT");
  });

  test("Layer Context menu, Opening contextmenu focuses on first layer contextmenu", async () => {
    await page.keyboard.press("Shift+F10");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Zoom To Layer (Z)");
  });

  test("Layer Context menu, Tabbing through the contextmenu takes you back to the checkbox element", async () => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const aHandle = await page.evaluateHandle(() => document.querySelector(".mapml-web-map"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.nodeName, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("INPUT");
  });
  
  test("Layer Context menu, Pressing space on checkbox button toggles layer", async () => {
    await page.keyboard.press("Space");
    const layerCheck = await page.$eval(
      "body > map",
      (map) => {
        return map.layers[0].checked
      }
    );
    expect(layerCheck).toEqual(false);
  });

  test("Checking Context Menu Items Names In Order", async () => {
    await page.reload();
    let back = await page.$eval("div > div.mapml-contextmenu > button:nth-child(1)",(btn) => btn.textContent);
    expect(back).toEqual('Back (B)');
    let forward = await page.$eval("div > div.mapml-contextmenu > button:nth-child(2)",(btn) => btn.textContent);
    expect(forward).toEqual('Forward (F)');
    let reload = await page.$eval("div > div.mapml-contextmenu > button:nth-child(3)",(btn) => btn.textContent);
    expect(reload).toEqual('Reload (R)');
    let fullScreen = await page.$eval("div > div.mapml-contextmenu > button:nth-child(4)",(btn) => btn.textContent);
    expect(fullScreen).toEqual('View fullscreen (E)');
    let copy = await page.$eval("div > div.mapml-contextmenu > button:nth-child(6)",(btn) => btn.textContent);
    expect(copy).toEqual('Copy (C)');
    let paste = await page.$eval("div > div.mapml-contextmenu > button:nth-child(8)",(btn) => btn.textContent);
    expect(paste).toEqual('Paste (P)');
    let controls = await page.$eval("div > div.mapml-contextmenu > button:nth-child(10)",(btn) => btn.textContent);
    expect(controls).toEqual('Toggle Controls (T)');
    let debug = await page.$eval("div > div.mapml-contextmenu > button:nth-child(11)",(btn) => btn.textContent);
    expect(debug).toEqual('Toggle Debug Mode (D)');
    let source = await page.$eval("div > div.mapml-contextmenu > button:nth-child(12)",(btn) => btn.textContent);
    expect(source).toEqual('View Map Source (V)');
    let copySubMenu1 = await page.$eval("div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(1)",(btn) => btn.textContent);
    expect(copySubMenu1).toEqual('Map');
    let copySubMenu2 = await page.$eval("div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(2)",(btn) => btn.textContent);
    expect(copySubMenu2).toEqual('Extent');
    let copySubMenu3 = await page.$eval("div > div.mapml-contextmenu > div.mapml-contextmenu.mapml-submenu >button:nth-child(3)",(btn) => btn.textContent);
    expect(copySubMenu3).toEqual('Location');
  });

  test.only("Checking Context Menu Fullscreen Button", async () => {

    await page.click("body > map");
   
    await page.keyboard.press("Shift+F10");

    await page.keyboard.press("E");

    let fullScreen = await page.$eval("body > map",(map) =>  map._map.isFullscreen());

    expect(fullScreen).toEqual(true);
  });
});
