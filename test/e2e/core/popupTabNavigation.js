describe("Playwright Keyboard Navigation + Query Layer Tests" , () => {
  beforeAll(async () => {
    await page.goto(PATH + "popupTabNavigation.html");
  });

  afterAll(async function () {
    await context.close();
  });

  describe("Feature Popup Tab Navigation Tests", () => {
    test("Inline features popup focus order", async () => {
      await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button");
      await page.evaluateHandle(() => document.getElementById("vector").removeAttribute("checked"));
      await page.evaluateHandle(() => document.getElementById("query").removeAttribute("checked"));
      await page.click("body");
      await page.keyboard.press("Tab");

      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement, nh);
      const f = await (await page.evaluateHandle(elem => elem.className, rh)).jsonValue();

      await page.keyboard.press("Tab");
      const h2 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh2 = await page.evaluateHandle(doc => doc.shadowRoot, h2);
      const rh2 = await page.evaluateHandle(root => root.activeElement, nh2);
      const f2 = await (await page.evaluateHandle(elem => elem.tagName, rh2)).jsonValue();

      await page.keyboard.press("Tab");
      const h3 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh3 = await page.evaluateHandle(doc => doc.shadowRoot, h3);
      const rh3 = await page.evaluateHandle(root => root.activeElement, nh3);
      const f3 = await (await page.evaluateHandle(elem => elem.title, rh3)).jsonValue();

      await page.keyboard.press("Tab");
      const h4 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh4 = await page.evaluateHandle(doc => doc.shadowRoot, h4);
      const rh4 = await page.evaluateHandle(root => root.activeElement, nh4);
      const f4 = await (await page.evaluateHandle(elem => elem.title, rh4)).jsonValue();

      await page.keyboard.press("Tab");
      const h5 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh5 = await page.evaluateHandle(doc => doc.shadowRoot, h5);
      const rh5 = await page.evaluateHandle(root => root.activeElement, nh5);
      const f5 = await (await page.evaluateHandle(elem => elem.title, rh5)).jsonValue();

      await page.keyboard.press("Tab");
      const h6 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh6 = await page.evaluateHandle(doc => doc.shadowRoot, h6);
      const rh6 = await page.evaluateHandle(root => root.activeElement, nh6);
      const f6 = await (await page.evaluateHandle(elem => elem.title, rh6)).jsonValue();

      await page.keyboard.press("Tab");
      const h7 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh7 = await page.evaluateHandle(doc => doc.shadowRoot, h7);
      const rh7 = await page.evaluateHandle(root => root.activeElement, nh7);
      const f7 = await (await page.evaluateHandle(elem => elem.className, rh7)).jsonValue();

      await expect(f).toEqual("mapml-popup-content");
      await expect(f2.toUpperCase()).toEqual("A");
      await expect(f3).toEqual("Focus Map");
      await expect(f4).toEqual("Previous Feature");
      await expect(f5).toEqual("Next Feature");
      await expect(f6).toEqual("Focus Controls");
      await expect(f7).toEqual("leaflet-popup-close-button");
    });

    test("Tab to next feature after tabbing out of popup", async () => {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await expect(tooltipCount).toEqual(1);
      await expect(f).toEqual("M153 508L113 146L-161 220L-107 436z");
    });

    test("Shift + Tab to current feature while popup open", async () => {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await page.keyboard.press("Shift+Tab");
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await expect(tooltipCount).toEqual(1);
      await expect(f).toEqual("M153 508L113 146L-161 220L-107 436z");
    });

    test("Previous feature button focuses previous feature", async () => {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await expect(tooltipCount).toEqual(1);
      await expect(f).toEqual("M330 83L586 83L586 339L330 339z");
    });

    test("Next feature button focuses next feature", async () => {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter");
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

      await expect(tooltipCount).toEqual(1);
      await expect(f).toEqual("M285 373L460 380L468 477L329 459z");
    });

    test("Focus Controls focuses the first <button> child in control div", async () => {
      await page.click("body > mapml-viewer");
      await page.keyboard.press("Shift+F10");
      await page.keyboard.press("t");
      await page.click("body");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      for (let i = 0; i < 5; i++)
        await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement, nh);
      const f = await (await page.evaluateHandle(elem => elem.innerText, rh)).jsonValue();
      await expect(f).toEqual("Maps4HTML");
    });
  });
});