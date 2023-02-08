import { test, expect, chromium } from '@playwright/test';

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

// expected extent top-left and bottom-right value at different zoom levels (0 and 1)
let expectedExtentPCRS_0 = [
  {horizontal: -9373489.01871137, vertical: 11303798.154262971},
  {horizontal: 9808841.01261536, vertical: -11714997.883329108}
];
let expectedExtentPCRS_1 = [
  {horizontal: -5396793.565320458, vertical: 6520121.920243833},
  {horizontal: 5848020.590974525, vertical: -6973655.06731014}
];

test.describe("Playwright mapml-viewer Context Menu (and api) Tests", () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    page = await context.newPage();
    await page.goto("mapml-viewer.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Context menu focus on keyboard shortcut", async () => {
    await page.click("body > mapml-viewer");
    await page.keyboard.press("Shift+F10");
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Copy (C)");
  });

  test("Context menu tab goes to next item", async () => {
    await page.keyboard.press("Tab");
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Paste (P)");
  });


  test("Context menu shift + tab goes to previous item", async () => {
    await page.keyboard.press("Shift+Tab");
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Copy (C)");
  });

  test("Submenu opens on C with focus on first item", async () => {
    await page.keyboard.press("c");
    const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
    const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
    const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
    let name = await nameHandle.jsonValue();
    await nameHandle.dispose();
    expect(name).toEqual("Map");
  });

  test("Context menu displaying on map", async () => {
    await page.click("body > mapml-viewer", { button: "right" });
    const contextMenu = await page.$eval(
      "div > div.mapml-contextmenu",
      (menu) => window.getComputedStyle(menu).getPropertyValue("display")
    );
    expect(contextMenu).toEqual("block");
  });
  test("Context menu, back item", async () => {
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.zoomTo(81, -63, 1)
    );
    await page.waitForTimeout(1000);
    await page.click("body > mapml-viewer", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(1)");
    await page.waitForTimeout(1000);
    const extent = await page.$eval(
      "body > mapml-viewer",
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
    await page.click("body > mapml-viewer", { button: "right" });
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
    await page.click("body > mapml-viewer", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(2)");
    await page.waitForTimeout(1000);
    const extent = await page.$eval(
      "body > mapml-viewer",
      (map) => map.extent
    );

    expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
    expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
    expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
    expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
  });
  test("Context menu, forward item at most recent location disabled", async () => {
    await page.click("body > mapml-viewer", { button: "right" });
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

      await page.click("body > mapml-viewer", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-of-type(6)");

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

      await page.click("body > mapml-viewer", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-of-type(6)");

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
        (div) => div.open = true
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

      await page.click("body > mapml-viewer", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-child(5)");
      await page.click("body > mapml-viewer", { button: "right" });
      await page.click("div > div.mapml-contextmenu > button:nth-child(5)");

      const valueAfter = await page.$eval(
        "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div:nth-child(2) > details > input",
        (opacity) => opacity.value
      );

      expect(valueAfter).toEqual("0.5");
    });
  });

  test("Submenu, copy using tab + enter to access", async () => {
    await page.reload();
      let expected = "";
    const currDefCS = await page.$eval(
      "body > mapml-viewer",
      (map) => ({ext: map._map.contextMenu.defExtCS, loc: map._map.contextMenu.defLocCS})
    );
    // set cs to pcrs for copying extent test, gcrs for copying location test 
    for (let i = 0; i < 4; i++) {
      await page.click("body > mapml-viewer");
      // zoom in
      if (i === 2) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        await page.click("body > mapml-viewer");
      }
      await page.keyboard.press("Shift+F10");
      await page.$eval(
        "body > mapml-viewer",
        (map) => {
          map._map.contextMenu.defExtCS = 'pcrs';
          map._map.contextMenu.defLocCS = 'gcrs';
        }
      );
      await page.keyboard.press("Tab");
      if (i >= 2) {
        for (let k = 0; k < 2; k++) {
          await page.keyboard.press("Tab");
        }
      }

      await page.keyboard.press("Enter");

      for (let j = 0; j < i; j++) {
        if ((i === 2 && j === 1) || (i === 3 && j === 2)) {
          break;
        }
        await page.keyboard.press("Tab");
      }
      await page.keyboard.press("Enter");
      await page.click("body > textarea#coord");
      await page.keyboard.press("Control+v");
      const copyValue = await page.$eval(
        "body > textarea#coord",
        (text) => text.value
      );
      switch(i) {
        case 0: 
          expected = `<mapml-viewer style="height: 600px;width:500px;" projection="CBMTILE" zoom="0" lat="47" lon="-92" controls="" role="application">
    <layer- label="CBMT - INLINE" checked="">
      <map-extent units="CBMTILE" hidden="">
        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
        <map-link rel="tile" tref="/data/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
      </map-extent>
    </layer->
  </mapml-viewer>`;
          break;
        case 1:
          // first test for copying extent (zoom = 0)
          expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_0[0].horizontal}, top-left-northing=${expectedExtentPCRS_0[0].vertical}, bottom-right-easting=${expectedExtentPCRS_0[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_0[1].vertical}"></map-meta>`;
          break;
        case 2:
          // second test for copying extent (zoom = 1)
          expected = `<map-meta name="extent" content="top-left-easting=${expectedExtentPCRS_1[0].horizontal}, top-left-northing=${expectedExtentPCRS_1[0].vertical}, bottom-right-easting=${expectedExtentPCRS_1[1].horizontal}, bottom-right-northing=${expectedExtentPCRS_1[1].vertical}"></map-meta>`;
          break;
        case 3:
          expected = "lon :-92.062002, lat:46.922393";
          break;
        }
      expect(copyValue).toEqual(expected);
      await page.locator("body > textarea#coord").fill('');
    }
    await page.$eval(
      "body > mapml-viewer",
      (map, currDefCS) => {
        map._map.contextMenu.defExtCS = currDefCS.ext;
        map._map.contextMenu.defLocCS = currDefCS.loc;
      }, 
      currDefCS
    );
  });

  test("Context menu, All buttons enabled when fwd and back history present", async () => {
    await page.click("body > mapml-viewer");
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.zoomTo(81, -63, 3)
    );
    await page.waitForTimeout(1000);
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.zoomTo(81, -63, 5)
    );
    await page.waitForTimeout(1000);
    await page.click("body > mapml-viewer", { button: "right" });
    await page.click("div > div.mapml-contextmenu > button:nth-child(1)");
    await page.click("body > mapml-viewer", { button: "right" });
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
});
