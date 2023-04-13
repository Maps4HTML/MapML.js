import { test, expect, chromium } from '@playwright/test';

test.describe("Playwright Keyboard Navigation + Query Layer Tests" , () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("popupTabNavigation.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe("Feature Popup Tab Navigation Tests", () => {
  test("Inline features popup focus order", async () => {
    await page.evaluateHandle(() => document.getElementById("vector").removeAttribute("checked"));
    await page.evaluateHandle(() => document.getElementById("query").removeAttribute("checked"));
    await page.click("body");
    await page.keyboard.press("Tab"); // focus map

    await page.keyboard.press("Tab"); // focus feature
    await page.keyboard.press("Enter");  // display popup with link in it
    const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
    const rh = await page.evaluateHandle(root => root.activeElement, nh);
    const f = await (await page.evaluateHandle(elem => elem.className, rh)).jsonValue();
    expect(f).toEqual("mapml-popup-content");

    await page.keyboard.press("Tab");  // focus link
    const h2 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh2 = await page.evaluateHandle(doc => doc.shadowRoot, h2);
    const rh2 = await page.evaluateHandle(root => root.activeElement, nh2);
    const f2 = await (await page.evaluateHandle(elem => elem.tagName, rh2)).jsonValue();
    expect(f2.toUpperCase()).toEqual("A");

    await page.keyboard.press("Tab"); // focus on |< affordance
    const h3 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh3 = await page.evaluateHandle(doc => doc.shadowRoot, h3);
    const rh3 = await page.evaluateHandle(root => root.activeElement, nh3);
    const f3 = await (await page.evaluateHandle(elem => elem.title, rh3)).jsonValue();
    expect(f3).toEqual("Focus Map");

    await page.keyboard.press("Tab"); // focus on < affordance
    const h4 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh4 = await page.evaluateHandle(doc => doc.shadowRoot, h4);
    const rh4 = await page.evaluateHandle(root => root.activeElement, nh4);
    const f4 = await (await page.evaluateHandle(elem => elem.title, rh4)).jsonValue();
    expect(f4).toEqual("Previous Feature");

    await page.keyboard.press("Tab"); // focus on > affordance
    const h5 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh5 = await page.evaluateHandle(doc => doc.shadowRoot, h5);
    const rh5 = await page.evaluateHandle(root => root.activeElement, nh5);
    const f5 = await (await page.evaluateHandle(elem => elem.title, rh5)).jsonValue();
    expect(f5).toEqual("Next Feature");

    await page.keyboard.press("Tab"); // focus on >| affordance
    const h6 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh6 = await page.evaluateHandle(doc => doc.shadowRoot, h6);
    const rh6 = await page.evaluateHandle(root => root.activeElement, nh6);
    const f6 = await (await page.evaluateHandle(elem => elem.title, rh6)).jsonValue();
    expect(f6).toEqual("Focus Controls");

    await page.keyboard.press("Tab"); // focus on X dismiss popup affordance
    const h7 = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh7 = await page.evaluateHandle(doc => doc.shadowRoot, h7);
    const rh7 = await page.evaluateHandle(root => root.activeElement, nh7);
    const f7 = await (await page.evaluateHandle(elem => elem.className, rh7)).jsonValue();
    expect(f7).toEqual("leaflet-popup-close-button");
  });

  test("Tab to next feature after tabbing out of popup", async () => {
    await page.keyboard.press("Escape"); // focus back on feature
    const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
    const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
    const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
    const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();
    expect(f).toEqual("M330 83L586 83L586 339L330 339z");
    await page.waitForTimeout(500);
    // that we have to do this to get the tooltip back is a bug #681
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    
    let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);
    
    expect(tooltipCount).toEqual(1); 
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

      let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual("M330 83L586 83L586 339L330 339z");
    });

    test("Previous feature button focuses previous feature", async () => {
      await page.keyboard.press("ArrowDown"); // focus next feature
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter"); // popup 
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus < affordance (previous feature)
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter"); // focus should fall on previous feature
      await page.waitForTimeout(500);
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual("M330 83L586 83L586 339L330 339z");
    });

    test("Tooltip appears after pressing esc key", async () => {
      await page.keyboard.press("Enter"); 
      await page.waitForTimeout(500);
      await page.keyboard.down("Escape"); // focus back on feature
      await page.keyboard.up("Escape");
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);
      expect(tooltipCount).toEqual(1);
      expect(f).toEqual("M330 83L586 83L586 339L330 339z");
    });

    test("Tooltip appears after pressing enter on close button", async () => {
      await page.keyboard.press("Enter"); // focus back into popup
      await page.keyboard.press("Tab"); 
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // focus on x button
      await page.keyboard.down("Enter"); // press x button
      await page.keyboard.up("Enter");
      await page.waitForTimeout(500);

      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);
      expect(tooltipCount).toEqual(1);
      expect(f).toEqual("M330 83L586 83L586 339L330 339z");
  
    });

    test("Next feature button focuses next feature", async () => {
      await page.keyboard.press("Enter"); // popup with link
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus link
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus < affordance
      await page.waitForTimeout(500);
      await page.keyboard.press("Tab"); // focus > affordance (next feature)
      await page.waitForTimeout(500);
      await page.keyboard.press("Enter"); // focus falls on next feature
      const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
      const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
      const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
      const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

      let tooltipCount = await page.$eval("mapml-viewer .leaflet-tooltip-pane", div => div.childElementCount);

      expect(tooltipCount).toEqual(1);
      expect(f).toEqual("M285 373L460 380L468 477L329 459z");
    });

    test("Focus Controls focuses the first <button> child in control div", async () => {
      await page.pause();
      await page.click("body > mapml-viewer");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
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
      expect(f).toEqual("Leaflet");
    });
  });
});
