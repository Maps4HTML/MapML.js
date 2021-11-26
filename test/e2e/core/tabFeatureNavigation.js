describe("Playwright Keyboard Navigation + Query Layer Tests" , () => {
  beforeAll(async () => {
    await page.goto(PATH + "tabFeatureNavigation.html");
  });

  afterAll(async function () {
    await context.close();
  });

  describe("Tab Navigable Tests", () => {
    test("Tab focuses inline features", async () => {
      await page.click("body");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
      const resultHandle = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandle);
      const focused = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandle)).jsonValue();

      let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      const aHandleNext = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nextHandleNext = await page.evaluateHandle(doc => doc.shadowRoot, aHandleNext);
      const resultHandleNext = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandleNext);
      const focusedNext = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandleNext)).jsonValue();

      let tooltipCountNext = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await expect(tooltipCount).toEqual(1);
      await expect(tooltipCountNext).toEqual(1);
      await expect(focused).toEqual("M330 83L586 83L586 339L330 339z");
      await expect(focusedNext).toEqual("M153 508L113 146L-161 220L-107 436z");
    });

    test("Tab focuses fetched features", async () => {
      await page.evaluateHandle(() => document.getElementById("vector").setAttribute("checked", ""));
      await page.click("body");
      await page.keyboard.press("Tab");

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
      const resultHandle = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandle);
      const focused = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandle)).jsonValue();

      await page.keyboard.press("Tab");
      const aHandleNext = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nextHandleNext = await page.evaluateHandle(doc => doc.shadowRoot, aHandleNext);
      const resultHandleNext = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandleNext);
      const focusedNext = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandleNext)).jsonValue();

      await expect(focused).toEqual("M190 357L203 355L206 363L209 374L211 376L212 377L212 378L213 379L211 380L212 381L211 383L212 386L212 388L213 391L210 391L193 393L193 395L195 396L195 398L195 398L194 400L193 400L191 399L191 397L190 397L189 398L189 400L187 400L185 386L185 368L185 358L184 357L190 357z");
      await expect(focusedNext).toEqual("M-30 139L-29 138L-29 139L-30 140L-31 140L-30 139z");
    });
  });

});