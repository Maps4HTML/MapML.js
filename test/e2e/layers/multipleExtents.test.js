
    describe("Adding and Removing Multiple Extents", () => {

        beforeAll(async () => {
            await page.goto(PATH + "multipleExtents.html");
        });

        test("Both extents display on map and layer control", async () => {
            const cbmtExtent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div > div", (div) => div.childElementCount);
            const alabamaExtent = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.childElementCount);
            const cbmtLabel = await page.$eval("css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div:nth-child(3) > fieldset > div:nth-child(2) > fieldset > fieldset > div > label > span", (label) => label.innerText);
            const alabamaLabel = await page.$eval("css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div:nth-child(3) > fieldset > div:nth-child(2) > fieldset > fieldset:nth-child(2) > div > label > span", (label) => label.innerText);
            await expect(cbmtExtent).toEqual(9);
            await expect(alabamaExtent).toEqual(1);
            await expect(cbmtLabel).toEqual("cbmt");
            await expect(alabamaLabel).toEqual("alabama_feature");
        });

        test("Changing opacity, removing and adding for CBMT extent", async () => {
            await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button");
            await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details",
                            (div) => div.open = true);
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]");

            await page.click("css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div:nth-child(3) > fieldset > div:nth-child(2) > fieldset > fieldset > div > label > input");
            let templates = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div", (div) => div.childElementCount);
            let alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container", (div) => div.className);
            await expect(templates).toEqual(4);
            await expect(alabama).toEqual("leaflet-layer mapml-templatedlayer-container");

            await page.click("css=body > mapml-viewer >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div:nth-child(3) > fieldset > div:nth-child(2) > fieldset > fieldset > div > label > input");
            templates = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div", (div) => div.childElementCount);
            alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div", (div) => div.className);
            const cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.className);
            const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            await expect(templates).toEqual(5);
            await expect(alabama).toEqual("leaflet-layer mapml-features-container");
            await expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");
            await expect(layerOpacity).toEqual("1");
            await expect(cbmtOpacity).toEqual("0.5");
            await expect(alabamaOpacity).toEqual("1");
        });

        test("Changing opacity, removing and adding for alabama extent", async () => {
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > div > button.mapml-layer-item-settings-control.mapml-button");
            await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details",
                            (div) => div.open = true);
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]");

            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
            let templates = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div", (div) => div.childElementCount);
            let cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div", (div) => div.className);
            await expect(templates).toEqual(4);
            await expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");

            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
            templates = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div", (div) => div.childElementCount);
            cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div", (div) => div.className);
            const alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.className);
            const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            await expect(templates).toEqual(5);
            await expect(alabama).toEqual("leaflet-layer mapml-features-container");
            await expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");
            await expect(layerOpacity).toEqual("1");
            await expect(cbmtOpacity).toEqual("0.5");
            await expect(alabamaOpacity).toEqual("0.5");
        });

        test("Changing opacity, removing and adding layer", async () => {
            await page.$eval( "div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details",
                            (div) => div.open = true);
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]");

            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-properties > label > input[type=checkbox]");
            let templates = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane", (div) => div.childElementCount);
            await expect(templates).toEqual(0);

            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-properties > label > input[type=checkbox]");
            const cbmt = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(4) > div", (div) => div.className);
            const alabama = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div:nth-child(5) > div", (div) => div.className);
            const layerOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const cbmtOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            const alabamaOpacity = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-settings > details > input[type=range]", (opacity) => opacity.value);
            await expect(alabama).toEqual("leaflet-layer mapml-features-container");
            await expect(cbmt).toEqual("leaflet-layer mapml-templated-tile-container");
            await expect(layerOpacity).toEqual("0.5");
            await expect(cbmtOpacity).toEqual("0.5");
            await expect(alabamaOpacity).toEqual("0.5");
        });

      });


      describe("Multiple Extents Bounds Tests", () => {
        beforeAll(async () => {
          await page.goto(PATH + "multipleExtents.html");
        });
    
        afterAll(async function () {
          await context.close();
        });

        test("Both Extent Bounds and Layer Bounds show up", async () => {
            await page.$eval(
                "body > mapml-viewer",
                (map) => map.toggleDebug());
            
            const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
            const layerBound1 = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
                (tile) => tile.getAttribute("d"));
            const cbmtBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
                (tile) => tile.getAttribute("d"));
            const layerBound2 = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
                (tile) => tile.getAttribute("d"));
            const alabamaBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(5)",
                (tile) => tile.getAttribute("d"));

            await expect(numBounds).toEqual(5);
            await expect(layerBound1).toEqual("M-236.5999999999999 613.3302389297928L531.4000000000001 613.3302389297928L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
            await expect(cbmtBound).toEqual("M-236.5999999999999 334.00000000000045L531.4000000000001 334.00000000000045L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
            await expect(layerBound2).toEqual("M-236.5999999999999 613.3302389297928L531.4000000000001 613.3302389297928L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
            await expect(alabamaBound).toEqual("M346.1557472398199 613.3302389297928L483.3934682431727 613.3302389297928L483.3934682431727 250.27387360649664L346.1557472398199 250.27387360649664z");
        });

        test("New layer bounds when cbmt extent removed", async () => {
            await page.hover("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div > div > button:nth-child(2)");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > label > input[type=checkbox]");
            await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
            await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
            
            const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
            const layerBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
                (tile) => tile.getAttribute("d"));
            const alabamaBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
                (tile) => tile.getAttribute("d"));

            await expect(numBounds).toEqual(3);
            await expect(layerBound).toEqual("M346.1557472398199 613.3302389297928L483.3934682431727 613.3302389297928L483.3934682431727 250.27387360649664L346.1557472398199 250.27387360649664z");
            await expect(alabamaBound).toEqual("M346.1557472398199 613.3302389297928L483.3934682431727 613.3302389297928L483.3934682431727 250.27387360649664L346.1557472398199 250.27387360649664z");
        });

        test("New layer bounds when alabama extent removed", async () => {
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1) > div.mapml-layer-item-properties > label > input[type=checkbox]");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
            await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
            await page.$eval("body > mapml-viewer", (map) => map.toggleDebug());
            
            const numBounds = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g", (g) => g.childElementCount);
            const layerBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
                (tile) => tile.getAttribute("d"));
            const cbmtBound = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
                (tile) => tile.getAttribute("d"));

            await expect(numBounds).toEqual(3);
            await expect(layerBound).toEqual("M-236.5999999999999 334.00000000000045L531.4000000000001 334.00000000000045L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
            await expect(cbmtBound).toEqual("M-236.5999999999999 334.00000000000045L531.4000000000001 334.00000000000045L531.4000000000001 -280.39999999999964L-236.5999999999999 -280.39999999999964z");
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2) > div.mapml-layer-item-properties > label > input[type=checkbox]");
        });

        test("CBMT is disabled in layer control when out of bounds", async () => {
            await page.click("div");
            for (let i = 0; i < 5; i++){
                await page.keyboard.press("ArrowDown");
                await page.waitForTimeout(200);
            }
            const cbmtdisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));
            const alabamaEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));
            const layerEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset", (extent) => extent.hasAttribute("disabled"));
                await page.keyboard.press("ArrowUp");
                await page.waitForTimeout(200);
            const cbmtEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));

            await expect(cbmtdisabled).toEqual(true);
            await expect(cbmtEnabled).toEqual(false);
            await expect(alabamaEnabled).toEqual(false);
            await expect(layerEnabled).toEqual(false);
        });

        test("Alabama is disabled in layer control when out of bounds", async () => {
            for (let i = 0; i < 2; i++){
                await page.keyboard.press("ArrowLeft");
                await page.waitForTimeout(200);
            }
            const alabamaDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));
            const cbmtEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));
            const layerEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset", (extent) => extent.hasAttribute("disabled"));
            for (let i = 0; i < 2; i++){
                await page.keyboard.press("ArrowRight");
                await page.waitForTimeout(200);
            }
            const alabamaEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));

            await expect(alabamaDisabled).toEqual(true);
            await expect(cbmtEnabled).toEqual(false);
            await expect(alabamaEnabled).toEqual(false);
            await expect(layerEnabled).toEqual(false);
        });

        test("Layer is disabled in layer control when out of bounds", async () => {
            for (let i = 0; i < 7; i++){
                await page.keyboard.press("ArrowRight");
                await page.waitForTimeout(200);
            }
            const alabamaDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));
            const cbmtDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));
            const layerDisabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset", (extent) => extent.hasAttribute("disabled"));
                await page.keyboard.press("ArrowLeft");
                await page.waitForTimeout(500);
            const alabamaEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(2)", (extent) => extent.hasAttribute("disabled"));
            const cbmtEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset > div.mapml-layer-item-settings > fieldset > fieldset:nth-child(1)", (extent) => extent.hasAttribute("disabled"));
            const layerEnabled = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset", (extent) => extent.hasAttribute("disabled"));

            await expect(alabamaDisabled).toEqual(true);
            await expect(cbmtDisabled).toEqual(true);
            await expect(layerDisabled).toEqual(true);
            await expect(alabamaEnabled).toEqual(false);
            await expect(cbmtEnabled).toEqual(false);
            await expect(layerEnabled).toEqual(false);
        });
    
      });