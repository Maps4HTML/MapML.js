describe("Playwright Feature Links Tests", () => {
    beforeAll(async () => {
      await page.goto(PATH + "featureLinks.html");
    });

    afterAll(async function () {
      await context.close();
    });

    describe("Sub Part Link Tests", () => {
      test("Sub-point link adds new layer", async () => {
        for(let i = 0; i < 4; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        const layers = await page.$eval(
          "body > map",
          (map) => map.childElementCount
        );
        await expect(layers).toEqual(4);
      });

      test("Sub-point inplace link adds new layer, parent feature has separate link", async () => {
        await page.hover(".leaflet-top.leaflet-right");
        await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > div:nth-child(1) > div > button:nth-child(1)");
        await page.waitForTimeout(850);
        await page.click("body > map");
        for(let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        const extentBeforeLink = await page.$eval(
          "body > map",
          (map) => map.extent
        );
        await page.keyboard.press("Enter");
        const layers = await page.$eval(
          "body > map",
          (map) => map.childElementCount
        );
        await page.waitForTimeout(1000);
        const layerName = await page.$eval(
          "//html/body/map/layer-[2]",
          (layer) => layer.label
        )
        const extentAfterLink = await page.$eval(
          "body > map",
          (map) => map.extent
        );

        await expect(extentAfterLink.topLeft.gcrs).toEqual(extentBeforeLink.topLeft.gcrs);
        await expect(extentAfterLink.bottomRight.gcrs).toEqual(extentBeforeLink.bottomRight.gcrs);
        await expect(layers).toEqual(4);
        await expect(layerName).toEqual("Fire Danger (forecast)");
      });
    });
    describe("Main Part Link Tests", () => {
      test("Main part adds new layer", async () => {
        await page.hover(".leaflet-top.leaflet-right");
        await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(2) > div:nth-child(1) > div > button:nth-child(1)");
        await page.waitForTimeout(850);
        await page.click("body > map");
        for(let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        const layers = await page.$eval(
          "body > map",
          (map) => map.childElementCount
        );
        await page.waitForTimeout(1000);
        const layerName = await page.$eval(
          "//html/body/map/layer-[2]",
          (layer) => layer.label
        )
        const extent = await page.$eval(
          "body > map",
          (map) => map.extent
        );

        await expect(extent.topLeft.gcrs).toEqual({horizontal:-129.071567338887, vertical:36.4112695268206});
        await expect(extent.bottomRight.gcrs).toEqual({horizontal:26.18468754289824, vertical:2.850936151427951});
        await expect(layers).toEqual(4);
        await expect(layerName).toEqual("Canada Base Map - Geometry");
      });
    });
  });