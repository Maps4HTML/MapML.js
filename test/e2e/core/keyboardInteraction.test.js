const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright Keyboard Navigation + Query Layer Tests in " + browserType,
      () => {
        beforeAll(async () => {
          browser = await playwright[browserType].launch({
            headless: ISHEADLESS,
            slowMo: 50,
          });
          context = await browser.newContext();
          page = await context.newPage();
          if (browserType === "firefox") {
            await page.waitForNavigation();
          }
          await page.goto(PATH + "keyboardInteraction.html");
        });

        afterAll(async function () {
          await browser.close();
        });
        describe("Crosshair Tests in " + browserType, () => {
          test("[" + browserType + "]" + " Crosshair hidden onload, shows on focus", async () => {
            const beforeTabHidden = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
            await page.keyboard.press("Tab");
            const afterTab = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
            expect(beforeTabHidden).toEqual("hidden");
            expect(afterTab).toEqual("");
          });

          test("[" + browserType + "]" + " Crosshair remains on map move with arrow keys", async () => {
            await page.keyboard.press("ArrowUp");
            await page.waitForTimeout(500);
            await page.keyboard.press("ArrowDown");
            await page.waitForTimeout(500);
            await page.keyboard.press("ArrowLeft");
            await page.waitForTimeout(500);
            await page.keyboard.press("ArrowRight");
            await page.waitForTimeout(500);
            const afterMove = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
            expect(afterMove).toEqual("");
          });

          test("[" + browserType + "]" + " Crosshair shows on esc but hidden on tab out", async () => {
            await page.keyboard.press("Escape");
            const afterEsc = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);
            await page.click("body");
            await page.keyboard.press("Tab");
            await page.keyboard.press("ArrowUp");

            await page.keyboard.press("Tab");
            const afterTab = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

            expect(afterEsc).toEqual("");
            expect(afterTab).toEqual("hidden");
          });

          test("[" + browserType + "]" + " Crosshair hidden when queryable layer is unselected, shows on reselect", async () => {
            await page.click("body");
            await page.keyboard.press("Tab");
            await page.keyboard.press("ArrowUp");
            await page.evaluateHandle(() => document.querySelector("layer-").removeAttribute("checked"));
            const afterUncheck = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

            await page.evaluateHandle(() => document.querySelector("layer-").setAttribute("checked", ""));
            const afterCheck = await page.$eval("div > div.mapml-crosshair", (div) => div.style.visibility);

            expect(afterUncheck).toEqual("hidden");
            expect(afterCheck).toEqual("");
          });
        });
        describe("Tab Navigable Tests in " + browserType, () => {
          test("[" + browserType + "]" + " Tab focuses inline features", async () => {
            await page.click("body");
            await page.keyboard.press("Tab");

            await page.keyboard.press("Tab");
            const aHandle = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nextHandle = await page.evaluateHandle(doc => doc.shadowRoot, aHandle);
            const resultHandle = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandle);
            const focused = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandle)).jsonValue();

            let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            await page.keyboard.press("Tab");
            const aHandleNext = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nextHandleNext = await page.evaluateHandle(doc => doc.shadowRoot, aHandleNext);
            const resultHandleNext = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nextHandleNext);
            const focusedNext = await (await page.evaluateHandle(elem => elem.getAttribute("d"), resultHandleNext)).jsonValue();

            let tooltipCountNext = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            expect(tooltipCount).toEqual(1);
            expect(tooltipCountNext).toEqual(1);
            expect(focused).toEqual("M330 83L586 83L586 339L330 339z");
            expect(focusedNext).toEqual("M153 508L113 146L-161 220L-107 436z");
          });

          test("[" + browserType + "]" + " Tab focuses fetched features", async () => {
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

            expect(focused).toEqual("M190 357L203 355L206 363L209 374L211 376L212 377L212 378L213 379L211 380L212 381L211 383L212 386L212 388L213 391L210 391L193 393L193 395L195 396L195 398L195 398L194 400L193 400L191 399L191 397L190 397L189 398L189 400L187 400L185 386L185 368L185 358L184 357L190 357z");
            expect(focusedNext).toEqual("M-30 139L-29 138L-29 139L-30 140L-31 140L-30 139z");
          });
        });

        describe("Feature Popup Tab Navigation Tests in " + browserType, () => {
          test("[" + browserType + "]" + " Inline features popup focus order", async () => {
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

            expect(f).toEqual("mapml-popup-content");
            expect(f2.toUpperCase()).toEqual("A");
            expect(f3).toEqual("Focus Map");
            expect(f4).toEqual("Previous Feature");
            expect(f5).toEqual("Next Feature");
            expect(f6).toEqual("Focus Controls");
            expect(f7).toEqual("leaflet-popup-close-button");
          });

          test("[" + browserType + "]" + " Tab to next feature after tabbing out of popup", async () => {
            await page.keyboard.press("Tab");

            const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
            const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
            const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

            let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            expect(tooltipCount).toEqual(1);
            expect(f).toEqual("M153 508L113 146L-161 220L-107 436z");
          });

          test("[" + browserType + "]" + " Shift + Tab to current feature while popup open", async () => {
            await page.keyboard.press("Enter");
            await page.keyboard.press("Shift+Tab");

            const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
            const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
            const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

            let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            expect(tooltipCount).toEqual(1);
            expect(f).toEqual("M153 508L113 146L-161 220L-107 436z");
          });

          test("[" + browserType + "]" + " Previous feature button focuses previous feature", async () => {
            await page.keyboard.press("Enter");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
            const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
            const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

            let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            expect(tooltipCount).toEqual(1);
            expect(f).toEqual("M330 83L586 83L586 339L330 339z");
          });

          test("[" + browserType + "]" + " Next feature button focuses next feature", async () => {
            await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            const h = await page.evaluateHandle(() => document.querySelector("mapml-viewer"));
            const nh = await page.evaluateHandle(doc => doc.shadowRoot, h);
            const rh = await page.evaluateHandle(root => root.activeElement.querySelector(".leaflet-interactive"), nh);
            const f = await (await page.evaluateHandle(elem => elem.getAttribute("d"), rh)).jsonValue();

            let tooltipCount = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tooltip-pane", div => div.childElementCount);

            expect(tooltipCount).toEqual(1);
            expect(f).toEqual("M285 373L460 380L468 477L329 459z");
          });

          test("[" + browserType + "]" + " Focus Controls focuses the first <a> child in control div", async () => {
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
            expect(f).toEqual("Maps4HTML");
          });
        });
      }
    );
  }
})();