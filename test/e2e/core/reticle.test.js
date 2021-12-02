describe("Playwright Keyboard Navigation + Query Layer Tests" , () => {
  beforeAll(async () => {
    await page.goto(PATH + "reticle.html");
  });

  afterAll(async function () {
    await context.close();
  });

  describe("Crosshair Reticle Tests", () => {
    test("Crosshair hidden onload, shows on focus", async () => {
      const beforeTabHidden = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));
      await page.keyboard.press("Tab");
      const afterTab = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));
      await expect(beforeTabHidden).toEqual("none");
      await expect(afterTab).toEqual("block");
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
      const afterMove = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));
      await expect(afterMove).toEqual("block");
    });

    test("Crosshair shows on esc but hidden on tab out", async () => {
      await page.keyboard.press("Escape");
      const afterEsc = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));
      await page.click("body");
      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowUp");

      await page.keyboard.press("Tab");
      const afterTab = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));

      await expect(afterEsc).toEqual("block");
      await expect(afterTab).toEqual("none");
    });

    test("Crosshair hidden when queryable layer is unselected, shows on reselect", async () => {
      await page.click("body");
      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowUp");
      await page.evaluateHandle(() => document.querySelector("layer-").removeAttribute("checked"));
      const afterUncheck = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));

      await page.evaluateHandle(() => document.querySelector("layer-").setAttribute("checked", ""));
      const afterCheck = await page.$eval("div > div.mapml-crosshair", (div) => window.getComputedStyle(div).getPropertyValue("display"));

      await expect(afterUncheck).toEqual("none");
      await expect(afterCheck).toEqual("block");
    });
  });
});
