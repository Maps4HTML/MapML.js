const playwright = require("playwright");

jest.setTimeout(50000);
(async () => {

  for (const browserType of BROWSER) {
    let page, browser, context;
    describe(
      "Playwright Query Link Tests in " + browserType,
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
          await page.goto(PATH + "queryLink.html");
        });

        afterAll(async function () {
          await browser.close();
        });

        describe("Query Popup Tests in " + browserType, () => {

          test("[" + browserType + "]" + " Query link shows when within bounds", async () => {
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNum).toEqual(1);
          });

          test("[" + browserType + "]" + " Query link closes previous popup when new query made within bounds", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(9, -27, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNum).toEqual(1);
          });

          test("[" + browserType + "]" + " Query link does not show when out of bounds", async () => {
            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.078210, -9.010487, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div", { state: "hidden" });
            const popupNumRight = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-45.679787, -93.041053, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumBottom = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-37.399782, 177.152220, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumLeft = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            await page.evaluateHandle(() => document.querySelector("mapml-viewer").zoomTo(-32.240953, 94.969783, 0));
            await page.waitForTimeout(1000);
            await page.click("div");
            await page.waitForTimeout(1000);
            const popupNumTop = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);

            expect(popupNumRight).toEqual(0);
            expect(popupNumBottom).toEqual(0);
            expect(popupNumLeft).toEqual(0);
            expect(popupNumTop).toEqual(0);
          });
          test("[" + browserType + "]" + " Auto query on moveend", async () => {
            await page.reload()
            await page.click("div");

            await page.keyboard.press("Escape");
            await page.waitForTimeout(500);
            await page.keyboard.press("ArrowUp");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNum = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNum).toEqual(1);

            await page.keyboard.press("Escape");
            await page.waitForTimeout(1000);
            await page.keyboard.press("ArrowDown");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const popupNumTwo = await page.$eval("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane", (div) => div.childElementCount);
            expect(popupNumTwo).toEqual(1);
          });
        });
        describe("Queried Feature Tests in " + browserType, () => {
          test("[" + browserType + "]" + " First feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button");
            await page.click("div");
            await page.waitForSelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M259 279L263 279L264 281L265 285L266 286L266 287L266 287L267 287L266 288L266 288L266 288L266 289L266 290L267 291L266 291L260 292L260 293L260 293L260 294L261 294L260 294L260 294L259 294L259 293L259 293L259 294L259 294L258 294L257 289L257 283L257 280L257 280L259 279z");
            expect(popup).toEqual("Alabama");
          });

          test("[" + browserType + "]" + " Next feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M205 271L201 288L196 287L193 285L187 280L187 280L188 280L188 279L188 279L188 279L188 278L189 277L189 277L189 276L189 276L190 276L190 275L190 275L190 274L190 273L190 273L190 273L190 272L190 271L191 270L191 270L192 270L192 270L192 270L193 267L201 270L205 271z");
            expect(popup).toEqual("Arizona");
          });

          test("[" + browserType + "]" + " Previous feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(2)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M259 279L263 279L264 281L265 285L266 286L266 287L266 287L267 287L266 288L266 288L266 288L266 289L266 290L267 291L266 291L260 292L260 293L260 293L260 294L261 294L260 294L260 294L259 294L259 293L259 293L259 294L259 294L258 294L257 289L257 283L257 280L257 280L259 279z");
            expect(popup).toEqual("Alabama");
          });

          test("[" + browserType + "]" + " PCRS feature added + popup content updated ", async () => {
            for (let i = 0; i < 2; i++)
              await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M246 332L232 207L138 232L156 307z");
            expect(popup).toEqual("PCRS Test");
          });

          test("[" + browserType + "]" + " TCRS feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M292 285L352 287L355 321L307 315z");
            expect(popup).toEqual("TCRS Test");
          });

          test("[" + browserType + "]" + " Tilematrix feature added + popup content updated ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M307 185L395 185L395 273L307 273z");
            expect(popup).toEqual("TILEMATRIX Test");
          });
          test("[" + browserType + "]" + " Synthesized point, valid location ", async () => {
            await page.click("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > nav > button:nth-child(4)");
            const feature = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div:nth-child(5) > svg > g > g > path",
              (tile) => tile.getAttribute("d")
            );
            const popup = await page.$eval(
              "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane > div > div.leaflet-popup-content-wrapper > div > div > iframe",
              (iframe) => iframe.contentWindow.document.querySelector("h1").innerText
            );

            expect(feature).toEqual("M250 250 L237.5 220 C237.5 200, 262.5 200, 262.5 220 L250 250z");
            expect(popup).toEqual("No Geometry");
          });
        });
      });
  };
})();
