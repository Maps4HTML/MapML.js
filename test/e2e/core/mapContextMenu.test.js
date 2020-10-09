const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {

  //expected topLeft values in the different cs, at the different
  //positions the map goes in
  let expectedPCRS = [
    { horizontal: -5537023.0124460235, vertical: 2671749.64016594 },
    { horizontal: -2810486.309372615, vertical: 5328171.619676568 }];
  let expectedGCRS = [
    { horizontal: -134.50882532096858, vertical: 34.758856143866666 },
    { horizontal: -146.23778791492126, vertical: 54.997129539321016 }];
  let expectedFirstTileMatrix = [
    { horizontal: 2.96484375, vertical: 3.7304687500000004 },
    { horizontal: 3.242456896551724, vertical: 3.4599946120689657 }];
  let expectedFirstTCRS = [
    { horizontal: 759, vertical: 955.0000000000001 },
    { horizontal: 830.0689655172414, vertical: 885.7586206896552 }];

  for (const browserType of BROWSER) {
    describe(
      "Playwright Map Context Menu Tests in " + browserType,
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
          await page.goto(PATH + "mapElement.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        test("[" + browserType + "]" + " Context menu focus on keyboard shortcut", async () => {
          await page.click("body > map");
          await page.keyboard.press("Shift+F10");
          const aHandle = await page.evaluateHandle(() => document.querySelector(".web-map"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
          const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
          let name = await nameHandle.jsonValue();
          await nameHandle.dispose();
          expect(name).toEqual("Back (B)");
        });

        test("[" + browserType + "]" + " Context menu tab goes to next item", async () => {
          await page.keyboard.press("Tab");
          const aHandle = await page.evaluateHandle(() => document.querySelector(".web-map"));
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
          const aHandle = await page.evaluateHandle(() => document.querySelector(".web-map"));
          const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
          const resultHandle = await page.evaluateHandle(root => root.activeElement, nextHandle);
          const nameHandle = await page.evaluateHandle(name => name.outerText, resultHandle);
          let name = await nameHandle.jsonValue();
          await nameHandle.dispose();
          expect(name).toEqual("tile");
        });

        test("[" + browserType + "]" + " Context menu displaying on map", async () => {
          await page.click("body > map", { button: "right" });
          const contextMenu = await page.$eval(
            "div > div.mapml-contextmenu",
            (menu) => menu.style.display
          );
          expect(contextMenu).toEqual("block");
        });
        test("[" + browserType + "]" + " Context menu, back item", async () => {
          const mapMove = await page.$eval(
            "body > map",
            (map) => map.zoomTo(81, -63, 1)
          );
          await page.click("body > map", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(1)");
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
        test("[" + browserType + "]" + " Context menu, back item at intial location", async () => {
          await page.click("body > map", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(1)");
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
        test("[" + browserType + "]" + " Context menu, forward item", async () => {
          await page.click("body > map", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(2)");
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
        test("[" + browserType + "]" + " Context menu, forward item at most recent location", async () => {
          await page.click("body > map", { button: "right" });
          await page.click("div > div.mapml-contextmenu > a:nth-child(2)");
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

    describe("Context Menu, Toggle Controls " + browserType, () => {
      test("[" + browserType + "]" + " Context menu, toggle controls off", async () => {
        const controlsOn = await page.$eval(
          "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
          (controls) => controls.childElementCount
        );

        await page.click("body > map", { button: "right" });
        await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

        const controlsOff = await page.$eval(
          "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
          (controls) => controls.childElementCount
        );

        expect(controlsOn).toEqual(2);
        expect(controlsOff).toEqual(0);
      });

      test("[" + browserType + "]" + " Context menu, toggle controls on", async () => {
        const controlsOn = await page.$eval(
          "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
          (controls) => controls.childElementCount
        );

        await page.click("body > map", { button: "right" });
        await page.click("div > div.mapml-contextmenu > a:nth-child(5)");

        const controlsOff = await page.$eval(
          "div > div.leaflet-control-container > div.leaflet-top.leaflet-left",
          (controls) => controls.childElementCount
        );

        expect(controlsOn).toEqual(0);
        expect(controlsOff).toEqual(2);
      });

//      test("[" + browserType + "]" + " Context menu, toggle controls after changing opacity", async () => {
//        await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
//        await page.$eval(
//          "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details",
//          (div) => div.open = true
//        );
//        await page.$eval(
//          "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details",
//          (div) => div.open = true
//        );
//        await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input");
//        const valueBefore = await page.$eval(
//          "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input",
//          (opacity) => opacity.value
//        );
//        expect(valueBefore).toEqual("0.5");
//
//        await page.click("body > map", { button: "right" });
//        await page.click("div > div.mapml-contextmenu > a:nth-child(5)");
//        await page.click("body > map", { button: "right" });
//        await page.click("div > div.mapml-contextmenu > a:nth-child(5)");
//
//        const valueAfter = await page.$eval(
//          "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > details > details > input",
//          (opacity) => opacity.value
//        );
//
//        expect(valueAfter).toEqual("0.5");
//      });
    });

        test("[" + browserType + "]" + " Submenu, copy all coordinate systems", async () => {
          context = await browser.newContext();
          page = await context.newPage();
          if (browserType === "firefox") {
            await page.waitForNavigation();
          }
          await page.goto(PATH + "mapElement.html");
          await page.click("body > map");
          await page.keyboard.press("Shift+F10");
          await page.keyboard.press("c");

          await page.click("#mapml-copy-submenu > a:nth-child(10)");

          await page.click("body > textarea");
          await page.keyboard.press("Control+v");
          const copyValue = await page.$eval(
            "body > textarea",
            (text) => text.value
          );
          let expected = "z:0\n";
          expected += "tile: i:141, j:6\n";
          expected += "tilematrix: column:3.55078125, row:4.023437500000001\n";
          expected += "map: i:150, j:75\n";
          expected += "tcrs: x:909, y:1030.0000000000002\n";
          expected += "pcrs: easting:217675.99695199728, northing:-205599.8645330742\n";
          expected += "gcrs: lon :-92.15289674483756, lat:47.1142749003532";

          expect(copyValue).toEqual(expected);
        });
  }
    );
  }
})();