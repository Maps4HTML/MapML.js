const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

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

  for (const browserType of BROWSER) {
    describe(
      "Playwright mapml-viewer Context Menu (and api) Tests in " + browserType,
      () => {
        beforeAll(async () => {
          browser = await playwright[browserType].launch({
            headless: ISHEADLESS,
            slowMo: 50,
          });
          context = await browser.newContext();
          page = await context.newPage();
          if (browserType === "firefox") {
            await page.waitForNavigation();
          }
          await page.goto(PATH + "mapml-viewer.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Context menu focus on keyboard shortcut", async () => {
          await page.click("body > mapml-viewer");
          await page.keyboard.press("Shift+F10");
          const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
          const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
          let name = await nameHandle.jsonValue();
          await nameHandle.dispose();
          expect(name).toEqual("Back (B)");
        });

        test("[" + browserType + "]" + " Context menu tab goes to next item", async () => {
          await page.keyboard.press("Tab");
          const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
          const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
          let name = await nameHandle.jsonValue();
          await nameHandle.dispose();
          expect(name).toEqual("Forward (F)");
        });

        test("[" + browserType + "]" + " Submenu opens on C with focus on first item", async () => {
          await page.keyboard.press("c");
          await page.keyboard.press("Tab");
          const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
          const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
          let name = await nameHandle.jsonValue();
          await nameHandle.dispose();
          expect(name).toEqual("tile");
        });

        test("[" + browserType + "]" + " Context menu displaying on map", async () => {
          await page.click("body > mapml-viewer", { button: "right" });
          const contextMenu = await page.$eval(
            "div > div.mapml-contextmenu",
            (menu) => menu.style.display
          );
          expect(contextMenu).toEqual("block");
        });
        test("[" + browserType + "]" + " Context menu, back item", async () => {
          await page.$eval(
            "body > mapml-viewer",
            (map) => map.zoomTo(81, -63, 1)
          );
          await page.waitForTimeout(1000);
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(1)");
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
        test("[" + browserType + "]" + " Context menu, back item at intial location", async () => {
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(1)");
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
        test("[" + browserType + "]" + " Context menu, forward item", async () => {
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(2)");
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
        test("[" + browserType + "]" + " Context menu, forward item at most recent location", async () => {
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(2)");
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

        describe("Context Menu, Toggle Controls " + browserType, () => {
          test("[" + browserType + "]" + " Context menu, toggle controls off", async () => {
            const controlsOn = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
              (controls) => controls.childElementCount
            );

            await page.click("body > mapml-viewer", { button: "right" });
            await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

            const controlsOff = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
              (controls) => controls.childElementCount
            );

            expect(controlsOn).toEqual(3);
            expect(controlsOff).toEqual(0);
          });

          test("[" + browserType + "]" + " Context menu, toggle controls on", async () => {
            const controlsOn = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
              (controls) => controls.childElementCount
            );

            await page.click("body > mapml-viewer", { button: "right" });
            await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

            const controlsOff = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
              (controls) => controls.childElementCount
            );

            expect(controlsOn).toEqual(0);
            expect(controlsOff).toEqual(3);
          });

          test("[" + browserType + "]" + " Context menu, toggle controls after changing opacity", async () => {
            await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
            await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details",
              (div) => div.open = true
            );
            await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details",
              (div) => div.open = true
            );
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input");
            const valueBefore = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input",
              (opacity) => opacity.value
            );
            expect(valueBefore).toEqual("0.5");

            await page.click("body > mapml-viewer", { button: "right" });
            await page.click("div > div.mapml-contextmenu > a:nth-child(5)");
            await page.click("body > mapml-viewer", { button: "right" });
            await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

            const valueAfter = await page.$eval(
              "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input",
              (opacity) => opacity.value
            );

            expect(valueAfter).toEqual("0.5");
          });
        });

        test("[" + browserType + "]" + " Submenu, copy all coordinate systems using tab + enter to access", async () => {
          await page.click("body > mapml-viewer");
          await page.keyboard.press("Shift+F10");
          for (let i = 0; i < 4; i++)
            await page.keyboard.press("Tab");

          await page.keyboard.press("Enter");

          await page.click("#mapml-copy-submenu > a:nth-child(10)");

          await page.click("body > textarea");
          await page.keyboard.press("Control+v");
          const copyValue = await page.$eval(
            "body > textarea",
            (text) => text.value
          );
          let expected = "z:1\n";
          expected += "tile: i:30, j:50\n";
          expected += "tilematrix: column:6.1171875000000036, row:6.195312500000004\n";
          expected += "map: i:250, j:300\n";
          expected += "tcrs: x:1566.000000000001, y:1586.0000000000011\n";
          expected += "pcrs: easting:562957.9375158995, northing:3641449.4962322935\n";
          expected += "gcrs: lon :-62.72946572940102, lat:80.88192121974802";

          expect(copyValue).toEqual(expected);
        });

        test("[" + browserType + "]" + " Submenu, copy all coordinate systems", async () => {
          await page.click("body > mapml-viewer");
          await page.keyboard.press("Shift+F10");
          await page.keyboard.press("c");

          await page.click("#mapml-copy-submenu > a:nth-child(10)");

          await page.click("body > textarea");
          await page.keyboard.press("Control+a");
          await page.keyboard.press("Backspace");
          await page.keyboard.press("Control+v");
          const copyValue = await page.$eval(
            "body > textarea",
            (text) => text.value
          );
          let expected = "z:1\n";
          expected += "tile: i:30, j:50\n";
          expected += "tilematrix: column:6.1171875000000036, row:6.195312500000004\n";
          expected += "map: i:250, j:300\n";
          expected += "tcrs: x:1566.000000000001, y:1586.0000000000011\n";
          expected += "pcrs: easting:562957.9375158995, northing:3641449.4962322935\n";
          expected += "gcrs: lon :-62.72946572940102, lat:80.88192121974802";

          expect(copyValue).toEqual(expected);
        });
      }
    );
  }
})();