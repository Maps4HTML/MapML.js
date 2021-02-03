const playwright = require("playwright");
jest.setTimeout(30000);
(async () => {
  for (const browserType of BROWSER) {
    let page, browser, context;
    describe("UI Drag&Drop Test in " + browserType, () => {
      beforeEach(async () => {
        browser = await playwright[browserType].launch({
          headless: ISHEADLESS,
          slowMo: 50,
        });
        context = await browser.newContext();
        page = await context.newPage();
        if (browserType === "firefox") {
          await page.waitForNavigation();
        }
        await page.goto(PATH + "drag.html");
      });

      afterEach(async function () {
        await browser.close();
      });

      test("[" + browserType + "]" + " Drag and drop of invalid HTML page", async () => {
        const dataTransfer = await page.evaluateHandle(() =>
          new DataTransfer().setData("text/uri-list", "http://example.com")
        );
        await page.dispatchEvent(".leaflet-control-zoom-in", "dragstart", {
          dataTransfer,
        });

        await page.dispatchEvent("xpath=//html/body/map", "drop", {
          dataTransfer,
        });
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset");
        expect(vars.length).toBe(3);
      });

      test("[" + browserType + "]" + " Drag and drop of layers", async () => {
        await page.hover(".leaflet-top.leaflet-right");
        let control = await page.$("xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)");
        let controlBBox = await control.boundingBox();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(50, 50);
        await page.mouse.up();
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset");
        expect(vars.length).toBe(3);
      });

      test("[" + browserType + "]" + " Moving layer down one in control overlay", async () => {
        await page.hover(".leaflet-top.leaflet-right");
        let control = await page.$("xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1)");
        let controlBBox = await control.boundingBox();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) + 48);
        await page.mouse.up();
        await page.hover(".leaflet-top.leaflet-right");

        const controlText = await page.$eval(
          "xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > details > summary > label > span",
          (span) => span.innerText
        );
        const layerIndex = await page.$eval(
          "xpath=//html/body/map >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1)",
          (div) => div.style.zIndex
        );
        const domLayer = await page.$eval(
          "body > map > layer-:nth-child(4)",
          (div) => div.label
        );

        expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
        expect(layerIndex).toEqual("2");
        expect(controlText).toBe(" Canada Base Map - Transportation (CBMT)");
      });

      test("[" + browserType + "]" + " Moving layer up one in control overlay", async () => {
        await page.hover(".leaflet-top.leaflet-right");
        let control = await page.$("xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2)");
        let controlBBox = await control.boundingBox();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) - 48);
        await page.mouse.up();
        await page.hover(".leaflet-top.leaflet-right");

        const controlText = await page.$eval(
          "xpath=//html/body/map >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > details > summary > label > span",
          (span) => span.innerText
        );
        const layerIndex = await page.$eval(
          "xpath=//html/body/map >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2)",
          (div) => div.style.zIndex
        );
        const domLayer = await page.$eval(
          "body > map > layer-:nth-child(3)",
          (div) => div.label
        );

        expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
        expect(layerIndex).toEqual("1");
        expect(controlText).toBe(" Static MapML With Tiles");
      });

    });
  }
})();