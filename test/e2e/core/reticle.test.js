describe("Playwright Keyboard Navigation + Query Layer Tests" , () => {
  beforeAll(async () => {
    await page.goto(PATH + "reticle.html");
  });

  afterAll(async function () {
    await context.close();
  });

  describe("Crosshair Reticle Tests", () => {
    test("Crosshair hidden onload, shows on focus", async () => {
      const beforeFocus = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
      await expect(beforeFocus).toEqual("hidden");
      await page.focus("mapml-viewer >> css= div.leaflet-container")
      await page.keyboard.press("ArrowUp");
      const afterFocus = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
      await expect(afterFocus).toEqual("");
    });

    test("Crosshair remains on map move with arrow keys", async () => {
      await page.keyboard.press("ArrowUp");
      await page.waitForTimeout(1000);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(1000);
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(1000);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(1000);
      const afterMove = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
      await expect(afterMove).toEqual("");
    });

    test("Crosshair shows on esc but hidden on tab out", async () => {
      await page.keyboard.press("Escape");
      const afterEsc = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
      await page.focus("mapml-viewer >> css= div.leaflet-container")
      await page.keyboard.press("ArrowUp");

      await page.keyboard.press("Tab");
      const afterTab = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

      await expect(afterEsc).toEqual("");
      await expect(afterTab).toEqual("hidden");
    });

    test("Crosshair hidden when queryable layer is unselected, shows on reselect", async () => {
      await page.focus("mapml-viewer >> css= div.leaflet-container")
      await page.keyboard.press("ArrowUp");
      await page.evaluateHandle(() => document.querySelector("layer-").removeAttribute("checked"));
      const afterUncheck = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

      await page.evaluateHandle(() => document.querySelector("layer-").setAttribute("checked", ""));
      const afterCheck = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

      await expect(afterUncheck).toEqual("hidden");
      await expect(afterCheck).toEqual("");
    });
  });
});