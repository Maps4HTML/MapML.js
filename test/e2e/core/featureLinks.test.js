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
        const layers = await page.evaluate(`document.querySelectorAll('layer-').length`);
        await expect(layers).toEqual(2);
      });

      test("Sub-point inplace link adds new layer, parent feature has separate link", async () => {
        await page.goto(PATH + "featureLinks.html");
        const initialLayerCount = await page.evaluate(`document.querySelectorAll('layer-').length`);
        await expect(initialLayerCount).toEqual(1);
        await page.click("body > map");
        for(let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab"); 
          await page.waitForTimeout(200);
        }
        const extentBeforeLink = await page.$eval(
          "body > map",
          (map) => map.extent
        );
        // activate link from id="tabstop-six", is supposed to be added to top of map
        await page.keyboard.press("Enter");
        const layerName = await page.evaluate(`document.querySelectorAll('layer-')[1].label`);
        const layers = await page.evaluate(`document.querySelectorAll('layer-').length`);
        await expect(layers).toEqual(2);
        await expect(layerName).toEqual("Fire Danger (forecast)");
        const extentAfterLink = await page.$eval(
          "body > map",
          (map) => map.extent
        );
        await expect(extentAfterLink.topLeft.gcrs).toEqual(extentBeforeLink.topLeft.gcrs);
        await expect(extentAfterLink.bottomRight.gcrs).toEqual(extentBeforeLink.bottomRight.gcrs);
      });
    });
    describe("Main Part Link Tests", () => {
      test("Main part adds new layer", async () => {
        await page.goto(PATH + "featureLinks.html");
        await page.click("body > map");
        for(let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        const layers = await page.evaluate(`document.querySelectorAll('layer-').length`);
        await expect(layers).toEqual(2);
        const layerName = await page.evaluate(`document.querySelectorAll('layer-')[1].label`);
        await expect(layerName).toEqual("Canada Base Map - Geometry");
        const extent = await page.$eval(
          "body > map",
          (map) => map.extent
        );
        await expect(extent.topLeft.gcrs).toEqual({horizontal:-129.071567338887, vertical:36.4112695268206});
        await expect(extent.bottomRight.gcrs).toEqual({horizontal:26.18468754289824, vertical:2.850936151427951});
      });
    });
  });