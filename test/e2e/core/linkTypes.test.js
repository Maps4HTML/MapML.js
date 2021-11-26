describe("Playwright Feature Links Tests", () => {
    beforeAll(async () => {
      await page.goto(PATH + "featureLinks.html");
    });

    afterAll(async function () {
      await context.close();
    });

    describe("HTML Link Type Tests", () => {
      test("HTML _self target navigates to new page", async () => {
        await page.click("body > map");
        for(let i = 0; i < 7; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        const url = await page.url();
        await expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/");
      });
      test("HTML _top target point navigates to new page", async () => {
        await page.goBack();
        await page.waitForTimeout(1000);
        await page.click("body > map");
        for(let i = 0; i < 8; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        const url = await page.url();
        await expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/fdi/");
      });
      test("HTML _parent target point navigates to new page", async () => {
        await page.goBack();
        await page.waitForTimeout(1000);
        await page.click("body > map");
        for(let i = 0; i < 9; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        const url = await page.url();
        await expect(url).toEqual("http://geogratis.gc.ca/mapml/en/cbmtile/cbmtgeom/");
      });
      test("HTML _blank target projection negotiation with hash", async () => {
        await page.goBack();
        await page.waitForTimeout(1000);
        await page.click("body > map");
        for(let i = 0; i < 11; i++) {
          await page.keyboard.press("Tab");
          await page.waitForTimeout(200);
        }
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        const extent = await page.$eval(
          "body > map",
          (map) => map.extent
        );
        await expect(extent.topLeft.gcrs).toEqual({horizontal:-118.38250407225894, vertical:54.364895138267244});
        await expect(extent.bottomRight.gcrs).toEqual({horizontal:-41.67362559864071, vertical:7.463862967414659});
      });
    });
  });